import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTimeline, TimelineInputSchema, type TimelineInput } from '@/lib/ai/timeline-optimizer'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = TimelineInputSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const input: TimelineInput = validationResult.data

    // Generate timeline using AI algorithm
    const timeline = await generateTimeline(input, {
      tenantId: session.user.tenantId,
    })

    // Optionally save to event if eventId provided
    const eventId = body.eventId as string | undefined
    if (eventId) {
      // Verify event belongs to tenant
      const event = await prisma.event.findFirst({
        where: { id: eventId, tenantId: session.user.tenantId },
      })

      if (event) {
        await prisma.event.update({
          where: { id: eventId },
          data: { timeline },
        })
      }
    }

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error('Error generating timeline:', error)
    return NextResponse.json(
      { error: 'Error generating timeline' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId: session.user.tenantId },
      select: { timeline: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ timeline: event.timeline })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Error fetching timeline' }, { status: 500 })
  }
}
