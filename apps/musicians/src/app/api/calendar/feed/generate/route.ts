import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
// Dynamic import to avoid build-time issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

// POST /api/calendar/feed/generate - Generate or regenerate ICS feed token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert feed token
    const prisma = await getPrisma()
    const feedToken = await prisma.calendarFeedToken.upsert({
      where: {
        tenantId_userId: {
          tenantId: session.user.tenantId,
          userId: session.user.id,
        },
      },
      create: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        // token is auto-generated via @default(cuid())
      },
      update: {
        token: `feed_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
      },
    })

    // Build the feed URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://gigbook.muzx.cz'
    const feedUrl = `${baseUrl}/api/calendar/feed/${feedToken.token}`

    return NextResponse.json({
      token: feedToken.token,
      feedUrl,
    })
  } catch (error) {
    console.error('Generate feed error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    )
  }
}

// GET /api/calendar/feed/generate - Get existing feed URL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = await getPrisma()
    const feedToken = await prisma.calendarFeedToken.findUnique({
      where: {
        tenantId_userId: {
          tenantId: session.user.tenantId,
          userId: session.user.id,
        },
      },
    })

    if (!feedToken) {
      return NextResponse.json({ feedUrl: null })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://gigbook.muzx.cz'
    const feedUrl = `${baseUrl}/api/calendar/feed/${feedToken.token}`

    return NextResponse.json({
      token: feedToken.token,
      feedUrl,
    })
  } catch (error) {
    console.error('Get feed error:', error)
    return NextResponse.json(
      { error: 'Failed to get feed' },
      { status: 500 }
    )
  }
}
