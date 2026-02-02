/**
 * @vertigo/stripe - Subscription Prices
 * Price ID mappings for subscription tiers
 */

import type { SubscriptionTier } from './types'

/**
 * Billing interval options
 */
export type BillingInterval = 'month' | 'year'

/**
 * Price configuration for a subscription tier
 */
export interface TierPriceConfig {
  monthly: string | null // Price ID for monthly billing
  yearly: string | null // Price ID for yearly billing
  monthlyAmount: number // Amount in display units (e.g., 19 = 19 CZK/EUR)
  yearlyAmount: number // Amount in display units (yearly total)
}

/**
 * Subscription price IDs from environment variables
 * These must be configured in Stripe Dashboard first
 */
export function getSubscriptionPrices(): Record<Exclude<SubscriptionTier, 'FREE'>, TierPriceConfig> {
  return {
    STARTER: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || null,
      yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || null,
      monthlyAmount: 19,
      yearlyAmount: 190, // ~2 months free
    },
    PROFESSIONAL: {
      monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || null,
      yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || null,
      monthlyAmount: 49,
      yearlyAmount: 490, // ~2 months free
    },
    BUSINESS: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || null,
      yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || null,
      monthlyAmount: 99,
      yearlyAmount: 990, // ~2 months free
    },
    ENTERPRISE: {
      monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null,
      yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || null,
      monthlyAmount: 299,
      yearlyAmount: 2990, // ~2 months free
    },
  }
}

/**
 * Get Stripe price ID for a specific tier and interval
 * Throws if price ID is not configured
 */
export function getPriceId(tier: SubscriptionTier, interval: BillingInterval): string {
  if (tier === 'FREE') {
    throw new Error('FREE tier does not have a Stripe price')
  }

  const prices = getSubscriptionPrices()
  const tierPrices = prices[tier]

  if (!tierPrices) {
    throw new Error(`Unknown subscription tier: ${tier}`)
  }

  const priceId = interval === 'month' ? tierPrices.monthly : tierPrices.yearly

  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for ${tier} ${interval}ly. ` +
        `Set STRIPE_PRICE_${tier}_${interval.toUpperCase()}LY environment variable.`
    )
  }

  return priceId
}

/**
 * Get tier from Stripe price ID
 * Returns null if price ID doesn't match any tier
 */
export function getTierFromPriceId(
  priceId: string
): { tier: SubscriptionTier; interval: BillingInterval } | null {
  const prices = getSubscriptionPrices()

  for (const [tier, config] of Object.entries(prices)) {
    if (config.monthly === priceId) {
      return { tier: tier as SubscriptionTier, interval: 'month' }
    }
    if (config.yearly === priceId) {
      return { tier: tier as SubscriptionTier, interval: 'year' }
    }
  }

  return null
}

/**
 * Check if all price IDs are configured
 */
export function arePricesConfigured(): boolean {
  const prices = getSubscriptionPrices()
  return Object.values(prices).every((config) => config.monthly && config.yearly)
}

/**
 * Get list of missing price configurations
 */
export function getMissingPriceConfigs(): string[] {
  const prices = getSubscriptionPrices()
  const missing: string[] = []

  for (const [tier, config] of Object.entries(prices)) {
    if (!config.monthly) {
      missing.push(`STRIPE_PRICE_${tier}_MONTHLY`)
    }
    if (!config.yearly) {
      missing.push(`STRIPE_PRICE_${tier}_YEARLY`)
    }
  }

  return missing
}
