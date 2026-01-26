import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/calendar/google/disconnect
 * Disconnect Google Calendar integration
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Google Calendar disconnection is not yet implemented. CalendarIntegration model is pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
