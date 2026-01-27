import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCohortAnalysis, getClientSegments, getTopClients } from '@/lib/analytics/cohort-analyzer'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthsBack = parseInt(searchParams.get('months') || '12')

    const [cohorts, segments, topClients] = await Promise.all([
      getCohortAnalysis(session.user.tenantId, monthsBack),
      getClientSegments(session.user.tenantId),
      getTopClients(session.user.tenantId),
    ])

    return NextResponse.json({
      cohorts,
      segments,
      topClients,
    })
  } catch (error) {
    console.error('Analytics cohorts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohort analytics' },
      { status: 500 }
    )
  }
}
