'use client'

import * as React from 'react'
import { useState } from 'react'
import { cn } from '../../utils'
import { PricingCard, type SubscriptionTier, type BillingInterval } from './PricingCard'
import { PricingToggle } from './PricingToggle'

export interface TierConfig {
  tier: SubscriptionTier
  name: string
  description?: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  isPopular?: boolean
}

export interface PricingTableProps {
  /** Array of tier configurations */
  tiers: TierConfig[]
  /** Currently active tier (if any) */
  currentTier?: SubscriptionTier
  /** Currency code */
  currency?: string
  /** Default billing interval */
  defaultInterval?: BillingInterval
  /** Tier currently being processed */
  loadingTier?: SubscriptionTier
  /** Called when user selects a tier */
  onSelectTier?: (tier: SubscriptionTier, interval: BillingInterval) => void
  /** Additional CSS classes */
  className?: string
  /** Show billing toggle */
  showToggle?: boolean
  /** Yearly savings label */
  yearlySavings?: string
}

/**
 * Complete pricing table with multiple tiers and billing toggle
 *
 * @example
 * const tiers = [
 *   {
 *     tier: 'FREE',
 *     name: 'Free',
 *     description: 'For individuals',
 *     monthlyPrice: 0,
 *     yearlyPrice: 0,
 *     features: ['Basic booking', 'Calendar view'],
 *   },
 *   {
 *     tier: 'PROFESSIONAL',
 *     name: 'Professional',
 *     description: 'For growing businesses',
 *     monthlyPrice: 49,
 *     yearlyPrice: 490,
 *     features: ['All Starter features', 'Invoicing', 'Custom branding'],
 *     isPopular: true,
 *   },
 * ]
 *
 * <PricingTable
 *   tiers={tiers}
 *   currentTier="FREE"
 *   currency="EUR"
 *   onSelectTier={(tier, interval) => handleSubscribe(tier, interval)}
 * />
 */
export function PricingTable({
  tiers,
  currentTier,
  currency = 'EUR',
  defaultInterval = 'month',
  loadingTier,
  onSelectTier,
  className,
  showToggle = true,
  yearlySavings = 'Save 17%',
}: PricingTableProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval)

  // Filter out FREE tier if showing paid tiers only
  const visibleTiers = tiers

  return (
    <div className={cn('space-y-8', className)}>
      {/* Billing Toggle */}
      {showToggle && (
        <PricingToggle value={interval} onChange={setInterval} yearlySavings={yearlySavings} />
      )}

      {/* Pricing Cards Grid */}
      <div
        className={cn(
          'grid gap-6',
          visibleTiers.length === 1 && 'max-w-md mx-auto',
          visibleTiers.length === 2 && 'md:grid-cols-2 max-w-3xl mx-auto',
          visibleTiers.length === 3 && 'md:grid-cols-3 max-w-5xl mx-auto',
          visibleTiers.length === 4 && 'md:grid-cols-2 lg:grid-cols-4',
          visibleTiers.length >= 5 && 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        )}
      >
        {visibleTiers.map((tierConfig) => (
          <PricingCard
            key={tierConfig.tier}
            tier={tierConfig.tier}
            name={tierConfig.name}
            description={tierConfig.description}
            monthlyPrice={tierConfig.monthlyPrice}
            yearlyPrice={tierConfig.yearlyPrice}
            interval={interval}
            currency={currency}
            features={tierConfig.features}
            isCurrentPlan={currentTier === tierConfig.tier}
            isPopular={tierConfig.isPopular}
            isLoading={loadingTier === tierConfig.tier}
            disabled={!!loadingTier}
            onSelect={onSelectTier}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Default tier configurations matching VertiGo SaaS pricing
 * Import and customize these in your app
 */
export const defaultTiers: TierConfig[] = [
  {
    tier: 'FREE',
    name: 'Free',
    description: 'For individuals getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Basic booking', 'Calendar view', '5 AI requests/month', 'Community support'],
  },
  {
    tier: 'STARTER',
    name: 'Starter',
    description: 'For freelancers',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Unlimited bookings',
      'Client management',
      '50 AI requests/month',
      'Email notifications',
      'Email support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'All Starter features',
      'Invoicing & payments',
      '200 AI requests/month',
      'Custom branding',
      'Priority support',
    ],
    isPopular: true,
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    description: 'For teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'All Professional features',
      'Team members (5)',
      '500 AI requests/month',
      'API access',
      'Advanced analytics',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      'All Business features',
      'Unlimited team members',
      'Unlimited AI requests',
      'Custom domain',
      'SLA & dedicated support',
    ],
  },
]
