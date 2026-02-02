import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteAllSyncedEvents } from '@/lib/calendar/sync-service'

// POST /api/calendar/google/disconnect - Disconnect Google Calendar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = await prisma.calendarIntegration.findUnique({
      where: {
        tenantId_userId_provider: {
          tenantId: session.user.tenantId,
          userId: session.user.id,
          provider: 'google',
        },
      },
    })

    if (!integration) {
      return NextResponse.json({ error: 'No integration found' }, { status: 404 })
    }

    // Delete all synced events from Google Calendar
    await deleteAllSyncedEvents(integration.id)

    // Delete the integration
    await prisma.calendarIntegration.delete({
      where: { id: integration.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
