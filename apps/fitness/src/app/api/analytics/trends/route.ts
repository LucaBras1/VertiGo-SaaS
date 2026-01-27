import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTrends } from '@/lib/analytics/metrics-aggregator'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'monthly'
    const now = new Date()

    let startDate: Date
    let endDate: Date = now

    // Determine date range based on period
    switch (period) {
      case 'daily':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 84) // 12 weeks
        break
      case 'monthly':
      default:
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 12)
        break
    }

    const trends = await getTrends(
      session.user.tenantId,
      period,
      startDate,
      endDate
    )

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      trends,
    })
  } catch (error) {
    console.error('Analytics trends error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trend analytics' },
      { status: 500 }
    )
  }
}
