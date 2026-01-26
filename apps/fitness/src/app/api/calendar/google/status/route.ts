import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/calendar/google/status
 * Check Google Calendar integration status
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Google Calendar integration is not yet implemented. CalendarIntegration model is pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
