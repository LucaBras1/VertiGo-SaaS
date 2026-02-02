/**
 * Analytics Retention API
 * GET /api/analytics/retention
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRetentionAnalysis, getChurnData, calculateLTV, getCustomerSegments } from '@/lib/analytics'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [retention, churn, ltv, segments] = await Promise.all([
      getRetentionAnalysis(),
      getChurnData(),
      calculateLTV(),
      getCustomerSegments(),
    ])

    return NextResponse.json({
      retention,
      churn,
      ltv,
      segments,
    })
  } catch (error) {
    console.error('Analytics retention error:', error)
    return NextResponse.json({ error: 'Failed to fetch retention analytics' }, { status: 500 })
  }
}
