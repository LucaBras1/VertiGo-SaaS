/**
 * Analytics Overview API
 * GET /api/analytics/overview
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOverviewMetrics } from '@/lib/analytics'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics = await getOverviewMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics overview' }, { status: 500 })
  }
}
