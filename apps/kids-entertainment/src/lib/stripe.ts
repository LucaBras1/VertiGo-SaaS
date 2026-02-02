/**
 * Stripe Server-Side Integration for PartyPal
 * Lazy-loaded to avoid build-time errors when STRIPE_SECRET_KEY is not set
 */

import Stripe from 'stripe'

// Lazy-loaded Stripe client - only created when actually accessed
let _stripe: Stripe | null = null

/**
 * Get the Stripe client - lazily initialized to avoid build-time errors
 * when STRIPE_SECRET_KEY is not set
 */
export function getStripeClient(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      console.warn('STRIPE_SECRET_KEY is not set - payments will not work')
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return _stripe
}

// For backwards compatibility - using a getter ensures lazy initialization
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    // Allow typeof checks and symbol access
    if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
      return undefined
    }
    // Lazy load the actual stripe client
    const client = getStripeClient()
    const value = client[prop as keyof Stripe]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

// Helper to format amount for Stripe (converts to haléře/cents)
export function formatAmountForStripe(amount: number, currency: string = 'czk'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw']

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount)
  }

  return Math.round(amount * 100)
}

// Helper to format Stripe amount back to display (converts from haléře/cents)
export function formatStripeAmount(amount: number, currency: string = 'czk'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw']

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount
  }

  return amount / 100
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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: `Záloha na oslavu - ${packageName}`,
            description: `Záloha za oslavu dne ${partyDate}. Celková cena: ${(totalAmount / 100).toLocaleString('cs-CZ')} Kč`,
          },
          unit_amount: depositAmount, // Already in haléře
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
      orderNumber,
      customerId,
      type: 'deposit',
      partyDate,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: `Doplatek za oslavu - ${packageName}`,
            description: `Doplatek za oslavu dne ${partyDate}. Záloha: ${(paidDeposit / 100).toLocaleString('cs-CZ')} Kč`,
          },
          unit_amount: remainingAmount, // Already in haléře
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
      orderNumber,
      customerId,
      type: 'full_payment',
      partyDate,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: `Faktura ${invoiceNumber}`,
            description,
          },
          unit_amount: total, // Already in haléře
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId,
      invoiceNumber,
      customerId,
      type: 'invoice',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// Get payment status from Stripe
export async function getPaymentStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      status: session.payment_status,
      amountTotal: session.amount_total ?? 0,
      customerEmail: session.customer_email,
      metadata: session.metadata,
    }
  } catch (error) {
    console.error('Error retrieving Stripe session:', error)
    throw error
  }
}

// Refund a payment
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ?? undefined,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}
