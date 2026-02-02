/**
 * ICS Calendar Feed
 * GET /api/calendar/feed/[token] - Public ICS feed
 */

import { NextResponse } from 'next/server'
import { validateFeedToken, generateICSFeed } from '@/lib/calendar/apple/ics-generator'

interface RouteContext {
  params: Promise<{ token: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params

    // Validate token
    const userId = await validateFeedToken(token)
    if (!userId) {
      return new NextResponse('Invalid or expired feed token', { status: 404 })
    }

    // Generate ICS content
    const icsContent = await generateICSFeed(userId)

    // Return as .ics file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="teamforge-sessions.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating ICS feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}
