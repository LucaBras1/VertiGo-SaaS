/**
 * @vertigo/stripe - Subscription Types
 * Type definitions for subscription management
 */

import type Stripe from 'stripe'
import type { BillingInterval } from './prices'

/**
 * Subscription tiers (matching Prisma enum)
 */
export type SubscriptionTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE'

/**
 * Subscription status values from Stripe
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

/**
 * Options for creating a subscription checkout session
 */
export interface CreateSubscriptionCheckoutOptions {
  /** Tenant ID for metadata */
  tenantId: string
  /** Subscription tier to subscribe to */
  tier: Exclude<SubscriptionTier, 'FREE'>
  /** Billing interval */
  interval: BillingInterval
  /** URL to redirect after successful checkout */
  successUrl: string
  /** URL to redirect if checkout is canceled */
  cancelUrl: string
  /** Customer email (optional, for pre-filling) */
  customerEmail?: string
  /** Existing Stripe customer ID (for existing customers) */
  customerId?: string
  /** Allow promotion codes */
  allowPromotionCodes?: boolean
  /** Trial period in days */
  trialDays?: number
  /** Additional metadata */
  metadata?: Record<string, string>
}

/**
 * Result of creating a subscription checkout session
 */
export interface SubscriptionCheckoutResult {
  sessionId: string
  url: string | null
}

/**
 * Options for upgrading/downgrading a subscription
 */
export interface UpdateSubscriptionOptions {
  /** Stripe subscription ID */
  subscriptionId: string
  /** New subscription tier */
  newTier: Exclude<SubscriptionTier, 'FREE'>
  /** New billing interval (optional, keeps current if not specified) */
  newInterval?: BillingInterval
  /** Proration behavior */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
}

/**
 * Options for canceling a subscription
 */
export interface CancelSubscriptionOptions {
  /** Stripe subscription ID */
  subscriptionId: string
  /** Cancel immediately or at period end */
  cancelAtPeriodEnd?: boolean
  /** Cancellation reason */
  reason?: string
  /** Cancellation feedback (for analytics) */
  feedback?:
    | 'customer_service'
    | 'low_quality'
    | 'missing_features'
    | 'other'
    | 'switched_service'
    | 'too_complex'
    | 'too_expensive'
    | 'unused'
}

/**
 * Subscription info from Stripe
 */
export interface SubscriptionInfo {
  id: string
  status: SubscriptionStatus
  tier: SubscriptionTier
  interval: BillingInterval
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  cancelAt: Date | null
  trialEnd: Date | null
  customerId: string
  priceId: string
  quantity: number
}

/**
 * Options for creating a customer portal session
 */
export interface CustomerPortalOptions {
  /** Stripe customer ID */
  customerId: string
  /** URL to return to after portal session */
  returnUrl: string
  /** Flow type for the portal (optional) */
  flowType?: 'payment_method_update' | 'subscription_cancel' | 'subscription_update'
  /** Subscription ID for specific flows */
  subscriptionId?: string
}

/**
 * Result of creating a customer portal session
 */
export interface CustomerPortalResult {
  url: string
}

/**
 * Webhook event data for subscription events
 */
export interface SubscriptionWebhookData {
  subscriptionId: string
  customerId: string
  status: SubscriptionStatus
  tier: SubscriptionTier
  interval: BillingInterval
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  metadata: Record<string, string>
}

/**
 * Webhook event data for invoice events
 */
export interface InvoiceWebhookData {
  invoiceId: string
  customerId: string
  subscriptionId: string | null
  status: string
  amountPaid: number
  amountDue: number
  currency: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

// Re-export Stripe types for convenience
export type StripeSubscription = Stripe.Subscription
export type StripeInvoice = Stripe.Invoice
export type StripeCustomer = Stripe.Customer
