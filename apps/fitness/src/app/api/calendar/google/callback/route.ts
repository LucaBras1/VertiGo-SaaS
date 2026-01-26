import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/calendar/google/callback
 * Handle Google Calendar OAuth callback
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function GET(request: NextRequest) {
  // Redirect to settings with error message
  return NextResponse.redirect(
    new URL('/dashboard/settings?error=calendar_not_implemented', request.url)
  )
}
