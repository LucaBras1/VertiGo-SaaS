/**
 * Google Calendar OAuth Callback
 * GET /api/calendar/google/callback - Handle OAuth callback
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exchangeCodeForTokens } from '@/lib/calendar/google/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth error
    if (error) {
      const errorUrl = new URL('/admin/settings', process.env.NEXTAUTH_URL || 'http://localhost:3009')
      errorUrl.searchParams.set('calendar_error', error)
      return NextResponse.redirect(errorUrl)
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    // Decode state to get user ID
    let userId: string
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      userId = stateData.userId
    } catch {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Save or update integration
    await prisma.calendarIntegration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'google',
        },
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiryDate,
        syncEnabled: true,
        lastSyncAt: null,
      },
      create: {
        userId,
        provider: 'google',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: tokens.expiryDate,
        calendarId: 'primary',
        syncEnabled: true,
      },
    })

    // Redirect back to settings with success
    const successUrl = new URL('/admin/settings', process.env.NEXTAUTH_URL || 'http://localhost:3009')
    successUrl.searchParams.set('calendar_connected', 'true')
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    const errorUrl = new URL('/admin/settings', process.env.NEXTAUTH_URL || 'http://localhost:3009')
    errorUrl.searchParams.set('calendar_error', 'callback_failed')
    return NextResponse.redirect(errorUrl)
  }
}
