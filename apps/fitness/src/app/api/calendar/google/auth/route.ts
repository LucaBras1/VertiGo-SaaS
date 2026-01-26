import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isGoogleCalendarConfigured, getAuthUrl } from '@/lib/calendar/google/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 503 }
      )
    }

    // Create state with user info for callback verification
    const state = Buffer.from(
      JSON.stringify({
        tenantId: session.user.tenantId,
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString('base64')

    const authUrl = getAuthUrl(state)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('GET /api/calendar/google/auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
