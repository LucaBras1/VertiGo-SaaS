/**
 * @vertigo/stripe - Subscription Management
 * Upgrade, downgrade, cancel, and manage subscriptions
 */

import { stripe } from '../client'
import { getPriceId, getTierFromPriceId } from './prices'
import type {
  UpdateSubscriptionOptions,
  CancelSubscriptionOptions,
  SubscriptionInfo,
  SubscriptionStatus,
  SubscriptionTier,
} from './types'
import type { BillingInterval } from './prices'

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    })

    const item = subscription.items.data[0]
    const priceId = item.price.id
    const tierInfo = getTierFromPriceId(priceId)

    return {
      id: subscription.id,
      status: subscription.status as SubscriptionStatus,
      tier: tierInfo?.tier || ('STARTER' as SubscriptionTier),
      interval: (item.price.recurring?.interval as BillingInterval) || 'month',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      customerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id,
      priceId,
      quantity: item.quantity || 1,
    }
  } catch (error) {
    console.error('[Stripe] Failed to get subscription:', error)
    return null
  }
}

/**
 * Upgrade or downgrade a subscription
 *
 * @example
 * // Upgrade to BUSINESS tier
 * const updated = await updateSubscription({
 *   subscriptionId: 'sub_xxx',
 *   newTier: 'BUSINESS',
 * })
 */
export async function updateSubscription(options: UpdateSubscriptionOptions) {
  const { subscriptionId, newTier, newInterval, prorationBehavior = 'create_prorations' } = options

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const currentItem = subscription.items.data[0]

  // Determine interval - use new interval or keep current
  const interval =
    newInterval || (currentItem.price.recurring?.interval as BillingInterval) || 'month'
  const newPriceId = getPriceId(newTier, interval)

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: currentItem.id,
        price: newPriceId,
      },
    ],
    proration_behavior: prorationBehavior,
    metadata: {
      ...subscription.metadata,
      tier: newTier,
      interval,
      updatedAt: new Date().toISOString(),
    },
  })

  return updatedSubscription
}

/**
 * Cancel a subscription
 *
 * @example
 * // Cancel at period end (recommended)
 * await cancelSubscription({
 *   subscriptionId: 'sub_xxx',
 *   cancelAtPeriodEnd: true,
 *   feedback: 'too_expensive',
 * })
 *
 * // Cancel immediately
 * await cancelSubscription({
 *   subscriptionId: 'sub_xxx',
 *   cancelAtPeriodEnd: false,
 * })
 */
export async function cancelSubscription(options: CancelSubscriptionOptions) {
  const { subscriptionId, cancelAtPeriodEnd = true, reason, feedback } = options

  if (cancelAtPeriodEnd) {
    // Cancel at period end - subscription stays active until end of billing period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        cancellationReason: reason || '',
        cancellationFeedback: feedback || '',
        cancelledAt: new Date().toISOString(),
      },
    })
    return subscription
  } else {
    // Cancel immediately
    const subscription = await stripe.subscriptions.cancel(subscriptionId, {
      cancellation_details: {
        comment: reason,
        feedback: feedback,
      },
    })
    return subscription
  }
}

/**
 * Reactivate a subscription that was set to cancel at period end
 */
export async function reactivateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    metadata: {
      reactivatedAt: new Date().toISOString(),
    },
  })
  return subscription
}

/**
 * Pause a subscription (using pause_collection)
 * The subscription remains active but invoices are not generated
 */
export async function pauseSubscription(
  subscriptionId: string,
  options?: {
    resumeAt?: Date
    behavior?: 'keep_as_draft' | 'mark_uncollectible' | 'void'
  }
) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: options?.behavior || 'mark_uncollectible',
      resumes_at: options?.resumeAt ? Math.floor(options.resumeAt.getTime() / 1000) : undefined,
    },
    metadata: {
      pausedAt: new Date().toISOString(),
    },
  })
  return subscription
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    pause_collection: '', // Empty string removes pause
    metadata: {
      resumedAt: new Date().toISOString(),
    },
  })
  return subscription
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(
  customerId: string,
  options?: {
    status?: SubscriptionStatus | 'all'
    limit?: number
  }
) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: options?.status || 'all',
    limit: options?.limit || 10,
    expand: ['data.items.data.price'],
  })

  return subscriptions.data.map((sub) => {
    const item = sub.items.data[0]
    const tierInfo = getTierFromPriceId(item.price.id)

    return {
      id: sub.id,
      status: sub.status as SubscriptionStatus,
      tier: tierInfo?.tier || 'STARTER',
      interval: (item.price.recurring?.interval as BillingInterval) || 'month',
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    }
  })
}

/**
 * Get subscription usage/limits for AI credits
 * This can be extended based on metered billing needs
 */
export async function getSubscriptionUsage(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  })

  const item = subscription.items.data[0]
  const tierInfo = getTierFromPriceId(item.price.id)

  // AI credit limits based on tier
  const aiCreditsLimits: Record<SubscriptionTier, number> = {
    FREE: 100,
    STARTER: 500,
    PROFESSIONAL: 2000,
    BUSINESS: 5000,
    ENTERPRISE: 20000,
  }

  return {
    subscriptionId,
    tier: tierInfo?.tier || 'FREE',
    aiCreditsLimit: aiCreditsLimits[tierInfo?.tier || 'FREE'],
    periodStart: new Date(subscription.current_period_start * 1000),
    periodEnd: new Date(subscription.current_period_end * 1000),
  }
}
