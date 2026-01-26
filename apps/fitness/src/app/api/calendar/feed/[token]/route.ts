import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/calendar/feed/[token]
 * Return calendar feed in ICS format
 *
 * TODO: Enable when CalendarFeedToken model is added to schema
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  return new NextResponse(
    'Calendar feed is not yet implemented. CalendarFeedToken model is pending schema migration.',
    { status: 501 }
  )
}
