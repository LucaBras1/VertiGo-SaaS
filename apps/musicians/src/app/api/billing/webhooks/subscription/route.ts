import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createWebhookHandler,
  createSubscriptionWebhookHandlers,
  getTierFromPriceId,
} from '@vertigo/stripe'
import type { SubscriptionTier } from '@vertigo/stripe'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

// AI credit limits per tier
const AI_CREDITS_LIMITS: Record<SubscriptionTier, number> = {
  FREE: 100,
  STARTER: 500,
  PROFESSIONAL: 2000,
  BUSINESS: 5000,
  ENTERPRISE: 20000,
}

/**
 * Subscription-specific webhook handlers
 * Handles subscription lifecycle events from Stripe
 */
const subscriptionHandlers = createSubscriptionWebhookHandlers({
  /**
   * When a new subscription is created
   */
  onSubscriptionCreated: async (data) => {
    console.log('[Subscription Webhook] Created:', {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
      tier: data.tier,
    })

    // Find tenant by Stripe customer ID
    const tenant = await prisma.tenant.findFirst({
      where: { stripeCustomerId: data.customerId },
    })

    if (!tenant) {
      console.error('[Subscription Webhook] Tenant not found for customer:', data.customerId)

      // Try to find by tenantId in metadata
      const tenantId = data.metadata?.tenantId
      if (tenantId) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            stripeCustomerId: data.customerId,
            stripeSubscriptionId: data.subscriptionId,
            subscriptionTier: data.tier,
            subscriptionStatus: data.status,
            billingInterval: data.interval,
            subscriptionEnds: data.currentPeriodEnd,
            aiCreditsLimit: AI_CREDITS_LIMITS[data.tier] || 100,
            aiCreditsUsed: 0, // Reset on new subscription
          },
        })
        console.log('[Subscription Webhook] Tenant updated via metadata:', tenantId)
      }
      return
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeSubscriptionId: data.subscriptionId,
        subscriptionTier: data.tier,
        subscriptionStatus: data.status,
        billingInterval: data.interval,
        subscriptionEnds: data.currentPeriodEnd,
        aiCreditsLimit: AI_CREDITS_LIMITS[data.tier] || 100,
        aiCreditsUsed: 0, // Reset on new subscription
      },
    })

    console.log('[Subscription Webhook] Tenant subscription activated:', tenant.id)
  },

  /**
   * When subscription is updated (upgrade, downgrade, renewal)
   */
  onSubscriptionUpdated: async (data) => {
    console.log('[Subscription Webhook] Updated:', {
      subscriptionId: data.subscriptionId,
      tier: data.tier,
      status: data.status,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    })

    const tenant = await prisma.tenant.findFirst({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!tenant) {
      console.error('[Subscription Webhook] Tenant not found for subscription:', data.subscriptionId)
      return
    }

    // Check if tier changed
    const tierChanged = tenant.subscriptionTier !== data.tier

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionTier: data.tier,
        subscriptionStatus: data.status,
        billingInterval: data.interval,
        subscriptionEnds: data.currentPeriodEnd,
        // Update AI credits limit if tier changed
        ...(tierChanged && {
          aiCreditsLimit: AI_CREDITS_LIMITS[data.tier] || 100,
          // Don't reset usage on upgrade, only on new subscription
        }),
      },
    })

    console.log('[Subscription Webhook] Tenant subscription updated:', tenant.id)
  },

  /**
   * When subscription is canceled
   */
  onSubscriptionCanceled: async (data) => {
    console.log('[Subscription Webhook] Canceled:', {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
    })

    const tenant = await prisma.tenant.findFirst({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!tenant) {
      console.error('[Subscription Webhook] Tenant not found for subscription:', data.subscriptionId)
      return
    }

    // Downgrade to FREE tier
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null, // Clear subscription ID
        aiCreditsLimit: AI_CREDITS_LIMITS.FREE,
        // Keep aiCreditsUsed to prevent abuse
      },
    })

    console.log('[Subscription Webhook] Tenant downgraded to FREE:', tenant.id)

    // TODO: Send cancellation confirmation email
    // await sendEmail({ type: 'subscription_canceled', tenantId: tenant.id })
  },

  /**
   * When trial is about to end (3 days before)
   */
  onTrialEnding: async (data) => {
    console.log('[Subscription Webhook] Trial ending:', {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
    })

    const tenant = await prisma.tenant.findFirst({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!tenant) {
      return
    }

    // TODO: Send trial ending reminder email
    // await sendEmail({ type: 'trial_ending', tenantId: tenant.id })

    console.log('[Subscription Webhook] Trial ending notification for:', tenant.id)
  },

  /**
   * When invoice is paid (subscription renewal)
   */
  onInvoicePaid: async (data) => {
    console.log('[Subscription Webhook] Invoice paid:', {
      invoiceId: data.invoiceId,
      subscriptionId: data.subscriptionId,
      amountPaid: data.amountPaid,
      currency: data.currency,
    })

    if (!data.subscriptionId) {
      return // Not a subscription invoice
    }

    const tenant = await prisma.tenant.findFirst({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!tenant) {
      return
    }

    // Reset AI credits on successful renewal (new billing period)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        aiCreditsUsed: 0,
        subscriptionStatus: 'active',
      },
    })

    console.log('[Subscription Webhook] AI credits reset for:', tenant.id)

    // TODO: Send payment confirmation email with invoice PDF
    // await sendEmail({
    //   type: 'payment_received',
    //   tenantId: tenant.id,
    //   invoiceUrl: data.hostedInvoiceUrl,
    //   invoicePdf: data.invoicePdf,
    // })
  },

  /**
   * When invoice payment fails
   */
  onInvoicePaymentFailed: async (data) => {
    console.log('[Subscription Webhook] Invoice payment failed:', {
      invoiceId: data.invoiceId,
      subscriptionId: data.subscriptionId,
      amountDue: data.amountDue,
    })

    if (!data.subscriptionId) {
      return
    }

    const tenant = await prisma.tenant.findFirst({
      where: { stripeSubscriptionId: data.subscriptionId },
    })

    if (!tenant) {
      return
    }

    // Update status to past_due
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    })

    console.log('[Subscription Webhook] Payment failed for:', tenant.id)

    // TODO: Send payment failed email (dunning)
    // await sendEmail({
    //   type: 'payment_failed',
    //   tenantId: tenant.id,
    //   invoiceUrl: data.hostedInvoiceUrl,
    // })
  },

  /**
   * When a new customer is created in Stripe
   */
  onCustomerCreated: async (data) => {
    console.log('[Subscription Webhook] Customer created:', {
      customerId: data.customerId,
      email: data.email,
    })

    // Link customer to tenant if tenantId is in metadata
    const tenantId = data.metadata?.tenantId
    if (tenantId) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          stripeCustomerId: data.customerId,
        },
      })
      console.log('[Subscription Webhook] Customer linked to tenant:', tenantId)
    }
  },
})

// Get webhook secret from environment
const getWebhookSecret = () => {
  const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  return secret
}

/**
 * POST /api/billing/webhooks/subscription
 * Webhook endpoint for Stripe subscription events
 *
 * Configure this endpoint in Stripe Dashboard:
 * - URL: https://your-app.com/api/billing/webhooks/subscription
 * - Events:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - customer.subscription.trial_will_end
 *   - invoice.paid
 *   - invoice.payment_failed
 *   - customer.created
 */
export const POST = createWebhookHandler(getWebhookSecret(), subscriptionHandlers)
