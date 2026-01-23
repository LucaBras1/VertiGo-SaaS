// API Route: /api/admin/google-calendar/auth
// Initiate Google OAuth flow

import { NextResponse } from 'next/server'
import { getGoogleCalendarSettings, getAuthUrl } from '@/lib/google-calendar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/google-calendar/auth
 * Get OAuth authorization URL
 */
export async function GET() {
  try {
    const config = await getGoogleCalendarSettings()

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Google Calendar credentials not configured' },
        { status: 400 }
      )
    }

    const authUrl = getAuthUrl(config)

    return NextResponse.json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error('Error getting auth URL:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get auth URL',
      },
      { status: 500 }
    )
  }
}
