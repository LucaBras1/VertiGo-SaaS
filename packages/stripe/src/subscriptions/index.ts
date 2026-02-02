/**
 * @vertigo/stripe - Subscriptions Module
 * Complete subscription management for VertiGo SaaS
 *
 * @example
 * // Create subscription checkout
 * import { createSubscriptionCheckout } from '@vertigo/stripe'
 *
 * const checkout = await createSubscriptionCheckout({
 *   tenantId: 'tenant_123',
 *   tier: 'PROFESSIONAL',
 *   interval: 'month',
 *   successUrl: 'https://app.example.com/billing?success=true',
 *   cancelUrl: 'https://app.example.com/billing',
 * })
 *
 * @example
 * // Manage subscription
 * import { updateSubscription, cancelSubscription } from '@vertigo/stripe'
 *
 * // Upgrade
 * await updateSubscription({
 *   subscriptionId: 'sub_xxx',
 *   newTier: 'BUSINESS',
 * })
 *
 * // Cancel at period end
 * await cancelSubscription({
 *   subscriptionId: 'sub_xxx',
 *   cancelAtPeriodEnd: true,
 *   feedback: 'too_expensive',
 * })
 *
 * @example
 * // Customer portal
 * import { createCustomerPortalSession } from '@vertigo/stripe'
 *
 * const portal = await createCustomerPortalSession({
 *   customerId: 'cus_xxx',
 *   returnUrl: 'https://app.example.com/billing',
 * })
 *
 * @example
 * // Webhook handlers
 * import { createSubscriptionWebhookHandlers, createWebhookHandler } from '@vertigo/stripe'
 *
 * const handlers = createSubscriptionWebhookHandlers({
 *   onSubscriptionCreated: async (data) => {
 *     await prisma.tenant.update({
 *       where: { stripeCustomerId: data.customerId },
 *       data: {
 *         stripeSubscriptionId: data.subscriptionId,
 *         subscriptionTier: data.tier,
 *         subscriptionStatus: data.status,
 *       },
 *     })
 *   },
 * })
 *
 * export const POST = createWebhookHandler(process.env.STRIPE_WEBHOOK_SECRET!, handlers)
 */

// Types
export type {
  SubscriptionTier,
  SubscriptionStatus,
  CreateSubscriptionCheckoutOptions,
  SubscriptionCheckoutResult,
  UpdateSubscriptionOptions,
  CancelSubscriptionOptions,
  SubscriptionInfo,
  CustomerPortalOptions,
  CustomerPortalResult,
  SubscriptionWebhookData,
  InvoiceWebhookData,
  StripeSubscription,
  StripeInvoice,
  StripeCustomer,
} from './types'

export type { BillingInterval, TierPriceConfig } from './prices'

export type {
  SubscriptionEventCallback,
  InvoiceEventCallback,
  SubscriptionWebhookCallbacks,
} from './webhook-handlers'

// Prices
export {
  getSubscriptionPrices,
  getPriceId,
  getTierFromPriceId,
  arePricesConfigured,
  getMissingPriceConfigs,
} from './prices'

// Create
export {
  createSubscriptionCheckout,
  getOrCreateCustomer,
  getSubscriptionCheckoutSession,
  createSetupIntent,
  previewSubscriptionChange,
} from './create'

// Manage
export {
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  pauseSubscription,
  resumeSubscription,
  listCustomerSubscriptions,
  getSubscriptionUsage,
} from './manage'

// Portal
export {
  createCustomerPortalSession,
  createPortalConfiguration,
  getCustomerPaymentMethod,
  listCustomerPaymentMethods,
  setDefaultPaymentMethod,
} from './portal'

// Webhook Handlers
export {
  createSubscriptionWebhookHandlers,
  defaultSubscriptionWebhookHandlers,
} from './webhook-handlers'
