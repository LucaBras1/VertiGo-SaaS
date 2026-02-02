/**
 * @vertigo/stripe - Refund
 * Helpers for creating and managing refunds
 */

import { stripe } from '../client'
import { toStripeAmount, fromStripeAmount } from '../utils/amounts'
import type { RefundResult, RefundStatus, Currency } from '../types'

/**
 * Create a refund for a payment intent
 *
 * @example
 * // Full refund
 * const refund = await createRefund(paymentIntentId)
 *
 * // Partial refund
 * const refund = await createRefund(paymentIntentId, { amount: 50, currency: 'czk' })
 */
export async function createRefund(
  paymentIntentId: string,
  options?: {
    amount?: number // In display units
    currency?: Currency
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  }
): Promise<RefundResult> {
  const currency = options?.currency || 'czk'

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: options?.amount ? toStripeAmount(options.amount, currency) : undefined,
    reason: options?.reason,
  })

  return {
    id: refund.id,
    amount: fromStripeAmount(refund.amount, currency),
    status: refund.status as RefundStatus,
    paymentIntentId: typeof refund.payment_intent === 'string'
      ? refund.payment_intent
      : refund.payment_intent?.id || null,
  }
}

/**
 * Get refund by ID
 */
export async function getRefund(refundId: string) {
  return stripe.refunds.retrieve(refundId)
}

/**
 * List refunds for a payment intent
 */
export async function listRefunds(options?: {
  paymentIntent?: string
  limit?: number
}) {
  return stripe.refunds.list({
    payment_intent: options?.paymentIntent,
    limit: options?.limit || 10,
  })
}
