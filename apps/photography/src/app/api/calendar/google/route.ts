import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getAuthUrl,
  exchangeCodeForTokens,
  listCalendars,
  revokeAccess,
} from '@/lib/calendar/google'

export const dynamic = 'force-dynamic'

// GET - Get OAuth URL or list calendars
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    // Get OAuth URL
    if (action === 'auth') {
      const state = Buffer.from(
        JSON.stringify({ tenantId: session.user.tenantId })
      ).toString('base64')

      const url = getAuthUrl(state)
      return NextResponse.json({ url })
    }

    // List available calendars
    if (action === 'calendars') {
      const integration = await prisma.calendarIntegration.findUnique({
        where: { tenantId: session.user.tenantId },
      })

      if (!integration) {
        return NextResponse.json({ error: 'Calendar not connected' }, { status: 404 })
      }

      const calendars = await listCalendars(
        integration.accessToken,
        integration.refreshToken
      )

      return NextResponse.json({ calendars })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('GET /api/calendar/google error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process request'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Handle OAuth callback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code, state } = body

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    // Verify state if provided
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
        if (decoded.tenantId !== session.user.tenantId) {
          return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid state format' }, { status: 400 })
      }
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, tokenExpiry } = await exchangeCodeForTokens(code)

    // Get list of calendars to find primary
    const calendars = await listCalendars(accessToken, refreshToken)
    const primaryCalendar = calendars.find((c) => c.primary)

    // Save or update integration
    await prisma.calendarIntegration.upsert({
      where: { tenantId: session.user.tenantId },
      create: {
        tenantId: session.user.tenantId,
        provider: 'google',
        accessToken,
        refreshToken,
        tokenExpiry,
        calendarId: primaryCalendar?.id || calendars[0]?.id || null,
        syncEnabled: true,
      },
      update: {
        accessToken,
        refreshToken,
        tokenExpiry,
        calendarId: primaryCalendar?.id || calendars[0]?.id,
        syncError: null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      calendars,
      selectedCalendarId: primaryCalendar?.id || calendars[0]?.id,
    })
  } catch (error) {
    console.error('POST /api/calendar/google error:', error)
    const message = error instanceof Error ? error.message : 'Failed to connect calendar'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Disconnect Google Calendar
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = await prisma.calendarIntegration.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    if (integration) {
      // Try to revoke access (don't fail if it doesn't work)
      try {
        await revokeAccess(integration.accessToken)
      } catch (e) {
        console.warn('Failed to revoke Google access:', e)
      }

      // Delete integration
      await prisma.calendarIntegration.delete({
        where: { tenantId: session.user.tenantId },
      })

      // Clean up sync records
      await prisma.calendarEventSync.deleteMany({
        where: { tenantId: session.user.tenantId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/calendar/google error:', error)
    return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 })
  }
}
