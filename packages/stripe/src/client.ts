/**
 * @vertigo/stripe - Stripe Client
 * Lazy-loaded Stripe client to avoid build-time errors
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Stripe API version - update when needed
 */
export const STRIPE_API_VERSION = '2025-02-24.acacia' as const

/**
 * Get or create Stripe client instance
 * Throws if STRIPE_SECRET_KEY is not set
 */
export function getStripeClient(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      console.warn('[Stripe] STRIPE_SECRET_KEY is not set - payments will not work')
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    })
  }
  return _stripe
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/**
 * Lazy-loaded Stripe proxy for backwards compatibility
 * Allows using `stripe.` syntax without explicit initialization
 *
 * @example
 * import { stripe } from '@vertigo/stripe'
 * const session = await stripe.checkout.sessions.create({...})
 */
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
