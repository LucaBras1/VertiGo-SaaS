import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRevenueBreakdown } from '@/lib/analytics/metrics-aggregator'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const now = new Date()

    // Default to current month
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), 1)

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get current period
    const currentPeriod = await getRevenueBreakdown(
      session.user.tenantId,
      startDate,
      endDate
    )

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStart = new Date(startDate.getTime() - periodLength)
    const previousEnd = new Date(startDate.getTime() - 1)

    const previousPeriod = await getRevenueBreakdown(
      session.user.tenantId,
      previousStart,
      previousEnd
    )

    // Calculate growth
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return NextResponse.json({
      current: currentPeriod,
      previous: previousPeriod,
      growth: {
        sessions: calculateGrowth(currentPeriod.sessions, previousPeriod.sessions),
        packages: calculateGrowth(currentPeriod.packages, previousPeriod.packages),
        subscriptions: calculateGrowth(currentPeriod.subscriptions, previousPeriod.subscriptions),
        other: calculateGrowth(currentPeriod.other, previousPeriod.other),
        total: calculateGrowth(currentPeriod.total, previousPeriod.total),
      },
    })
  } catch (error) {
    console.error('Analytics revenue error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
