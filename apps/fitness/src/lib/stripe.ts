import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - payments will not work')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Helper to format amount for Stripe (converts to cents/smallest unit)
export function formatAmountForStripe(amount: number, currency: string = 'czk'): number {
  const currencies = ['czk', 'usd', 'eur', 'gbp']
  const zeroDecimalCurrencies = ['jpy', 'krw']

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount)
  }

  return Math.round(amount * 100)
}

// Helper to format Stripe amount back to display (converts from cents)
export function formatStripeAmount(amount: number, currency: string = 'czk'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw']

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount
  }

  return amount / 100
}

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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: packageName,
            description: `${credits} training credits`,
          },
          unit_amount: formatAmountForStripe(price),
        },
        quantity: 1,
      },
    ],
    metadata: {
      packageId,
      clientId,
      tenantId,
      credits: credits.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: `Faktura ${invoiceNumber}`,
            description: 'Platba faktury',
          },
          unit_amount: formatAmountForStripe(total),
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId,
      clientId,
      tenantId,
      type: 'invoice',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
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
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'czk',
          product_data: {
            name: 'Tréninkový session',
            description: `Trénink dne ${sessionDate}`,
          },
          unit_amount: formatAmountForStripe(price),
        },
        quantity: 1,
      },
    ],
    metadata: {
      sessionId,
      clientId,
      tenantId,
      type: 'session',
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
      amountTotal: session.amount_total ? formatStripeAmount(session.amount_total) : 0,
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
      amount: amount ? formatAmountForStripe(amount) : undefined,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}
