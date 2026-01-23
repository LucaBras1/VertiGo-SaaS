// API Route: /api/admin/google-calendar
// Google Calendar settings management

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  saveGoogleCalendarCredentials,
  saveCalendarId,
  disconnectGoogleCalendar,
  listCalendars,
  isGoogleCalendarConfigured,
} from '@/lib/google-calendar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/google-calendar
 * Get Google Calendar settings status
 */
export async function GET() {
  try {
    const settings = await prisma.googleCalendarSettings.findFirst()

    return NextResponse.json({
      success: true,
      settings: {
        isConfigured: settings?.isConfigured || false,
        hasCredentials: !!(settings?.clientId && settings?.clientSecretEnc),
        connectedEmail: settings?.connectedEmail || null,
        connectedAt: settings?.connectedAt || null,
        calendarId: settings?.calendarId || null,
      },
    })
  } catch (error) {
    console.error('Error fetching Google Calendar settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/google-calendar
 * Save Google Calendar credentials or calendar ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, clientId, clientSecret, calendarId } = body

    if (action === 'save-credentials') {
      if (!clientId || !clientSecret) {
        return NextResponse.json(
          { success: false, error: 'Client ID a Client Secret jsou povinne' },
          { status: 400 }
        )
      }

      await saveGoogleCalendarCredentials(clientId, clientSecret)

      return NextResponse.json({
        success: true,
        message: 'Credentials ulozeny',
      })
    }

    if (action === 'save-calendar') {
      if (!calendarId) {
        return NextResponse.json(
          { success: false, error: 'Calendar ID je povinny' },
          { status: 400 }
        )
      }

      await saveCalendarId(calendarId)

      return NextResponse.json({
        success: true,
        message: 'Calendar ID ulozen',
      })
    }

    if (action === 'disconnect') {
      await disconnectGoogleCalendar()

      return NextResponse.json({
        success: true,
        message: 'Google Calendar odpojen',
      })
    }

    if (action === 'list-calendars') {
      const isConfigured = await isGoogleCalendarConfigured()
      if (!isConfigured) {
        return NextResponse.json(
          { success: false, error: 'Google Calendar neni propojen' },
          { status: 400 }
        )
      }

      const calendars = await listCalendars()

      return NextResponse.json({
        success: true,
        calendars,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Neznama akce' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in Google Calendar action:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
      },
      { status: 500 }
    )
  }
}
