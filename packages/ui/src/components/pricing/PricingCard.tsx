'use client'

import * as React from 'react'
import { cn } from '../../utils'
import { Button } from '../Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../Card'

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE'
export type BillingInterval = 'month' | 'year'

export interface PricingCardProps {
  /** Tier identifier */
  tier: SubscriptionTier
  /** Display name for the tier */
  name: string
  /** Short description of the tier */
  description?: string
  /** Monthly price in display units */
  monthlyPrice: number
  /** Yearly price in display units (total for year) */
  yearlyPrice: number
  /** Currently selected billing interval */
  interval: BillingInterval
  /** Currency code */
  currency?: string
  /** List of features included */
  features: string[]
  /** Whether this tier is currently active */
  isCurrentPlan?: boolean
  /** Whether this is the recommended/popular tier */
  isPopular?: boolean
  /** Loading state for the CTA button */
  isLoading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** CTA button text */
  ctaText?: string
  /** Called when CTA button is clicked */
  onSelect?: (tier: SubscriptionTier, interval: BillingInterval) => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Individual pricing card for a subscription tier
 *
 * @example
 * <PricingCard
 *   tier="PROFESSIONAL"
 *   name="Professional"
 *   description="For growing businesses"
 *   monthlyPrice={49}
 *   yearlyPrice={490}
 *   interval="month"
 *   currency="EUR"
 *   features={['Unlimited bookings', 'Client management', 'Invoicing']}
 *   isPopular
 *   onSelect={(tier, interval) => handleSelect(tier, interval)}
 * />
 */
export function PricingCard({
  tier,
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  interval,
  currency = 'EUR',
  features,
  isCurrentPlan = false,
  isPopular = false,
  isLoading = false,
  disabled = false,
  ctaText,
  onSelect,
  className,
}: PricingCardProps) {
  const price = interval === 'month' ? monthlyPrice : Math.round(yearlyPrice / 12)
  const isFree = tier === 'FREE'

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCtaText = () => {
    if (ctaText) return ctaText
    if (isCurrentPlan) return 'Current Plan'
    if (isFree) return 'Get Started Free'
    return 'Subscribe'
  }

  const getCtaVariant = (): 'default' | 'outline' | 'secondary' => {
    if (isCurrentPlan) return 'secondary'
    if (isPopular) return 'default'
    return 'outline'
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isPopular && 'border-primary shadow-lg scale-105',
        isCurrentPlan && 'border-green-500 bg-green-50/50 dark:bg-green-950/20',
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
            Current Plan
          </span>
        </div>
      )}

      <CardHeader className={cn(isPopular || isCurrentPlan ? 'pt-8' : '')}>
        <CardTitle className="text-xl">{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {isFree ? 'Free' : formatPrice(price)}
            </span>
            {!isFree && <span className="text-muted-foreground">/month</span>}
          </div>
          {!isFree && interval === 'year' && (
            <p className="mt-1 text-sm text-muted-foreground">
              {formatPrice(yearlyPrice)} billed annually
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          variant={getCtaVariant()}
          className="w-full"
          disabled={disabled || isCurrentPlan || isLoading}
          loading={isLoading}
          onClick={() => onSelect?.(tier, interval)}
        >
          {getCtaText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
