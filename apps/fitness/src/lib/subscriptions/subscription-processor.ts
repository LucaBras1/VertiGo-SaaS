/**
 * Subscription Processor
 *
 * Handles subscription lifecycle, billing, and invoice generation.
 */

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export type SubscriptionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'past_due'

interface CreateSubscriptionData {
  tenantId: string
  clientId: string
  packageId?: string
  amount: number
  currency?: string
  frequency: SubscriptionFrequency
  startDate?: Date
  endDate?: Date
  billingDay?: number
  autoRenew?: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

interface ProcessSubscriptionResult {
  processed: number
  failed: number
  invoices: string[]
  errors: { subscriptionId: string; error: string }[]
}

/**
 * Calculate next billing date based on frequency
 */
export function calculateNextBillingDate(
  currentDate: Date,
  frequency: SubscriptionFrequency,
  billingDay?: number
): Date {
  const nextDate = new Date(currentDate)

  switch (frequency) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'BIWEEKLY':
      nextDate.setDate(nextDate.getDate() + 14)
      break
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1)
      if (billingDay) {
        nextDate.setDate(Math.min(billingDay, getDaysInMonth(nextDate)))
      }
      break
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3)
      if (billingDay) {
        nextDate.setDate(Math.min(billingDay, getDaysInMonth(nextDate)))
      }
      break
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      if (billingDay) {
        nextDate.setDate(Math.min(billingDay, getDaysInMonth(nextDate)))
      }
      break
  }

  return nextDate
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: CreateSubscriptionData) {
  const startDate = data.startDate || new Date()
  const nextBillingDate = calculateNextBillingDate(
    startDate,
    data.frequency,
    data.billingDay
  )

  // Get package info if provided
  let packageData = null
  if (data.packageId) {
    packageData = await prisma.package.findUnique({
      where: { id: data.packageId },
    })
  }

  const subscription = await prisma.subscription.create({
    data: {
      tenantId: data.tenantId,
      clientId: data.clientId,
      packageId: data.packageId,
      amount: new Decimal(data.amount),
      currency: data.currency || 'CZK',
      frequency: data.frequency,
      startDate,
      endDate: data.endDate,
      nextBillingDate,
      billingDay: data.billingDay,
      autoRenew: data.autoRenew ?? true,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      status: 'active',
    },
    include: {
      client: true,
      package: true,
    },
  })

  // If package includes credits, add them to client
  if (packageData) {
    await prisma.client.update({
      where: { id: data.clientId },
      data: {
        creditsRemaining: { increment: packageData.credits },
        membershipType: 'subscription',
        membershipExpiry: data.endDate,
      },
    })
  }

  return subscription
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'paused',
      pausedAt: new Date(),
    },
  })
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription || subscription.status !== 'paused') {
    throw new Error('Subscription cannot be resumed')
  }

  // Calculate new next billing date
  const nextBillingDate = calculateNextBillingDate(
    new Date(),
    subscription.frequency as SubscriptionFrequency,
    subscription.billingDay || undefined
  )

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'active',
      pausedAt: null,
      nextBillingDate,
      reminderSent: false,
    },
  })
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  options?: { immediate?: boolean }
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  if (options?.immediate) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        endDate: new Date(),
      },
    })
  }

  // Cancel at end of current period
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      autoRenew: false,
      cancelledAt: new Date(),
      // Subscription will be marked as cancelled when nextBillingDate passes
    },
  })
}

/**
 * Process due subscriptions and generate invoices
 */
export async function processDueSubscriptions(
  tenantId?: string
): Promise<ProcessSubscriptionResult> {
  const now = new Date()
  const result: ProcessSubscriptionResult = {
    processed: 0,
    failed: 0,
    invoices: [],
    errors: [],
  }

  // Find all subscriptions due for billing
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      ...(tenantId && { tenantId }),
      status: 'active',
      nextBillingDate: { lte: now },
      autoRenew: true,
    },
    include: {
      client: true,
      package: true,
    },
  })

  for (const subscription of dueSubscriptions) {
    try {
      // Check if subscription has reached end date
      if (subscription.endDate && subscription.endDate <= now) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'expired' },
        })
        continue
      }

      // Generate invoice
      const invoiceNumber = await generateInvoiceNumber(subscription.tenantId)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14) // 14 days payment term

      const invoice = await prisma.invoice.create({
        data: {
          tenantId: subscription.tenantId,
          clientId: subscription.clientId,
          subscriptionId: subscription.id,
          invoiceNumber,
          status: 'sent',
          issueDate: now,
          dueDate,
          subtotal: Number(subscription.amount),
          tax: 0,
          total: Number(subscription.amount),
          amountPaid: new Decimal(0),
          amountRemaining: subscription.amount,
          notes: subscription.package
            ? `Předplatné: ${subscription.package.name}`
            : 'Pravidelná platba',
        },
      })

      result.invoices.push(invoice.id)

      // Calculate next billing date
      const nextBillingDate = calculateNextBillingDate(
        subscription.nextBillingDate,
        subscription.frequency as SubscriptionFrequency,
        subscription.billingDay || undefined
      )

      // Update subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          nextBillingDate,
          lastPaymentDate: now,
          lastPaymentStatus: 'pending',
          reminderSent: false,
          retryCount: 0,
        },
      })

      // Add credits if package exists
      if (subscription.package) {
        await prisma.client.update({
          where: { id: subscription.clientId },
          data: {
            creditsRemaining: { increment: subscription.package.credits },
          },
        })
      }

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push({
        subscriptionId: subscription.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return result
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `FA${year}`

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      tenantId,
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { invoiceNumber: 'desc' },
  })

  let nextNumber = 1
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4))
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Send billing reminders for upcoming subscriptions
 */
export async function sendBillingReminders(
  tenantId?: string,
  daysBefore = 3
): Promise<{ sent: number; subscriptionIds: string[] }> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() + daysBefore)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      ...(tenantId && { tenantId }),
      status: 'active',
      autoRenew: true,
      reminderSent: false,
      nextBillingDate: {
        gte: new Date(),
        lte: reminderDate,
      },
    },
    include: {
      client: true,
    },
  })

  const sentIds: string[] = []

  for (const subscription of subscriptions) {
    try {
      // TODO: Send email reminder
      // await sendBillingReminderEmail(subscription)

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { reminderSent: true },
      })

      sentIds.push(subscription.id)
    } catch (error) {
      console.error(`Failed to send reminder for subscription ${subscription.id}:`, error)
    }
  }

  return { sent: sentIds.length, subscriptionIds: sentIds }
}

/**
 * Retry failed payment for a subscription
 */
export async function retryPayment(subscriptionId: string): Promise<{
  success: boolean
  error?: string
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { client: true },
  })

  if (!subscription) {
    return { success: false, error: 'Subscription not found' }
  }

  if (subscription.retryCount >= subscription.maxRetries) {
    // Mark as past_due after max retries
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'past_due' },
    })
    return { success: false, error: 'Max retry attempts reached' }
  }

  try {
    // TODO: Integrate with Stripe for actual payment retry
    // const paymentIntent = await stripe.paymentIntents.create(...)

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        retryCount: { increment: 1 },
        lastPaymentStatus: 'retry_attempted',
      },
    })

    return { success: true }
  } catch (error) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        retryCount: { increment: 1 },
        lastPaymentStatus: 'failed',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment retry failed',
    }
  }
}

/**
 * Get subscription statistics for a tenant
 */
export async function getSubscriptionStats(tenantId: string) {
  const [
    activeCount,
    pausedCount,
    cancelledCount,
    totalMRR,
    upcomingRenewals,
  ] = await Promise.all([
    prisma.subscription.count({
      where: { tenantId, status: 'active' },
    }),
    prisma.subscription.count({
      where: { tenantId, status: 'paused' },
    }),
    prisma.subscription.count({
      where: { tenantId, status: 'cancelled' },
    }),
    prisma.subscription.aggregate({
      where: { tenantId, status: 'active' },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: {
        tenantId,
        status: 'active',
        nextBillingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
    }),
  ])

  // Calculate MRR from different frequencies
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { tenantId, status: 'active' },
    select: { amount: true, frequency: true },
  })

  let mrr = 0
  for (const sub of activeSubscriptions) {
    const amount = Number(sub.amount)
    switch (sub.frequency) {
      case 'WEEKLY':
        mrr += amount * 4.33 // Average weeks per month
        break
      case 'BIWEEKLY':
        mrr += amount * 2.17
        break
      case 'MONTHLY':
        mrr += amount
        break
      case 'QUARTERLY':
        mrr += amount / 3
        break
      case 'YEARLY':
        mrr += amount / 12
        break
    }
  }

  return {
    active: activeCount,
    paused: pausedCount,
    cancelled: cancelledCount,
    mrr: Math.round(mrr * 100) / 100,
    upcomingRenewals,
  }
}
