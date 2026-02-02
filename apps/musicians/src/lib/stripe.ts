/**
 * Stripe Integration - GigBook
 * Payment processing for gig deposits and invoices
 * Using @vertigo/stripe shared package
 */

import {
  stripe,
  getStripeClient,
  createCheckoutSession,
  verifyWebhookSignature,
  getPaymentStatus as getPaymentStatusBase,
  createRefund,
  toStripeAmount,
  fromStripeAmount,
  type StripeEvent,
  type Currency,
} from '@vertigo/stripe'

// Re-export for convenience
export {
  stripe,
  getStripeClient,
  verifyWebhookSignature,
  toStripeAmount,
  fromStripeAmount,
}
export type { StripeEvent, Currency }

// Aliases for backwards compatibility
export const formatAmountForStripe = toStripeAmount
export const formatStripeAmount = fromStripeAmount

/**
 * Create checkout session for gig deposit payment
 */
export async function createDepositCheckoutSession({
  gigId,
  gigTitle,
  depositAmount,
  clientEmail,
  tenantId,
  successUrl,
  cancelUrl,
}: {
  gigId: string
  gigTitle: string
  depositAmount: number
  clientEmail?: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: `Záloha: ${gigTitle}`,
        description: 'Záloha za koncert',
        amount: depositAmount,
        currency: 'czk',
      },
    ],
    metadata: {
      gigId,
      tenantId,
      type: 'deposit',
    },
    customerEmail: clientEmail,
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
  totalAmount,
  customerId,
  customerEmail,
  tenantId,
  successUrl,
  cancelUrl,
}: {
  invoiceId: string
  invoiceNumber: string
  totalAmount: number
  customerId: string
  customerEmail?: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: `Faktura ${invoiceNumber}`,
        description: 'Platba faktury',
        amount: totalAmount,
        currency: 'czk',
      },
    ],
    metadata: {
      invoiceId,
      invoiceNumber,
      customerId,
      tenantId,
      type: 'invoice',
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
