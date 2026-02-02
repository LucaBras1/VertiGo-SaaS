/**
 * Stripe Integration - PartyPal
 * Payment processing for party bookings and invoices
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
} from '@vertigo/stripe'

// Re-export for convenience
export {
  stripe,
  getStripeClient,
  verifyWebhookSignature,
  toStripeAmount,
  fromStripeAmount,
}
export type { StripeEvent }

// Aliases for backwards compatibility
export const formatAmountForStripe = toStripeAmount
export const formatStripeAmount = fromStripeAmount

// Format amount for display with currency symbol
export function formatAmountForDisplay(amount: number, currency: string = 'CZK'): string {
  const displayAmount = fromStripeAmount(amount, 'czk')
  return `${displayAmount.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

// Create checkout session for party booking deposit
export async function createBookingDepositCheckout({
  orderId,
  orderNumber,
  partyDate,
  depositAmount,
  totalAmount,
  customerId,
  customerEmail,
  customerName,
  packageName,
  successUrl,
  cancelUrl,
}: {
  orderId: string
  orderNumber: string
  partyDate: string
  depositAmount: number
  totalAmount: number
  customerId: string
  customerEmail: string
  customerName: string
  packageName: string
  successUrl: string
  cancelUrl: string
}) {
  // depositAmount is already in haléře
  return createCheckoutSession({
    mode: 'payment',
    customerEmail,
    lineItems: [
      {
        name: `Záloha na oslavu - ${packageName}`,
        description: `Záloha za oslavu dne ${partyDate}. Celková cena: ${(totalAmount / 100).toLocaleString('cs-CZ')} Kč`,
        amount: depositAmount / 100, // Convert from haléře to CZK for the shared package
        currency: 'czk',
      },
    ],
    metadata: {
      orderId,
      orderNumber,
      customerId,
      type: 'deposit',
      partyDate,
    },
    successUrl,
    cancelUrl,
  })
}

// Create checkout session for full party payment
export async function createBookingFullPaymentCheckout({
  orderId,
  orderNumber,
  partyDate,
  totalAmount,
  paidDeposit,
  customerId,
  customerEmail,
  packageName,
  successUrl,
  cancelUrl,
}: {
  orderId: string
  orderNumber: string
  partyDate: string
  totalAmount: number
  paidDeposit: number
  customerId: string
  customerEmail: string
  packageName: string
  successUrl: string
  cancelUrl: string
}) {
  const remainingAmount = totalAmount - paidDeposit

  return createCheckoutSession({
    mode: 'payment',
    customerEmail,
    lineItems: [
      {
        name: `Doplatek za oslavu - ${packageName}`,
        description: `Doplatek za oslavu dne ${partyDate}. Záloha: ${(paidDeposit / 100).toLocaleString('cs-CZ')} Kč`,
        amount: remainingAmount / 100, // Convert from haléře to CZK
        currency: 'czk',
      },
    ],
    metadata: {
      orderId,
      orderNumber,
      customerId,
      type: 'full_payment',
      partyDate,
    },
    successUrl,
    cancelUrl,
  })
}

// Create invoice checkout session
export async function createInvoiceCheckoutSession({
  invoiceId,
  invoiceNumber,
  total,
  customerId,
  customerEmail,
  description,
  successUrl,
  cancelUrl,
}: {
  invoiceId: string
  invoiceNumber: string
  total: number
  customerId: string
  customerEmail: string
  description: string
  successUrl: string
  cancelUrl: string
}) {
  return createCheckoutSession({
    mode: 'payment',
    customerEmail,
    lineItems: [
      {
        name: `Faktura ${invoiceNumber}`,
        description,
        amount: total / 100, // Convert from haléře to CZK
        currency: 'czk',
      },
    ],
    metadata: {
      invoiceId,
      invoiceNumber,
      customerId,
      type: 'invoice',
    },
    successUrl,
    cancelUrl,
  })
}

// Get payment status from Stripe
export async function getPaymentStatus(sessionId: string) {
  const result = await getPaymentStatusBase(sessionId, 'czk')
  return {
    status: result.status,
    amountTotal: result.amountTotal * 100, // Convert back to haléře for backwards compatibility
    customerEmail: result.customerEmail,
    metadata: result.metadata,
  }
}

// Refund a payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  return createRefund(paymentIntentId, {
    amount: amount ? amount / 100 : undefined, // Convert from haléře to CZK
    currency: 'czk',
  })
}
