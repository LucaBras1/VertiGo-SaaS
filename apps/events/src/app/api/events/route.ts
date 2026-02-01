import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'gala', 'concert', 'product_launch']),
  date: z.string().transform((val) => new Date(val)),
  startTime: z.string(),
  endTime: z.string(),
  guestCount: z.number().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  venueId: z.string().optional(),
  venueCustom: z.string().optional(),
  clientId: z.string().optional(),
  totalBudget: z.number().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const events = await prisma.event.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && { status }),
      },
      orderBy: { date: 'desc' },
      include: {
        venue: true,
        client: true,
        _count: {
          select: { bookings: true, tasks: true },
        },
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createEventSchema.parse(body)

    // Verify venue belongs to tenant if provided
    if (data.venueId) {
      const venue = await prisma.venue.findFirst({
        where: { id: data.venueId, tenantId: session.user.tenantId },
      })
      if (!venue) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
      }
    }

    // Verify client belongs to tenant if provided
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId, tenantId: session.user.tenantId },
      })
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
    }

    const event = await prisma.event.create({
      data: {
        tenantId: session.user.tenantId,
        createdById: session.user.id,
        name: data.name,
        type: data.type,
        status: 'planning',
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        guestCount: data.guestCount,
        description: data.description,
        notes: data.notes,
        venueId: data.venueId,
        venueCustom: data.venueCustom,
        clientId: data.clientId,
        totalBudget: data.totalBudget,
      },
      include: {
        venue: true,
        client: true,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 })
  }
}
