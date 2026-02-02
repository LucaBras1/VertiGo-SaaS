/**
 * Stripe Integration - FitAdmin
 * Payment processing for fitness packages and invoices
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

// Create checkout session for package purchase
export async function createPackageCheckoutSession({
  packageId,
  packageName,
  price,
  credits,
  clientId,
  tenantId,
  successUrl,
  cancelUrl,
}: {
  packageId: string
  packageName: string
  price: number
  credits: number
  clientId: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: packageName,
        description: `${credits} training credits`,
        amount: price,
        currency: 'czk',
      },
    ],
    metadata: {
      packageId,
      clientId,
      tenantId,
      credits: credits.toString(),
      type: 'package',
    },
    successUrl,
    cancelUrl,
  })
}

// Create checkout session for invoice payment
export async function createInvoiceCheckoutSession({
  invoiceId,
  invoiceNumber,
  total,
  clientId,
  tenantId,
  successUrl,
  cancelUrl,
}: {
  invoiceId: string
  invoiceNumber: string
  total: number
  clientId: string
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
        amount: total,
        currency: 'czk',
      },
    ],
    metadata: {
      invoiceId,
      invoiceNumber,
      clientId,
      tenantId,
      type: 'invoice',
    },
    successUrl,
    cancelUrl,
  })
}

// Create checkout session for individual session payment
export async function createSessionCheckoutSession({
  sessionId,
  sessionDate,
  price,
  clientId,
  tenantId,
  successUrl,
  cancelUrl,
}: {
  sessionId: string
  sessionDate: string
  price: number
  clientId: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    lineItems: [
      {
        name: 'Tréninkový session',
        description: `Trénink dne ${sessionDate}`,
        amount: price,
        currency: 'czk',
      },
    ],
    metadata: {
      sessionId,
      clientId,
      tenantId,
      type: 'session',
    },
    successUrl,
    cancelUrl,
  })
}

// Get payment status from Stripe (with CZK currency)
export async function getPaymentStatus(sessionId: string) {
  return getPaymentStatusBase(sessionId, 'czk')
}

// Refund a payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return createRefund(paymentIntentId, {
    amount,
    currency: 'czk',
  })
}
