/**
 * @vertigo/stripe
 * Shared Stripe payment integration for VertiGo SaaS
 *
 * @example
 * // Basic checkout session
 * import { createCheckoutSession, toStripeAmount } from '@vertigo/stripe'
 *
 * const session = await createCheckoutSession({
 *   lineItems: [
 *     { name: 'Premium Package', amount: 1000, description: '10 credits' }
 *   ],
 *   metadata: { packageId: '123', clientId: '456' },
 *   successUrl: 'https://app.example.com/success',
 *   cancelUrl: 'https://app.example.com/cancel',
 * })
 *
 * @example
 * // Subscription checkout
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
 * // Subscription management
 * import { updateSubscription, cancelSubscription } from '@vertigo/stripe'
 *
 * await updateSubscription({ subscriptionId: 'sub_xxx', newTier: 'BUSINESS' })
 * await cancelSubscription({ subscriptionId: 'sub_xxx', cancelAtPeriodEnd: true })
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
 * // Subscription webhook handler
 * import { createSubscriptionWebhookHandlers, createWebhookHandler } from '@vertigo/stripe'
 *
 * const handlers = createSubscriptionWebhookHandlers({
 *   onSubscriptionCreated: async (data) => {
 *     await db.tenant.update({ ... })
 *   },
 * })
 * export const POST = createWebhookHandler(process.env.STRIPE_WEBHOOK_SECRET!, handlers)
 *
 * @example
 * // Direct Stripe client access
 * import { stripe } from '@vertigo/stripe'
 *
 * const customer = await stripe.customers.create({
 *   email: 'customer@example.com',
 * })
 *
 * @example
 * // Amount utilities
 * import { toStripeAmount, fromStripeAmount, formatAmountForDisplay } from '@vertigo/stripe'
 *
 * toStripeAmount(100, 'czk')           // 10000 (haléře)
 * fromStripeAmount(10000, 'czk')       // 100 (CZK)
 * formatAmountForDisplay(100, 'czk')   // "100,00 Kč"
 */

// Client
export { stripe, getStripeClient, isStripeConfigured, STRIPE_API_VERSION } from './client'

// Types
export type {
  Currency,
  PaymentMode,
  LineItem,
  CheckoutOptions,
  CheckoutResult,
  PaymentStatus,
  WebhookHandlers,
  RefundResult,
  RefundStatus,
  Stripe,
  StripeEvent,
  StripeCheckoutSession,
  StripePaymentIntent,
  StripeRefund,
} from './types'

// Amount utilities
export {
  toStripeAmount,
  fromStripeAmount,
  formatAmountForDisplay,
  parseAmount,
} from './utils/index'

// Checkout
export {
  createCheckoutSession,
  getCheckoutSession,
  listCheckoutSessions,
} from './checkout/index'

// Webhooks
export {
  verifyWebhookSignature,
  createWebhookHandler,
  parseWebhookEvent,
} from './webhooks/index'

// Payments
export {
  getPaymentStatus,
  getPaymentIntent,
  cancelPaymentIntent,
  listPaymentIntents,
  createRefund,
  getRefund,
  listRefunds,
} from './payments/index'

// Subscriptions
export {
  // Types
  type SubscriptionTier,
  type SubscriptionStatus,
  type CreateSubscriptionCheckoutOptions,
  type SubscriptionCheckoutResult,
  type UpdateSubscriptionOptions,
  type CancelSubscriptionOptions,
  type SubscriptionInfo,
  type CustomerPortalOptions,
  type CustomerPortalResult,
  type SubscriptionWebhookData,
  type InvoiceWebhookData,
  type BillingInterval,
  type TierPriceConfig,
  type SubscriptionEventCallback,
  type InvoiceEventCallback,
  type SubscriptionWebhookCallbacks,
  // Prices
  getSubscriptionPrices,
  getPriceId,
  getTierFromPriceId,
  arePricesConfigured,
  getMissingPriceConfigs,
  // Create
  createSubscriptionCheckout,
  getOrCreateCustomer,
  getSubscriptionCheckoutSession,
  createSetupIntent,
  previewSubscriptionChange,
  // Manage
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  pauseSubscription,
  resumeSubscription,
  listCustomerSubscriptions,
  getSubscriptionUsage,
  // Portal
  createCustomerPortalSession,
  createPortalConfiguration,
  getCustomerPaymentMethod,
  listCustomerPaymentMethods,
  setDefaultPaymentMethod,
  // Webhook Handlers
  createSubscriptionWebhookHandlers,
  defaultSubscriptionWebhookHandlers,
} from './subscriptions/index'
