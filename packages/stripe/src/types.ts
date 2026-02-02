/**
 * @vertigo/stripe - Type definitions
 * Shared Stripe types for all VertiGo verticals
 */

import type Stripe from 'stripe'

/**
 * Supported currencies
 */
export type Currency = 'czk' | 'usd' | 'eur' | 'gbp' | 'jpy' | 'krw'

/**
 * Payment mode
 */
export type PaymentMode = 'payment' | 'subscription' | 'setup'

/**
 * Line item for checkout session
 */
export interface LineItem {
  name: string
  description?: string
  amount: number // In display units (e.g., 100 CZK, not 10000 haléřů)
  currency?: Currency
  quantity?: number
}

/**
 * Base checkout options
 */
export interface CheckoutOptions {
  mode?: PaymentMode
  lineItems: LineItem[]
  metadata?: Record<string, string>
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  currency?: Currency
}

/**
 * Checkout session result
 */
export interface CheckoutResult {
  sessionId: string
  url: string | null
}

/**
 * Payment status result
 */
export interface PaymentStatus {
  status: Stripe.Checkout.Session.PaymentStatus
  amountTotal: number // In display units
  customerEmail: string | null
  metadata: Stripe.Metadata | null
}

/**
 * Webhook event handlers map
 */
export type WebhookHandlers = {
  [K in Stripe.Event['type']]?: (
    event: Extract<Stripe.Event, { type: K }>
  ) => Promise<void> | void
}

/**
 * Refund status type
 */
export type RefundStatus = 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled'

/**
 * Refund result
 */
export interface RefundResult {
  id: string
  amount: number // In display units
  status: RefundStatus
  paymentIntentId: string | null
}

// Re-export Stripe types for convenience
export type { Stripe }
export type StripeEvent = Stripe.Event
export type StripeCheckoutSession = Stripe.Checkout.Session
export type StripePaymentIntent = Stripe.PaymentIntent
export type StripeRefund = Stripe.Refund
