import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClientStats } from '@/lib/services/clients'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

/**
 * GET /api/clients/stats
 * Get client statistics for dashboard
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getClientStats(session.user.tenantId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('GET /api/clients/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client stats' },
      { status: 500 }
    )
  }
}
