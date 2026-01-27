/**
 * Email Sequence Processor
 *
 * Handles automated email sequences - sending emails based on triggers and schedules.
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { replaceTemplateVariables } from './template-variables'

export type TriggerType =
  | 'client_created'
  | 'package_purchased'
  | 'session_completed'
  | 'days_inactive'
  | 'membership_expiring'
  | 'manual'

interface ProcessSequencesResult {
  processed: number
  emailsSent: number
  completed: number
  errors: { enrollmentId: string; error: string }[]
}

/**
 * Process all due email sequence emails
 */
export async function processEmailSequences(
  tenantId?: string
): Promise<ProcessSequencesResult> {
  const now = new Date()
  const result: ProcessSequencesResult = {
    processed: 0,
    emailsSent: 0,
    completed: 0,
    errors: [],
  }

  // Find enrollments with due emails
  const dueEnrollments = await prisma.emailSequenceEnrollment.findMany({
    where: {
      ...(tenantId && { tenantId }),
      status: 'active',
      nextEmailAt: { lte: now },
    },
    include: {
      sequence: {
        include: {
          steps: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      },
      client: true,
    },
  })

  for (const enrollment of dueEnrollments) {
    try {
      const currentStepIndex = enrollment.currentStep
      const steps = enrollment.sequence.steps

      // Check if there are more steps
      if (currentStepIndex >= steps.length) {
        // Sequence completed
        await prisma.emailSequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'completed',
            completedAt: now,
          },
        })
        result.completed++
        continue
      }

      const currentStep = steps[currentStepIndex]

      // Check conditions if any
      if (currentStep.conditions) {
        const conditionsMet = await evaluateConditions(
          currentStep.conditions as Record<string, unknown>,
          enrollment.client.id,
          enrollment.tenantId
        )
        if (!conditionsMet) {
          // Skip this step
          const nextStepIndex = currentStepIndex + 1
          const nextStep = steps[nextStepIndex]
          const nextEmailAt = nextStep
            ? calculateNextEmailDate(now, nextStep.delayDays, nextStep.delayHours)
            : null

          await prisma.emailSequenceEnrollment.update({
            where: { id: enrollment.id },
            data: {
              currentStep: nextStepIndex,
              nextEmailAt,
            },
          })
          continue
        }
      }

      // Get tenant info for template variables
      const tenant = await prisma.tenant.findUnique({
        where: { id: enrollment.tenantId },
        include: {
          users: {
            where: { role: 'admin' },
            take: 1,
          },
        },
      })

      // Replace template variables
      const subject = replaceTemplateVariables(currentStep.subject, {
        client: enrollment.client,
        tenant,
      })

      const htmlContent = replaceTemplateVariables(currentStep.htmlContent, {
        client: enrollment.client,
        tenant,
      })

      // Create email record
      const emailRecord = await prisma.emailSequenceEmail.create({
        data: {
          enrollmentId: enrollment.id,
          stepOrder: currentStepIndex,
          status: 'pending',
        },
      })

      // Send email
      const emailResult = await sendEmail({
        to: enrollment.client.email,
        subject,
        html: htmlContent,
        text: currentStep.textContent || undefined,
      })

      if (emailResult.success) {
        // Update email record
        await prisma.emailSequenceEmail.update({
          where: { id: emailRecord.id },
          data: {
            status: 'sent',
            sentAt: now,
            resendId: emailResult.messageId,
          },
        })

        // Update enrollment
        const nextStepIndex = currentStepIndex + 1
        const nextStep = steps[nextStepIndex]
        const nextEmailAt = nextStep
          ? calculateNextEmailDate(now, nextStep.delayDays, nextStep.delayHours)
          : null

        await prisma.emailSequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            currentStep: nextStepIndex,
            emailsSent: { increment: 1 },
            nextEmailAt,
            ...(nextStepIndex >= steps.length && {
              status: 'completed',
              completedAt: now,
            }),
          },
        })

        result.emailsSent++
        if (nextStepIndex >= steps.length) {
          result.completed++
        }
      } else {
        // Mark email as failed
        await prisma.emailSequenceEmail.update({
          where: { id: emailRecord.id },
          data: {
            status: 'failed',
            error: emailResult.error,
          },
        })

        result.errors.push({
          enrollmentId: enrollment.id,
          error: emailResult.error || 'Email send failed',
        })
      }

      result.processed++
    } catch (error) {
      result.errors.push({
        enrollmentId: enrollment.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Enroll a client in a sequence
 */
export async function enrollClientInSequence(data: {
  sequenceId: string
  clientId: string
  tenantId: string
}): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  try {
    // Check if already enrolled
    const existing = await prisma.emailSequenceEnrollment.findUnique({
      where: {
        sequenceId_clientId: {
          sequenceId: data.sequenceId,
          clientId: data.clientId,
        },
      },
    })

    if (existing) {
      if (existing.status === 'completed' || existing.status === 'unsubscribed') {
        // Re-enroll
        const sequence = await prisma.emailSequence.findUnique({
          where: { id: data.sequenceId },
          include: { steps: { orderBy: { stepOrder: 'asc' }, take: 1 } },
        })

        if (!sequence || !sequence.isActive) {
          return { success: false, error: 'Sequence not found or inactive' }
        }

        const firstStep = sequence.steps[0]
        const nextEmailAt = firstStep
          ? calculateNextEmailDate(new Date(), firstStep.delayDays, firstStep.delayHours)
          : null

        const updated = await prisma.emailSequenceEnrollment.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            currentStep: 0,
            emailsSent: 0,
            enrolledAt: new Date(),
            nextEmailAt,
            completedAt: null,
          },
        })

        return { success: true, enrollmentId: updated.id }
      }

      return { success: false, error: 'Client already enrolled in this sequence' }
    }

    // Get sequence with first step
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: data.sequenceId },
      include: { steps: { orderBy: { stepOrder: 'asc' }, take: 1 } },
    })

    if (!sequence || !sequence.isActive) {
      return { success: false, error: 'Sequence not found or inactive' }
    }

    const firstStep = sequence.steps[0]
    const nextEmailAt = firstStep
      ? calculateNextEmailDate(new Date(), firstStep.delayDays, firstStep.delayHours)
      : null

    const enrollment = await prisma.emailSequenceEnrollment.create({
      data: {
        sequenceId: data.sequenceId,
        clientId: data.clientId,
        tenantId: data.tenantId,
        nextEmailAt,
      },
    })

    return { success: true, enrollmentId: enrollment.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll client',
    }
  }
}

/**
 * Pause enrollment
 */
export async function pauseEnrollment(enrollmentId: string, tenantId: string) {
  return prisma.emailSequenceEnrollment.update({
    where: {
      id: enrollmentId,
      tenantId,
    },
    data: {
      status: 'paused',
      nextEmailAt: null,
    },
  })
}

/**
 * Resume enrollment
 */
export async function resumeEnrollment(enrollmentId: string, tenantId: string) {
  const enrollment = await prisma.emailSequenceEnrollment.findFirst({
    where: { id: enrollmentId, tenantId },
    include: {
      sequence: {
        include: { steps: { orderBy: { stepOrder: 'asc' } } },
      },
    },
  })

  if (!enrollment) {
    throw new Error('Enrollment not found')
  }

  const currentStep = enrollment.sequence.steps[enrollment.currentStep]
  const nextEmailAt = currentStep
    ? calculateNextEmailDate(new Date(), currentStep.delayDays, currentStep.delayHours)
    : null

  return prisma.emailSequenceEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: 'active',
      nextEmailAt,
    },
  })
}

/**
 * Unsubscribe from enrollment
 */
export async function unsubscribeEnrollment(enrollmentId: string) {
  return prisma.emailSequenceEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: 'unsubscribed',
      nextEmailAt: null,
    },
  })
}

/**
 * Trigger sequences for an event
 */
export async function triggerSequences(
  tenantId: string,
  triggerType: TriggerType,
  clientId: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  // Find active sequences with this trigger
  const sequences = await prisma.emailSequence.findMany({
    where: {
      tenantId,
      triggerType,
      isActive: true,
    },
  })

  let enrolledCount = 0

  for (const sequence of sequences) {
    // Check trigger config if present
    if (sequence.triggerConfig) {
      const config = sequence.triggerConfig as Record<string, unknown>

      // Check days_inactive threshold
      if (triggerType === 'days_inactive' && config.inactiveDays) {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          include: {
            sessions: {
              where: { status: 'completed' },
              orderBy: { scheduledAt: 'desc' },
              take: 1,
            },
          },
        })

        if (client?.sessions[0]) {
          const daysSinceLastSession = Math.floor(
            (Date.now() - client.sessions[0].scheduledAt.getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceLastSession < (config.inactiveDays as number)) {
            continue // Not inactive long enough
          }
        }
      }
    }

    const result = await enrollClientInSequence({
      sequenceId: sequence.id,
      clientId,
      tenantId,
    })

    if (result.success) {
      enrolledCount++
    }
  }

  return enrolledCount
}

/**
 * Calculate next email date
 */
function calculateNextEmailDate(
  fromDate: Date,
  delayDays: number,
  delayHours: number
): Date {
  const nextDate = new Date(fromDate)
  nextDate.setDate(nextDate.getDate() + delayDays)
  nextDate.setHours(nextDate.getHours() + delayHours)
  return nextDate
}

/**
 * Evaluate conditions for a step
 */
async function evaluateConditions(
  conditions: Record<string, unknown>,
  clientId: string,
  tenantId: string
): Promise<boolean> {
  // Example conditions:
  // { hasActivePackage: true, creditsRemaining: { gte: 1 } }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) return false

  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'hasActivePackage':
        const hasPackage = client.membershipExpiry
          ? client.membershipExpiry > new Date()
          : false
        if (hasPackage !== value) return false
        break

      case 'creditsRemaining':
        if (typeof value === 'object' && value !== null) {
          const v = value as { gte?: number; lte?: number; gt?: number; lt?: number }
          if (v.gte !== undefined && client.creditsRemaining < v.gte) return false
          if (v.lte !== undefined && client.creditsRemaining > v.lte) return false
          if (v.gt !== undefined && client.creditsRemaining <= v.gt) return false
          if (v.lt !== undefined && client.creditsRemaining >= v.lt) return false
        }
        break

      case 'status':
        if (client.status !== value) return false
        break
    }
  }

  return true
}
