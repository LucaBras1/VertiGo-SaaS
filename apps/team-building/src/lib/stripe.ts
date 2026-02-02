/**
 * Stripe Integration - TeamForge
 * Payment processing for team building orders and invoices
 * Using @vertigo/stripe shared package
 */

import {
  createCheckoutSession,
  verifyWebhookSignature,
  getPaymentStatus as getPaymentStatusBase,
  createRefund,
  toStripeAmount,
  fromStripeAmount,
  isStripeConfigured,
  type StripeEvent,
  type Currency,
} from '@vertigo/stripe'

// Re-export for convenience
export {
  verifyWebhookSignature,
  toStripeAmount,
  fromStripeAmount,
  isStripeConfigured,
}
export type { StripeEvent, Currency }

// Aliases for backwards compatibility
export const formatAmountForStripe = toStripeAmount
export const formatStripeAmount = fromStripeAmount

/**
 * Create checkout session for order payment
 */
export async function createOrderCheckoutSession({
  orderId,
  orderNumber,
  total,
  customerId,
  customerEmail,
  items,
  successUrl,
  cancelUrl,
}: {
  orderId: string
  orderNumber: string
  total: number
  customerId: string
  customerEmail?: string
  items: Array<{ name: string; description?: string; quantity: number; price: number }>
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: items.map((item) => ({
      name: item.name,
      description: item.description,
      amount: item.price * item.quantity,
      quantity: 1, // Price already includes quantity
      currency: 'czk',
    })),
    metadata: {
      orderId,
      orderNumber,
      customerId,
      type: 'order',
    },
    customerEmail,
    successUrl,
    cancelUrl,
  })
}

/**
 * Create checkout session for invoice payment
 */
export async function createInvoiceCheckoutSession({
  invoiceId,
  invoiceNumber,
  total,
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  invoiceId: string
  invoiceNumber: string
  total: number
  customerId: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: `Faktura ${invoiceNumber}`,
        description: 'Platba faktury za team building služby',
        amount: total,
        currency: 'czk',
      },
    ],
    metadata: {
      invoiceId,
      invoiceNumber,
      customerId,
      type: 'invoice',
    },
    customerEmail,
    successUrl,
    cancelUrl,
  })
}

/**
 * Create checkout session for session booking payment
 */
export async function createSessionBookingCheckoutSession({
  sessionId,
  programTitle,
  sessionDate,
  price,
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  sessionId: string
  programTitle: string
  sessionDate: string
  price: number
  customerId: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: programTitle,
        description: `Team building session on ${sessionDate}`,
        amount: price,
        currency: 'czk',
      },
    ],
    metadata: {
      sessionId,
      customerId,
      type: 'session',
    },
    customerEmail,
    successUrl,
    cancelUrl,
  })
}

/**
 * Get payment status from Stripe (with CZK currency)
 */
export async function getPaymentStatus(sessionId: string) {
  return getPaymentStatusBase(sessionId, 'czk')
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return createRefund(paymentIntentId, {
    amount,
    currency: 'czk',
  })
}
