import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTokensFromCode, saveTokens, getCalendarEmail } from '@/lib/calendar/google/auth'

/**
 * GET /api/calendar/google/callback
 * Handle Google Calendar OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from query params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('[GoogleCallback] OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?tab=calendar&error=${encodeURIComponent(error)}`, request.url)
      )
    }

    // Verify we have a code
    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?tab=calendar&error=missing_code', request.url)
      )
    }

    // Get the current user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.redirect(
        new URL('/login?error=session_expired', request.url)
      )
    }

    // Optionally validate state parameter for CSRF protection
    // The state should match what was sent in the initial auth request
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        if (stateData.userId !== session.user.id) {
          return NextResponse.redirect(
            new URL('/dashboard/settings?tab=calendar&error=state_mismatch', request.url)
          )
        }
      } catch {
        // State parsing failed, but we can continue if session is valid
        console.warn('[GoogleCallback] Failed to parse state, continuing with session validation')
      }
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    // Get the user's calendar email
    const calendarEmail = await getCalendarEmail(tokens)

    // Save the tokens to database
    await saveTokens(
      session.user.tenantId,
      session.user.id,
      tokens,
      calendarEmail || undefined
    )

    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?tab=calendar&success=connected', request.url)
    )
  } catch (error: any) {
    console.error('[GoogleCallback] Failed to complete OAuth:', error)
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?tab=calendar&error=${encodeURIComponent(error.message || 'oauth_failed')}`,
        request.url
      )
    )
  }
}
