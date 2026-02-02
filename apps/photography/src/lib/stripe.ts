/**
 * Stripe Payment Gateway - ShootFlow
 * Payment processing for photography packages and invoices
 */

import Stripe from 'stripe'

// Lazy-loaded Stripe client to avoid build-time errors
let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return _stripe
}

// Proxy for backwards compatibility
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
      return undefined
    }
    const client = getStripeClient()
    const value = client[prop as keyof Stripe]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// Types
export interface CheckoutSessionParams {
  tenantId: string
  packageId?: string
  invoiceId?: string
  clientEmail: string
  clientName: string
  amount: number // in smallest currency unit (hellers for CZK)
  currency?: string
  description: string
  paymentType: 'deposit' | 'balance' | 'full' | 'invoice'
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CheckoutSessionResult {
  sessionId: string
  url: string
}

/**
 * Create a Stripe Checkout Session for payments
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: params.clientEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency || 'czk',
          product_data: {
            name: params.description,
            metadata: {
              tenantId: params.tenantId,
              packageId: params.packageId || '',
              invoiceId: params.invoiceId || '',
              paymentType: params.paymentType,
            },
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      tenantId: params.tenantId,
      packageId: params.packageId || '',
      invoiceId: params.invoiceId || '',
      paymentType: params.paymentType,
      clientName: params.clientName,
      ...params.metadata,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    locale: 'cs', // Czech locale
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session URL')
  }

  return {
    sessionId: session.id,
    url: session.url,
  }
}

/**
 * Create checkout session for deposit payment
 */
export async function createDepositCheckoutSession(params: {
  tenantId: string
  packageId: string
  packageTitle: string
  clientEmail: string
  clientName: string
  depositAmount: number
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  return createCheckoutSession({
    tenantId: params.tenantId,
    packageId: params.packageId,
    clientEmail: params.clientEmail,
    clientName: params.clientName,
    amount: params.depositAmount,
    description: `Deposit - ${params.packageTitle}`,
    paymentType: 'deposit',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  })
}

/**
 * Create checkout session for balance payment
 */
export async function createBalanceCheckoutSession(params: {
  tenantId: string
  packageId: string
  packageTitle: string
  clientEmail: string
  clientName: string
  balanceAmount: number
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  return createCheckoutSession({
    tenantId: params.tenantId,
    packageId: params.packageId,
    clientEmail: params.clientEmail,
    clientName: params.clientName,
    amount: params.balanceAmount,
    description: `Balance Payment - ${params.packageTitle}`,
    paymentType: 'balance',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  })
}

/**
 * Create checkout session for full payment
 */
export async function createFullPaymentCheckoutSession(params: {
  tenantId: string
  packageId: string
  packageTitle: string
  clientEmail: string
  clientName: string
  totalAmount: number
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  return createCheckoutSession({
    tenantId: params.tenantId,
    packageId: params.packageId,
    clientEmail: params.clientEmail,
    clientName: params.clientName,
    amount: params.totalAmount,
    description: `Full Payment - ${params.packageTitle}`,
    paymentType: 'full',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  })
}

/**
 * Create checkout session for invoice payment
 */
export async function createInvoiceCheckoutSession(params: {
  tenantId: string
  invoiceId: string
  invoiceNumber: string
  clientEmail: string
  clientName: string
  amount: number
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  return createCheckoutSession({
    tenantId: params.tenantId,
    invoiceId: params.invoiceId,
    clientEmail: params.clientEmail,
    clientName: params.clientName,
    amount: params.amount,
    description: `Invoice ${params.invoiceNumber}`,
    paymentType: 'invoice',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  })
}

/**
 * Get checkout session status
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient()
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'customer'],
  })
}

/**
 * Get payment status from session
 */
export async function getPaymentStatus(sessionId: string): Promise<{
  status: 'pending' | 'paid' | 'failed' | 'expired'
  paymentIntentId?: string
  receiptUrl?: string
  amount?: number
  currency?: string
}> {
  const session = await getCheckoutSession(sessionId)

  let status: 'pending' | 'paid' | 'failed' | 'expired' = 'pending'
  let receiptUrl: string | undefined

  if (session.payment_status === 'paid') {
    status = 'paid'
    // Get receipt URL from payment intent
    if (session.payment_intent && typeof session.payment_intent === 'object') {
      const latestCharge = session.payment_intent.latest_charge
      if (latestCharge && typeof latestCharge === 'object' && 'receipt_url' in latestCharge) {
        receiptUrl = latestCharge.receipt_url || undefined
      }
    }
  } else if (session.status === 'expired') {
    status = 'expired'
  } else if (session.payment_status === 'unpaid' && session.status === 'complete') {
    status = 'failed'
  }

  return {
    status,
    paymentIntentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id,
    receiptUrl,
    amount: session.amount_total || undefined,
    currency: session.currency || undefined,
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  const stripe = getStripeClient()

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }

  if (amount) {
    refundParams.amount = amount
  }

  return stripe.refunds.create(refundParams)
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Format amount for display (smallest unit to main unit)
 */
export function formatAmount(amount: number, currency: string = 'CZK'): string {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
  return formatter.format(amount / 100)
}

/**
 * Convert main unit to smallest unit
 */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * 100)
}
