import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRetentionAnalysis, calculateLTV, getChurnRate } from '@/lib/analytics/retention-calculator'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [retention, ltv, churn] = await Promise.all([
      getRetentionAnalysis(session.user.tenantId),
      calculateLTV(session.user.tenantId),
      getChurnRate(session.user.tenantId, startOfMonth, endOfMonth),
    ])

    return NextResponse.json({
      retention,
      ltv,
      churn,
    })
  } catch (error) {
    console.error('Analytics retention error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retention analytics' },
      { status: 500 }
    )
  }
}
