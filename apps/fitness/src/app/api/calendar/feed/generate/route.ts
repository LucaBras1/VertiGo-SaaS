import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateFeedToken, revokeFeedToken, getUserFeedTokens } from '@/lib/calendar/sync-service'

/**
 * GET /api/calendar/feed/generate
 * List existing feed tokens for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tokens = await getUserFeedTokens(session.user.tenantId, session.user.id)

    // Build feed URLs
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    const feeds = tokens.map(t => ({
      token: t.token,
      feedUrl: `${baseUrl}/api/calendar/feed/${t.token}`,
      createdAt: t.createdAt,
    }))

    return NextResponse.json({ feeds })
  } catch (error: any) {
    console.error('[CalendarFeedGenerate] Failed to list tokens:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list tokens' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/calendar/feed/generate
 * Generate a calendar feed URL
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a new token
    const token = await generateFeedToken(session.user.tenantId, session.user.id)

    // Build the feed URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    const feedUrl = `${baseUrl}/api/calendar/feed/${token}`

    return NextResponse.json({
      success: true,
      token,
      feedUrl,
      instructions: {
        apple: 'In Calendar app, go to File > New Calendar Subscription and paste the feed URL',
        google: 'In Google Calendar, click + next to "Other calendars" > From URL and paste the feed URL',
        outlook: 'In Outlook, go to Add Calendar > Subscribe from web and paste the feed URL',
      },
    })
  } catch (error: any) {
    console.error('[CalendarFeedGenerate] Failed to generate token:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate feed token' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/calendar/feed/generate
 * Revoke calendar feed URL
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get token from request body
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify the token belongs to this user before deleting
    const tokens = await getUserFeedTokens(session.user.tenantId, session.user.id)
    const tokenExists = tokens.some(t => t.token === token)

    if (!tokenExists) {
      return NextResponse.json({ error: 'Token not found or unauthorized' }, { status: 404 })
    }

    // Revoke the token
    const success = await revokeFeedToken(token)

    if (!success) {
      return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CalendarFeedGenerate] Failed to revoke token:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to revoke feed token' },
      { status: 500 }
    )
  }
}
