/**
 * @vertigo/stripe - Payment Intent
 * Helpers for working with payment intents
 */

import { stripe } from '../client'
import { fromStripeAmount } from '../utils/amounts'
import type { PaymentStatus, Currency } from '../types'

/**
 * Get payment status from a checkout session
 *
 * @example
 * const status = await getPaymentStatus(sessionId)
 * if (status.status === 'paid') {
 *   // Process successful payment
 * }
 */
export async function getPaymentStatus(
  sessionId: string,
  currency: Currency = 'czk'
): Promise<PaymentStatus> {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.payment_status,
    amountTotal: session.amount_total
      ? fromStripeAmount(session.amount_total, currency)
      : 0,
    customerEmail: session.customer_email,
    metadata: session.metadata,
  }
}

/**
 * Get payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.cancel(paymentIntentId)
}

/**
 * List payment intents with optional filters
 */
export async function listPaymentIntents(options?: {
  limit?: number
  customer?: string
}) {
  return stripe.paymentIntents.list({
    limit: options?.limit || 10,
    customer: options?.customer,
  })
}
