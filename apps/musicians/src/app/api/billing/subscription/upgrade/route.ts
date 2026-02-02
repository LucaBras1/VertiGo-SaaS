import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateSubscription, previewSubscriptionChange } from '@vertigo/stripe'
import { z } from 'zod'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

const UpgradeSchema = z.object({
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE']),
  interval: z.enum(['month', 'year']).optional(),
})

const PreviewSchema = z.object({
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE']),
  interval: z.enum(['month', 'year']).optional(),
})

/**
 * GET /api/billing/subscription/upgrade?tier=BUSINESS
 * Preview upgrade/downgrade costs (proration)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tier = searchParams.get('tier')
    const interval = searchParams.get('interval') as 'month' | 'year' | null

    if (!tier) {
      return NextResponse.json({ error: 'tier parameter is required' }, { status: 400 })
    }

    const parsed = PreviewSchema.parse({ tier, interval: interval || undefined })

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    })

    if (!tenant?.stripeCustomerId || !tenant?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription to upgrade' }, { status: 400 })
    }

    const preview = await previewSubscriptionChange({
      customerId: tenant.stripeCustomerId,
      subscriptionId: tenant.stripeSubscriptionId,
      newTier: parsed.tier,
      newInterval: parsed.interval,
    })

    return NextResponse.json({
      success: true,
      data: {
        amountDue: preview.amountDue,
        currency: preview.currency,
        prorationAmount: preview.prorationAmount,
        nextBillingDate: preview.nextBillingDate.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('GET /api/billing/subscription/upgrade error:', error)
    return NextResponse.json({ error: 'Failed to preview upgrade' }, { status: 500 })
  }
}

/**
 * POST /api/billing/subscription/upgrade
 * Upgrade or downgrade subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, interval } = UpgradeSchema.parse(body)

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        stripeSubscriptionId: true,
        subscriptionTier: true,
      },
    })

    if (!tenant?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription. Use subscribe endpoint first.' },
        { status: 400 }
      )
    }

    // Determine if upgrade or downgrade
    const tierOrder = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE']
    const currentIndex = tierOrder.indexOf(tenant.subscriptionTier)
    const newIndex = tierOrder.indexOf(tier)
    const isUpgrade = newIndex > currentIndex

    await updateSubscription({
      subscriptionId: tenant.stripeSubscriptionId,
      newTier: tier,
      newInterval: interval,
      // For upgrades: prorate immediately
      // For downgrades: apply at period end (handled by Stripe with create_prorations)
      prorationBehavior: isUpgrade ? 'always_invoice' : 'create_prorations',
    })

    return NextResponse.json({
      success: true,
      message: isUpgrade
        ? 'Subscription upgraded successfully'
        : 'Subscription will be changed at end of billing period',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    console.error('POST /api/billing/subscription/upgrade error:', error)
    return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 })
  }
}
