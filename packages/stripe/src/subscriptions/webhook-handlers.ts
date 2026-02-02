/**
 * @vertigo/stripe - Subscription Webhook Handlers
 * Handlers for Stripe subscription-related webhook events
 */

import type Stripe from 'stripe'
import { getTierFromPriceId } from './prices'
import type {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionWebhookData,
  InvoiceWebhookData,
} from './types'
import type { BillingInterval } from './prices'

/**
 * Callback type for subscription events
 */
export type SubscriptionEventCallback = (data: SubscriptionWebhookData) => Promise<void>

/**
 * Callback type for invoice events
 */
export type InvoiceEventCallback = (data: InvoiceWebhookData) => Promise<void>

/**
 * Callbacks for subscription webhook events
 */
export interface SubscriptionWebhookCallbacks {
  /** Called when a new subscription is created (checkout.session.completed with mode=subscription) */
  onSubscriptionCreated?: SubscriptionEventCallback
  /** Called when a subscription is updated (plan change, etc.) */
  onSubscriptionUpdated?: SubscriptionEventCallback
  /** Called when a subscription is canceled */
  onSubscriptionCanceled?: SubscriptionEventCallback
  /** Called when a subscription trial ends */
  onTrialEnding?: SubscriptionEventCallback
  /** Called when an invoice is paid successfully */
  onInvoicePaid?: InvoiceEventCallback
  /** Called when an invoice payment fails */
  onInvoicePaymentFailed?: InvoiceEventCallback
  /** Called when a customer is created */
  onCustomerCreated?: (data: {
    customerId: string
    email: string | null
    metadata: Record<string, string>
  }) => Promise<void>
}

/**
 * Parse subscription data from Stripe subscription object
 */
function parseSubscriptionData(subscription: Stripe.Subscription): SubscriptionWebhookData {
  const item = subscription.items.data[0]
  const priceId = item?.price?.id
  const tierInfo = priceId ? getTierFromPriceId(priceId) : null

  return {
    subscriptionId: subscription.id,
    customerId:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id,
    status: subscription.status as SubscriptionStatus,
    tier: (tierInfo?.tier || subscription.metadata?.tier || 'STARTER') as SubscriptionTier,
    interval:
      (tierInfo?.interval ||
        subscription.metadata?.interval ||
        item?.price?.recurring?.interval ||
        'month') as BillingInterval,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: subscription.metadata || {},
  }
}

/**
 * Parse invoice data from Stripe invoice object
 */
function parseInvoiceData(invoice: Stripe.Invoice): InvoiceWebhookData {
  return {
    invoiceId: invoice.id,
    customerId:
      typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
    subscriptionId:
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id || null,
    status: invoice.status || 'draft',
    amountPaid: invoice.amount_paid / 100, // Convert to display units
    amountDue: invoice.amount_due / 100,
    currency: invoice.currency,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  }
}

/**
 * Create subscription webhook handlers
 *
 * @example
 * import { createSubscriptionWebhookHandlers, createWebhookHandler } from '@vertigo/stripe'
 *
 * const subscriptionHandlers = createSubscriptionWebhookHandlers({
 *   onSubscriptionCreated: async (data) => {
 *     await prisma.tenant.update({
 *       where: { stripeCustomerId: data.customerId },
 *       data: {
 *         stripeSubscriptionId: data.subscriptionId,
 *         subscriptionTier: data.tier,
 *         subscriptionStatus: data.status,
 *         subscriptionEnds: data.currentPeriodEnd,
 *       },
 *     })
 *   },
 *   onSubscriptionCanceled: async (data) => {
 *     await prisma.tenant.update({
 *       where: { stripeSubscriptionId: data.subscriptionId },
 *       data: {
 *         subscriptionTier: 'FREE',
 *         subscriptionStatus: 'canceled',
 *       },
 *     })
 *   },
 * })
 *
 * export const POST = createWebhookHandler(process.env.STRIPE_WEBHOOK_SECRET!, subscriptionHandlers)
 */
export function createSubscriptionWebhookHandlers(callbacks: SubscriptionWebhookCallbacks) {
  return {
    /**
     * Handle checkout.session.completed
     * This fires when a customer completes a Checkout session
     */
    'checkout.session.completed': async (event: Stripe.CheckoutSessionCompletedEvent) => {
      const session = event.data.object

      // Only handle subscription mode
      if (session.mode !== 'subscription') {
        return
      }

      // Get subscription details
      if (session.subscription && callbacks.onSubscriptionCreated) {
        // Subscription ID from session
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id

        // For now, create webhook data from session metadata
        // The customer.subscription.created event will have full subscription data
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id || ''

        await callbacks.onSubscriptionCreated({
          subscriptionId,
          customerId,
          status: 'active',
          tier: (session.metadata?.tier as SubscriptionTier) || 'STARTER',
          interval: (session.metadata?.interval as BillingInterval) || 'month',
          currentPeriodEnd: new Date(), // Will be updated by subscription.created
          cancelAtPeriodEnd: false,
          metadata: session.metadata || {},
        })
      }
    },

    /**
     * Handle customer.subscription.created
     * This fires when a subscription is created
     */
    'customer.subscription.created': async (event: Stripe.CustomerSubscriptionCreatedEvent) => {
      const subscription = event.data.object

      if (callbacks.onSubscriptionCreated) {
        await callbacks.onSubscriptionCreated(parseSubscriptionData(subscription))
      }
    },

    /**
     * Handle customer.subscription.updated
     * This fires when a subscription is updated (plan change, status change, etc.)
     */
    'customer.subscription.updated': async (event: Stripe.CustomerSubscriptionUpdatedEvent) => {
      const subscription = event.data.object

      if (callbacks.onSubscriptionUpdated) {
        await callbacks.onSubscriptionUpdated(parseSubscriptionData(subscription))
      }
    },

    /**
     * Handle customer.subscription.deleted
     * This fires when a subscription is canceled/deleted
     */
    'customer.subscription.deleted': async (event: Stripe.CustomerSubscriptionDeletedEvent) => {
      const subscription = event.data.object

      if (callbacks.onSubscriptionCanceled) {
        await callbacks.onSubscriptionCanceled(parseSubscriptionData(subscription))
      }
    },

    /**
     * Handle customer.subscription.trial_will_end
     * This fires 3 days before trial ends
     */
    'customer.subscription.trial_will_end': async (
      event: Stripe.CustomerSubscriptionTrialWillEndEvent
    ) => {
      const subscription = event.data.object

      if (callbacks.onTrialEnding) {
        await callbacks.onTrialEnding(parseSubscriptionData(subscription))
      }
    },

    /**
     * Handle invoice.paid
     * This fires when an invoice is successfully paid
     */
    'invoice.paid': async (event: Stripe.InvoicePaidEvent) => {
      const invoice = event.data.object

      if (callbacks.onInvoicePaid) {
        await callbacks.onInvoicePaid(parseInvoiceData(invoice))
      }
    },

    /**
     * Handle invoice.payment_failed
     * This fires when a payment attempt fails
     */
    'invoice.payment_failed': async (event: Stripe.InvoicePaymentFailedEvent) => {
      const invoice = event.data.object

      if (callbacks.onInvoicePaymentFailed) {
        await callbacks.onInvoicePaymentFailed(parseInvoiceData(invoice))
      }
    },

    /**
     * Handle customer.created
     * This fires when a new customer is created
     */
    'customer.created': async (event: Stripe.CustomerCreatedEvent) => {
      const customer = event.data.object

      if (callbacks.onCustomerCreated) {
        await callbacks.onCustomerCreated({
          customerId: customer.id,
          email: customer.email,
          metadata: customer.metadata || {},
        })
      }
    },
  }
}

/**
 * Default subscription webhook handlers
 * These provide logging and basic handling, override with createSubscriptionWebhookHandlers
 */
export const defaultSubscriptionWebhookHandlers = createSubscriptionWebhookHandlers({
  onSubscriptionCreated: async (data) => {
    console.log('[Stripe Webhook] Subscription created:', {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
      tier: data.tier,
      status: data.status,
    })
  },
  onSubscriptionUpdated: async (data) => {
    console.log('[Stripe Webhook] Subscription updated:', {
      subscriptionId: data.subscriptionId,
      tier: data.tier,
      status: data.status,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
    })
  },
  onSubscriptionCanceled: async (data) => {
    console.log('[Stripe Webhook] Subscription canceled:', {
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
    })
  },
  onInvoicePaid: async (data) => {
    console.log('[Stripe Webhook] Invoice paid:', {
      invoiceId: data.invoiceId,
      amountPaid: data.amountPaid,
      currency: data.currency,
    })
  },
  onInvoicePaymentFailed: async (data) => {
    console.log('[Stripe Webhook] Invoice payment failed:', {
      invoiceId: data.invoiceId,
      amountDue: data.amountDue,
      currency: data.currency,
    })
  },
})
