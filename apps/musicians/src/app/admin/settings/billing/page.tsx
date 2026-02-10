'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vertigo/ui'

interface SubscriptionData {
  tier: string
  status: string
  interval: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialEndsAt: string | null
  hasStripeSubscription: boolean
  usage: {
    aiCreditsUsed: number
    aiCreditsLimit: number
  }
}

export default function BillingSettingsPage() {
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      const data = await response.json()
      if (data.success) {
        setSubscription(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success && data.data?.url) {
        window.location.href = data.data.url
      }
    } catch (error) {
      console.error('Failed to open portal:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    setCancelLoading(true)
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelAtPeriodEnd: true }),
      })
      const data = await response.json()
      if (data.success) {
        fetchSubscription()
      }
    } catch (error) {
      console.error('Failed to cancel:', error)
    } finally {
      setCancelLoading(false)
    }
  }

  const reactivateSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        fetchSubscription()
      }
    } catch (error) {
      console.error('Failed to reactivate:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
      case 'STARTER':
        return 'bg-blue-100 text-blue-800'
      case 'PROFESSIONAL':
        return 'bg-purple-100 text-purple-800'
      case 'BUSINESS':
        return 'bg-orange-100 text-orange-800'
      case 'ENTERPRISE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      {/* Success/Error Messages */}
      {success === 'true' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Subscription activated successfully! Thank you for your purchase.
        </div>
      )}
      {canceled === 'true' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          Checkout was canceled. No charges were made.
        </div>
      )}

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription details and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(subscription?.tier || 'FREE')}`}
                >
                  {subscription?.tier || 'FREE'}
                </span>
                {subscription?.status === 'trialing' && (
                  <span className="text-sm text-muted-foreground">
                    Trial ends {formatDate(subscription.trialEndsAt)}
                  </span>
                )}
              </div>
              {subscription?.hasStripeSubscription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.interval === 'year' ? 'Yearly' : 'Monthly'} billing
                  {subscription.currentPeriodEnd &&
                    ` • Renews ${formatDate(subscription.currentPeriodEnd)}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {subscription?.tier === 'FREE' ? (
                <Button asChild>
                  <Link href="/admin/settings/billing/pricing">Upgrade</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/admin/settings/billing/pricing">Change Plan</Link>
                  </Button>
                  {subscription?.hasStripeSubscription && (
                    <Button variant="outline" onClick={openCustomerPortal} loading={portalLoading}>
                      Manage Billing
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cancellation Notice */}
          {subscription?.cancelAtPeriodEnd && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Your subscription will be canceled at the end of the billing period (
                {formatDate(subscription.currentPeriodEnd)}). You will retain access until then.
              </p>
              <Button variant="link" className="p-0 h-auto text-yellow-800" onClick={reactivateSubscription}>
                Reactivate subscription
              </Button>
            </div>
          )}

          {/* AI Credits Usage */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">AI Credits Usage</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, ((subscription?.usage.aiCreditsUsed || 0) / (subscription?.usage.aiCreditsLimit || 100)) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {subscription?.usage.aiCreditsUsed || 0} / {subscription?.usage.aiCreditsLimit || 100}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Credits reset at the start of each billing period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.hasStripeSubscription && (
            <>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">Update your card or billing details</p>
                </div>
                <Button variant="outline" onClick={openCustomerPortal} loading={portalLoading}>
                  Update
                </Button>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Billing History</p>
                  <p className="text-sm text-muted-foreground">View and download invoices</p>
                </div>
                <Button variant="outline" onClick={openCustomerPortal} loading={portalLoading}>
                  View
                </Button>
              </div>
              {!subscription.cancelAtPeriodEnd && subscription.tier !== 'FREE' && (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-destructive">Cancel Subscription</p>
                    <p className="text-sm text-muted-foreground">
                      You will retain access until the end of your billing period
                    </p>
                  </div>
                  <Button variant="destructive" onClick={cancelSubscription} loading={cancelLoading}>
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
          {!subscription?.hasStripeSubscription && subscription?.tier === 'FREE' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Upgrade to unlock more features and AI credits
              </p>
              <Button asChild>
                <Link href="/admin/settings/billing/pricing">View Plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
