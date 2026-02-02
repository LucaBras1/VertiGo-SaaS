import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCalendarSyncStatus, syncAllShoots } from '@/lib/calendar/google'

export const dynamic = 'force-dynamic'

// GET - Get calendar integration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await getCalendarSyncStatus(session.user.tenantId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('GET /api/calendar error:', error)
    return NextResponse.json({ error: 'Failed to get calendar status' }, { status: 500 })
  }
}

// POST - Manual sync all shoots
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'sync') {
      const result = await syncAllShoots(session.user.tenantId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/calendar error:', error)
    const message = error instanceof Error ? error.message : 'Failed to sync calendar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT - Update calendar settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { calendarId, syncEnabled, syncDirection } = body

    const integration = await prisma.calendarIntegration.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    if (!integration) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
    }

    const updated = await prisma.calendarIntegration.update({
      where: { tenantId: session.user.tenantId },
      data: {
        calendarId: calendarId !== undefined ? calendarId : integration.calendarId,
        syncEnabled: syncEnabled !== undefined ? syncEnabled : integration.syncEnabled,
        syncDirection: syncDirection !== undefined ? syncDirection : integration.syncDirection,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      connected: true,
      enabled: updated.syncEnabled,
      calendarId: updated.calendarId,
      syncDirection: updated.syncDirection,
    })
  } catch (error) {
    console.error('PUT /api/calendar error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// DELETE - Disconnect calendar
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.calendarIntegration.deleteMany({
      where: { tenantId: session.user.tenantId },
    })

    // Clean up sync records
    await prisma.calendarEventSync.deleteMany({
      where: { tenantId: session.user.tenantId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/calendar error:', error)
    return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 })
  }
}
