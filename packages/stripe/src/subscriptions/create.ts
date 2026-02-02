/**
 * @vertigo/stripe - Subscription Creation
 * Create subscription checkout sessions
 */

import type Stripe from 'stripe'
import { stripe } from '../client'
import { getPriceId } from './prices'
import type {
  CreateSubscriptionCheckoutOptions,
  SubscriptionCheckoutResult,
  SubscriptionTier,
} from './types'
import type { BillingInterval } from './prices'

/**
 * Create a Stripe checkout session for subscription
 *
 * @example
 * const checkout = await createSubscriptionCheckout({
 *   tenantId: 'tenant_123',
 *   tier: 'PROFESSIONAL',
 *   interval: 'month',
 *   successUrl: 'https://app.example.com/billing?success=true',
 *   cancelUrl: 'https://app.example.com/billing',
 * })
 * // Redirect user to checkout.url
 */
export async function createSubscriptionCheckout(
  options: CreateSubscriptionCheckoutOptions
): Promise<SubscriptionCheckoutResult> {
  const {
    tenantId,
    tier,
    interval,
    successUrl,
    cancelUrl,
    customerEmail,
    customerId,
    allowPromotionCodes = true,
    trialDays,
    metadata = {},
  } = options

  const priceId = getPriceId(tier, interval)

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
      ? successUrl
      : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
    billing_address_collection: 'required',
    metadata: {
      tenantId,
      tier,
      interval,
      ...metadata,
    },
    subscription_data: {
      metadata: {
        tenantId,
        tier,
        interval,
        ...metadata,
      },
    },
  }

  // Use existing customer or pre-fill email
  if (customerId) {
    sessionParams.customer = customerId
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail
  }

  // Add trial period if specified
  if (trialDays && trialDays > 0 && sessionParams.subscription_data) {
    sessionParams.subscription_data.trial_period_days = trialDays
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Create or get Stripe customer for a tenant
 */
export async function getOrCreateCustomer(options: {
  tenantId: string
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<string> {
  const { tenantId, email, name, metadata = {} } = options

  // Search for existing customer by tenant ID in metadata
  const existingCustomers = await stripe.customers.search({
    query: `metadata['tenantId']:'${tenantId}'`,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      tenantId,
      ...metadata,
    },
  })

  return customer.id
}

/**
 * Get subscription checkout session details
 */
export async function getSubscriptionCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  })

  return session
}

/**
 * Create a setup intent for saving payment method without immediate payment
 * Useful for updating payment method or setting up for future subscriptions
 */
export async function createSetupIntent(options: {
  customerId: string
  metadata?: Record<string, string>
}) {
  const setupIntent = await stripe.setupIntents.create({
    customer: options.customerId,
    payment_method_types: ['card'],
    metadata: options.metadata,
    usage: 'off_session', // Allow using for recurring payments
  })

  return {
    clientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id,
  }
}

/**
 * Preview upcoming invoice for a subscription change
 * Useful for showing proration costs before upgrade/downgrade
 */
export async function previewSubscriptionChange(options: {
  customerId: string
  subscriptionId: string
  newTier: Exclude<SubscriptionTier, 'FREE'>
  newInterval?: BillingInterval
}) {
  const { customerId, subscriptionId, newTier, newInterval } = options

  // Get current subscription to determine interval if not specified
  const currentSub = await stripe.subscriptions.retrieve(subscriptionId)
  const currentItem = currentSub.items.data[0]
  const interval = newInterval || (currentItem.price.recurring?.interval as BillingInterval)

  const priceId = getPriceId(newTier, interval)

  const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: subscriptionId,
    subscription_items: [
      {
        id: currentItem.id,
        price: priceId,
      },
    ],
    subscription_proration_behavior: 'create_prorations',
  })

  return {
    amountDue: upcomingInvoice.amount_due / 100, // Convert to display units
    currency: upcomingInvoice.currency,
    prorationAmount:
      upcomingInvoice.lines.data
        .filter((line) => line.proration)
        .reduce((sum, line) => sum + line.amount, 0) / 100,
    nextBillingDate: new Date((upcomingInvoice.next_payment_attempt || 0) * 1000),
  }
}
