import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/cron/session-reminders
 * Cron job for sending session reminders
 *
 * TODO: Enable when NotificationPreference model is added to schema
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Session reminders cron is not yet implemented. NotificationPreference model is pending schema migration.',
      status: 'pending_implementation'
    },
    { status: 501 }
  )
}
