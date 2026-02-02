import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateIcsCalendar, gigToIcsEvent } from '@/lib/calendar/apple/ics-generator'

// GET /api/calendar/feed/[token] - Get ICS feed for Apple Calendar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the feed token
    const feedToken = await prisma.calendarFeedToken.findUnique({
      where: { token },
    })

    if (!feedToken) {
      return new NextResponse('Calendar feed not found', { status: 404 })
    }

    // Check if token is expired
    if (feedToken.expiresAt && feedToken.expiresAt < new Date()) {
      return new NextResponse('Calendar feed has expired', { status: 410 })
    }

    // Get tenant info for calendar name
    const tenant = await prisma.tenant.findUnique({
      where: { id: feedToken.tenantId },
      select: { name: true, bandName: true },
    })

    // Get all gigs for this tenant
    const gigs = await prisma.gig.findMany({
      where: {
        tenantId: feedToken.tenantId,
        status: { not: 'CANCELLED' }, // Don't include cancelled gigs
        eventDate: { not: null },
      },
      orderBy: { eventDate: 'asc' },
    })

    // Convert gigs to ICS events
    const events = gigs.map((gig) =>
      gigToIcsEvent({
        id: gig.id,
        title: gig.title,
        status: gig.status,
        eventDate: gig.eventDate!,
        eventDuration: gig.eventDuration || undefined,
        venue: gig.venue as { name?: string; address?: string; city?: string } | undefined,
        clientName: gig.clientName || undefined,
        description: gig.internalNotes || undefined,
        createdAt: gig.createdAt,
        updatedAt: gig.updatedAt,
      })
    )

    // Generate ICS content
    const calendarName = tenant?.bandName || tenant?.name || 'GigBook Calendar'
    const icsContent = generateIcsCalendar(calendarName, events)

    // Return as ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${calendarName.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('ICS feed error:', error)
    return new NextResponse('Failed to generate calendar feed', { status: 500 })
  }
}
