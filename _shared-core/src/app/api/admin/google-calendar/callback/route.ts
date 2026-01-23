// API Route: /api/admin/google-calendar/callback
// Handle Google OAuth callback

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, saveGoogleCalendarTokens } from '@/lib/google-calendar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/google-calendar/callback
 * Handle OAuth callback and save tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Redirect to settings page with error
      const redirectUrl = new URL('/admin/settings/google-calendar', request.url)
      redirectUrl.searchParams.set('error', error)
      return NextResponse.redirect(redirectUrl)
    }

    if (!code) {
      const redirectUrl = new URL('/admin/settings/google-calendar', request.url)
      redirectUrl.searchParams.set('error', 'no_code')
      return NextResponse.redirect(redirectUrl)
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiryDate, email } = await exchangeCodeForTokens(code)

    // Save tokens
    await saveGoogleCalendarTokens(accessToken, refreshToken, expiryDate, email)

    // Redirect to settings page with success
    const redirectUrl = new URL('/admin/settings/google-calendar', request.url)
    redirectUrl.searchParams.set('success', 'connected')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Error in OAuth callback:', error)

    // Redirect to settings page with error
    const redirectUrl = new URL('/admin/settings/google-calendar', request.url)
    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'callback_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
