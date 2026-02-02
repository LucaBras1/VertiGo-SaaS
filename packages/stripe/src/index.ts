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
 * // Webhook handler
 * import { createWebhookHandler } from '@vertigo/stripe'
 *
 * export const POST = createWebhookHandler(process.env.STRIPE_WEBHOOK_SECRET!, {
 *   'checkout.session.completed': async (event) => {
 *     const session = event.data.object
 *     // Handle successful payment
 *   },
 * })
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
