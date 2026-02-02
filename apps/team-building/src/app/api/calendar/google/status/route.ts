/**
 * Google Calendar Connection Status
 * GET /api/calendar/google/status - Get connection status
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isGoogleCalendarConfigured } from '@/lib/calendar/google/auth'
import { listCalendars } from '@/lib/calendar/google/events'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configured = isGoogleCalendarConfigured()

    if (!configured) {
      return NextResponse.json({
        configured: false,
        connected: false,
        message: 'Google Calendar not configured',
      })
    }

    const integration = await prisma.calendarIntegration.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google',
        },
      },
    })

    if (!integration || !integration.accessToken) {
      return NextResponse.json({
        configured: true,
        connected: false,
      })
    }

    // Try to list calendars to verify connection
    let calendars: Array<{ id: string; summary: string; primary: boolean }> = []
    try {
      calendars = await listCalendars(integration.accessToken, integration.refreshToken)
    } catch (error) {
      // Token might be expired
      return NextResponse.json({
        configured: true,
        connected: false,
        error: 'Token expired. Please reconnect.',
      })
    }

    return NextResponse.json({
      configured: true,
      connected: true,
      syncEnabled: integration.syncEnabled,
      calendarId: integration.calendarId,
      lastSyncAt: integration.lastSyncAt,
      calendars,
    })
  } catch (error) {
    console.error('Error checking calendar status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
