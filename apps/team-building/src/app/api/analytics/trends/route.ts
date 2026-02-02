/**
 * Analytics Trends API
 * GET /api/analytics/trends
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTrends } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'monthly'
    const months = parseInt(searchParams.get('months') || '12', 10)

    const trends = await getTrends(period, months)
    return NextResponse.json(trends)
  } catch (error) {
    console.error('Analytics trends error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics trends' }, { status: 500 })
  }
}
