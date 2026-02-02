/**
 * Analytics Revenue API
 * GET /api/analytics/revenue
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRevenueBreakdown, getProgramPerformance, getObjectiveAnalysis } from '@/lib/analytics'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [breakdown, programs, objectives] = await Promise.all([
      getRevenueBreakdown(),
      getProgramPerformance(),
      getObjectiveAnalysis(),
    ])

    return NextResponse.json({
      breakdown,
      programs,
      objectives,
    })
  } catch (error) {
    console.error('Analytics revenue error:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 })
  }
}
