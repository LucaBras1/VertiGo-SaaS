import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateFeedToken } from '@/lib/calendar/sync-service'
import { generateICS } from '@/lib/calendar/apple/ics-generator'

/**
 * GET /api/calendar/feed/[token]
 * Return calendar feed in ICS format
 *
 * This endpoint is public (token-based auth) and returns an ICS file
 * that can be subscribed to by Apple Calendar, Google Calendar, etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Validate the token
    const tokenData = await validateFeedToken(token)
    if (!tokenData) {
      return new NextResponse('Invalid or expired token', { status: 401 })
    }

    const { tenantId, userId } = tokenData

    // Get tenant info for calendar name
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    })

    if (!tenant) {
      return new NextResponse('Tenant not found', { status: 404 })
    }

    // Query sessions for the next 90 days
    const now = new Date()
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const sessions = await prisma.session.findMany({
      where: {
        tenantId,
        status: { in: ['scheduled', 'completed'] },
        scheduledAt: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        client: {
          select: { name: true, email: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    // Query classes for the next 90 days
    const classes = await prisma.class.findMany({
      where: {
        tenantId,
        status: { in: ['scheduled', 'completed'] },
        scheduledAt: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    // Convert to ICS events
    const events = [
      // Sessions
      ...sessions.map(session => ({
        uid: `session-${session.id}@fitadmin.muzx.cz`,
        summary: `Training: ${session.client.name}`,
        description: session.trainerNotes || `Personal training session with ${session.client.name}`,
        start: session.scheduledAt,
        end: new Date(session.scheduledAt.getTime() + session.duration * 60 * 1000),
        attendees: session.client.email
          ? [{ name: session.client.name, email: session.client.email }]
          : undefined,
        categories: ['Training', 'Session'],
        status: session.status === 'cancelled' ? 'CANCELLED' as const : 'CONFIRMED' as const,
        created: session.createdAt,
        lastModified: session.updatedAt,
      })),
      // Classes
      ...classes.map(fitnessClass => ({
        uid: `class-${fitnessClass.id}@fitadmin.muzx.cz`,
        summary: `${fitnessClass.name} (${fitnessClass.type})`,
        description: fitnessClass.description || `${fitnessClass.type} class`,
        location: fitnessClass.location || undefined,
        start: fitnessClass.scheduledAt,
        end: new Date(fitnessClass.scheduledAt.getTime() + fitnessClass.duration * 60 * 1000),
        categories: ['Class', fitnessClass.type],
        status: fitnessClass.status === 'cancelled' ? 'CANCELLED' as const : 'CONFIRMED' as const,
        created: fitnessClass.createdAt,
        lastModified: fitnessClass.updatedAt,
      })),
    ]

    // Generate ICS
    const icsContent = generateICS({
      name: `${tenant.name} - FitAdmin`,
      description: `Training sessions and classes from ${tenant.name}`,
      timezone: 'Europe/Prague',
      events,
    })

    // Return as ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}_calendar.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('[CalendarFeed] Failed to generate feed:', error)
    return new NextResponse('Failed to generate calendar feed', { status: 500 })
  }
}
