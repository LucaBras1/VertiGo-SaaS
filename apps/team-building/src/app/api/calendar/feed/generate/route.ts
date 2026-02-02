/**
 * Generate ICS Feed Token
 * POST /api/calendar/feed/generate - Generate new ICS feed URL
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateFeedToken, getFeedUrl } from '@/lib/calendar/apple/ics-generator'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Revoke existing tokens for this user
    await prisma.calendarFeedToken.deleteMany({
      where: { userId: session.user.id },
    })

    // Generate new token
    const token = await generateFeedToken(session.user.id)
    const feedUrl = getFeedUrl(token)

    return NextResponse.json({
      token,
      feedUrl,
    })
  } catch (error) {
    console.error('Error generating feed token:', error)
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get existing token
    const feedToken = await prisma.calendarFeedToken.findFirst({
      where: { userId: session.user.id },
    })

    if (!feedToken) {
      return NextResponse.json({ feedUrl: null })
    }

    return NextResponse.json({
      feedUrl: getFeedUrl(feedToken.token),
    })
  } catch (error) {
    console.error('Error getting feed:', error)
    return NextResponse.json({ error: 'Failed to get feed' }, { status: 500 })
  }
}
