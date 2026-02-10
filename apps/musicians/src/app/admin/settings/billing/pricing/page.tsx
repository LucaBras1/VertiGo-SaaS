'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingTable, defaultTiers } from '@vertigo/ui'
import type { SubscriptionTier, BillingInterval } from '@vertigo/ui'

export default function PricingPage() {
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | undefined>()

  const handleSelectTier = async (tier: SubscriptionTier, interval: BillingInterval) => {
    if (tier === 'FREE') {
      // Already on free tier or downgrade - show confirmation
      return
    }

    setLoadingTier(tier)

    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.data?.url) {
        window.location.href = data.data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      // TODO: Show error toast
    } finally {
      setLoadingTier(undefined)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose your plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the plan that best fits your needs. Upgrade anytime, cancel anytime.
        </p>
      </div>

      <PricingTable
        tiers={defaultTiers}
        currency="EUR"
        defaultInterval="month"
        loadingTier={loadingTier}
        onSelectTier={handleSelectTier}
        yearlySavings="Save 17%"
      />

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>All plans include a 14-day free trial. No credit card required.</p>
        <p className="mt-2">
          Need a custom plan?{' '}
          <a href="mailto:sales@vertigo.app" className="text-primary hover:underline">
            Contact sales
          </a>
        </p>
      </div>
    </div>
  )
}
