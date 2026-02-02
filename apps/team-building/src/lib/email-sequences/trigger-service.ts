/**
 * Trigger Service
 * Handles automatic enrollment of customers into email sequences
 */

import { prisma } from '@/lib/db'

export type TriggerType =
  | 'session_completed'
  | 'days_after_session'
  | 'no_booking_days'
  | 'invoice_paid'
  | 'quote_sent'
  | 'manual'

export interface TriggerConfig {
  daysAfter?: number
  inactiveDays?: number
}

/**
 * Enroll a customer into a sequence
 */
export async function enrollCustomer(
  customerId: string,
  sequenceId: string,
  skipFirstDelay: boolean = false
): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  try {
    // Check if already enrolled
    const existing = await prisma.emailSequenceEnrollment.findUnique({
      where: {
        sequenceId_customerId: { sequenceId, customerId },
      },
    })

    if (existing) {
      // Reactivate if completed or unsubscribed? For now, skip
      if (existing.status === 'active') {
        return { success: false, error: 'Customer already enrolled in this sequence' }
      }
    }

    // Get sequence to check if active and get first step
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: sequenceId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
          take: 1,
        },
      },
    })

    if (!sequence || !sequence.isActive) {
      return { success: false, error: 'Sequence not found or not active' }
    }

    // Calculate next email time based on first step delay
    const firstStep = sequence.steps[0]
    let nextEmailAt: Date | null = null

    if (firstStep) {
      if (skipFirstDelay) {
        nextEmailAt = new Date() // Send immediately
      } else {
        nextEmailAt = new Date()
        nextEmailAt.setDate(nextEmailAt.getDate() + firstStep.delayDays)
        nextEmailAt.setHours(nextEmailAt.getHours() + firstStep.delayHours)
      }
    }

    // Create or update enrollment
    const enrollment = await prisma.emailSequenceEnrollment.upsert({
      where: {
        sequenceId_customerId: { sequenceId, customerId },
      },
      update: {
        status: 'active',
        currentStep: 0,
        nextEmailAt,
        completedAt: null,
        emailsSent: 0,
      },
      create: {
        sequenceId,
        customerId,
        status: 'active',
        currentStep: 0,
        nextEmailAt,
      },
    })

    return { success: true, enrollmentId: enrollment.id }
  } catch (error) {
    console.error('Error enrolling customer:', error)
    return { success: false, error: 'Failed to enroll customer' }
  }
}

/**
 * Unenroll a customer from a sequence
 */
export async function unenrollCustomer(
  customerId: string,
  sequenceId: string,
  reason: 'manual' | 'unsubscribed' = 'manual'
): Promise<boolean> {
  try {
    await prisma.emailSequenceEnrollment.update({
      where: {
        sequenceId_customerId: { sequenceId, customerId },
      },
      data: {
        status: reason === 'unsubscribed' ? 'unsubscribed' : 'paused',
        nextEmailAt: null,
      },
    })
    return true
  } catch (error) {
    console.error('Error unenrolling customer:', error)
    return false
  }
}

/**
 * Check and enroll customers based on trigger conditions
 */
export async function checkTriggers(): Promise<{ enrolled: number; errors: number }> {
  let enrolled = 0
  let errors = 0

  // Get all active sequences
  const sequences = await prisma.emailSequence.findMany({
    where: { isActive: true },
  })

  for (const sequence of sequences) {
    try {
      const config = (sequence.triggerConfig as TriggerConfig) || {}

      switch (sequence.triggerType) {
        case 'no_booking_days': {
          // Find customers inactive for specified days
          const inactiveDays = config.inactiveDays || 90
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - inactiveDays)

          const inactiveCustomers = await prisma.customer.findMany({
            where: {
              orders: {
                every: {
                  createdAt: { lt: cutoffDate },
                },
              },
              emailEnrollments: {
                none: {
                  sequenceId: sequence.id,
                  status: { in: ['active', 'completed'] },
                },
              },
            },
            select: { id: true },
          })

          for (const customer of inactiveCustomers) {
            const result = await enrollCustomer(customer.id, sequence.id)
            if (result.success) enrolled++
            else errors++
          }
          break
        }

        // Other triggers are handled by direct events (session completed, invoice paid, etc.)
        // and will be called from those event handlers
      }
    } catch (error) {
      console.error(`Error processing sequence ${sequence.id}:`, error)
      errors++
    }
  }

  return { enrolled, errors }
}

/**
 * Handle session completed trigger
 */
export async function onSessionCompleted(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      orders: {
        include: { customer: true },
      },
    },
  })

  if (!session) return

  // Find sequences with session_completed trigger
  const sequences = await prisma.emailSequence.findMany({
    where: {
      isActive: true,
      triggerType: 'session_completed',
    },
  })

  for (const order of session.orders) {
    if (order.customerId) {
      for (const sequence of sequences) {
        await enrollCustomer(order.customerId, sequence.id)
      }
    }
  }
}

/**
 * Handle invoice paid trigger
 */
export async function onInvoicePaid(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { customerId: true },
  })

  if (!invoice?.customerId) return

  // Find sequences with invoice_paid trigger
  const sequences = await prisma.emailSequence.findMany({
    where: {
      isActive: true,
      triggerType: 'invoice_paid',
    },
  })

  for (const sequence of sequences) {
    await enrollCustomer(invoice.customerId, sequence.id)
  }
}
