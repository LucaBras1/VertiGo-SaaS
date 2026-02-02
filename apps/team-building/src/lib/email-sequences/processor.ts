/**
 * Email Sequence Processor
 * Processes and sends scheduled emails
 */

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { processTemplate } from './templates'

export interface ProcessResult {
  processed: number
  sent: number
  failed: number
  completed: number
}

/**
 * Process all pending emails that are due to be sent
 */
export async function processEmailSequences(): Promise<ProcessResult> {
  const now = new Date()
  let processed = 0
  let sent = 0
  let failed = 0
  let completed = 0

  // Find enrollments with emails due
  const enrollments = await prisma.emailSequenceEnrollment.findMany({
    where: {
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
      customer: true,
    },
  })

  for (const enrollment of enrollments) {
    processed++

    try {
      const { sequence, customer } = enrollment
      const currentStepIndex = enrollment.currentStep
      const step = sequence.steps[currentStepIndex]

      if (!step) {
        // No more steps, mark as completed
        await prisma.emailSequenceEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: 'completed',
            completedAt: now,
            nextEmailAt: null,
          },
        })
        completed++
        continue
      }

      // Process template variables
      const html = processTemplate(step.htmlContent, {
        customer,
        sequence,
      })
      const subject = processTemplate(step.subject, {
        customer,
        sequence,
      })

      // Send email
      const result = await sendEmail({
        to: customer.email,
        subject,
        html,
        text: step.textContent || undefined,
      })

      // Record the email
      await prisma.emailSequenceEmail.create({
        data: {
          enrollmentId: enrollment.id,
          stepOrder: step.stepOrder,
          sentAt: result.success ? now : null,
          status: result.success ? 'sent' : 'failed',
          resendId: result.success ? result.messageId : undefined,
        },
      })

      if (result.success) {
        sent++

        // Move to next step
        const nextStepIndex = currentStepIndex + 1
        const nextStep = sequence.steps[nextStepIndex]

        if (nextStep) {
          // Calculate next email time
          const nextEmailAt = new Date()
          nextEmailAt.setDate(nextEmailAt.getDate() + nextStep.delayDays)
          nextEmailAt.setHours(nextEmailAt.getHours() + nextStep.delayHours)

          await prisma.emailSequenceEnrollment.update({
            where: { id: enrollment.id },
            data: {
              currentStep: nextStepIndex,
              nextEmailAt,
              emailsSent: { increment: 1 },
            },
          })
        } else {
          // No more steps, mark as completed
          await prisma.emailSequenceEnrollment.update({
            where: { id: enrollment.id },
            data: {
              status: 'completed',
              completedAt: now,
              nextEmailAt: null,
              emailsSent: { increment: 1 },
            },
          })
          completed++
        }
      } else {
        failed++
        console.error(`Failed to send email for enrollment ${enrollment.id}:`, result.error)
      }
    } catch (error) {
      failed++
      console.error(`Error processing enrollment ${enrollment.id}:`, error)
    }
  }

  return { processed, sent, failed, completed }
}

/**
 * Get statistics for a sequence
 */
export async function getSequenceStats(sequenceId: string) {
  const [totalEnrollments, activeEnrollments, completedEnrollments, totalEmailsSent, emailStats] = await Promise.all([
    prisma.emailSequenceEnrollment.count({ where: { sequenceId } }),
    prisma.emailSequenceEnrollment.count({ where: { sequenceId, status: 'active' } }),
    prisma.emailSequenceEnrollment.count({ where: { sequenceId, status: 'completed' } }),
    prisma.emailSequenceEmail.count({
      where: {
        enrollment: { sequenceId },
        status: 'sent',
      },
    }),
    prisma.emailSequenceEmail.groupBy({
      by: ['status'],
      where: {
        enrollment: { sequenceId },
      },
      _count: true,
    }),
  ])

  const stats = emailStats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    },
    {} as Record<string, number>
  )

  return {
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    unsubscribed: await prisma.emailSequenceEnrollment.count({
      where: { sequenceId, status: 'unsubscribed' },
    }),
    totalEmailsSent,
    emailStats: {
      sent: stats['sent'] || 0,
      delivered: stats['delivered'] || 0,
      opened: stats['opened'] || 0,
      clicked: stats['clicked'] || 0,
      bounced: stats['bounced'] || 0,
      failed: stats['failed'] || 0,
    },
    openRate: stats['sent']
      ? ((stats['opened'] || 0) / stats['sent']) * 100
      : 0,
    clickRate: stats['opened']
      ? ((stats['clicked'] || 0) / stats['opened']) * 100
      : 0,
  }
}
