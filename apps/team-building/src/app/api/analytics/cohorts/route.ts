/**
 * Analytics Cohorts API
 * GET /api/analytics/cohorts
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCohortAnalysis, getIndustryCohorts, getTeamSizeCohorts } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'monthly'
    const months = parseInt(searchParams.get('months') || '12', 10)

    if (type === 'industry') {
      const cohorts = await getIndustryCohorts()
      return NextResponse.json({ type: 'industry', cohorts })
    }

    if (type === 'teamSize') {
      const cohorts = await getTeamSizeCohorts()
      return NextResponse.json({ type: 'teamSize', cohorts })
    }

    // Default: monthly cohorts
    const analysis = await getCohortAnalysis(months)
    return NextResponse.json({ type: 'monthly', ...analysis })
  } catch (error) {
    console.error('Analytics cohorts error:', error)
    return NextResponse.json({ error: 'Failed to fetch cohort analytics' }, { status: 500 })
  }
}
