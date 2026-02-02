import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokensFromCode, getCalendarList } from '@/lib/calendar/google/auth'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
// GET /api/calendar/google/callback - OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?calendar=error&message=' + encodeURIComponent(error), request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?calendar=error&message=missing_params', request.url)
      )
    }

    // Decode state
    let stateData: { tenantId: string; userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.redirect(
        new URL('/dashboard/settings?calendar=error&message=invalid_state', request.url)
      )
    }

    // Check state is not too old (15 min)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?calendar=error&message=expired_state', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?calendar=error&message=no_tokens', request.url)
      )
    }

    // Get list of calendars to pick the primary one
    const calendars = await getCalendarList(tokens.access_token, tokens.refresh_token)
    const primaryCalendar = calendars.find(c => c.primary) || calendars[0]

    // Store or update integration
    await prisma.calendarIntegration.upsert({
      where: {
        tenantId_userId_provider: {
          tenantId: stateData.tenantId,
          userId: stateData.userId,
          provider: 'google',
        },
      },
      create: {
        tenantId: stateData.tenantId,
        userId: stateData.userId,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarId: primaryCalendar?.id || 'primary',
        syncEnabled: true,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarId: primaryCalendar?.id || 'primary',
        syncEnabled: true,
        syncErrors: undefined,
      },
    })

    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=success', request.url)
    )
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?calendar=error&message=callback_error', request.url)
    )
  }
}
