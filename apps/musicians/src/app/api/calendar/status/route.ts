import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
// GET /api/calendar/status - Get calendar integration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await prisma.calendarIntegration.findMany({
      where: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        calendarId: true,
        syncEnabled: true,
        lastSyncAt: true,
        syncErrors: true,
      },
    })

    const result: Record<string, any> = {}

    for (const integration of integrations) {
      result[integration.provider] = {
        id: integration.id,
        provider: integration.provider,
        calendarId: integration.calendarId,
        syncEnabled: integration.syncEnabled,
        lastSyncAt: integration.lastSyncAt?.toISOString(),
        syncErrors: integration.syncErrors,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Calendar status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar status' },
      { status: 500 }
    )
  }
}
