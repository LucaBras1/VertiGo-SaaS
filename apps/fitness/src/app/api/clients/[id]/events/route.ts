import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTimelineEvent, TimelineEventType } from '@/lib/timeline/event-aggregator'
import { z } from 'zod'

const createEventSchema = z.object({
  eventType: z.enum([
    'milestone',
    'note',
    'session_completed',
    'measurement_recorded',
    'package_purchased',
  ] as const),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
  isMilestone: z.boolean().optional(),
  eventDate: z.string().datetime().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: clientId } = await params
    const body = await request.json()

    // Validate request body
    const result = createEventSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { eventType, title, description, metadata, isMilestone, eventDate } = result.data

    const event = await createTimelineEvent({
      clientId,
      tenantId: session.user.tenantId,
      eventType: eventType as TimelineEventType,
      title,
      description,
      metadata,
      isMilestone: isMilestone ?? eventType === 'milestone',
      eventDate: eventDate ? new Date(eventDate) : undefined,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
