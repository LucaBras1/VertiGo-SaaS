/**
 * @vertigo/stripe - Checkout Session
 * Helpers for creating Stripe checkout sessions
 */

import { stripe } from '../client'
import { toStripeAmount } from '../utils/amounts'
import type { CheckoutOptions, CheckoutResult, Currency } from '../types'

/**
 * Create a Stripe checkout session
 *
 * @example
 * const session = await createCheckoutSession({
 *   mode: 'payment',
 *   lineItems: [
 *     { name: 'Premium Package', amount: 1000, description: '10 credits' }
 *   ],
 *   metadata: { packageId: '123', clientId: '456', tenantId: '789' },
 *   successUrl: 'https://app.example.com/success?session_id={CHECKOUT_SESSION_ID}',
 *   cancelUrl: 'https://app.example.com/cancel',
 * })
 */
export async function createCheckoutSession(
  options: CheckoutOptions
): Promise<CheckoutResult> {
  const {
    mode = 'payment',
    lineItems,
    metadata = {},
    successUrl,
    cancelUrl,
    customerEmail,
    currency = 'czk',
  } = options

  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: (item.currency || currency).toLowerCase(),
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: toStripeAmount(item.amount, (item.currency || currency) as Currency),
      },
      quantity: item.quantity || 1,
    })),
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Get checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId)
}

/**
 * List checkout sessions with optional filters
 */
export async function listCheckoutSessions(options?: {
  limit?: number
  customer?: string
  paymentIntent?: string
}) {
  return stripe.checkout.sessions.list({
    limit: options?.limit || 10,
    customer: options?.customer,
    payment_intent: options?.paymentIntent,
  })
}
