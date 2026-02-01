import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'gala', 'concert', 'product_launch']).optional(),
  status: z.enum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  guestCount: z.number().optional(),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  venueId: z.string().nullable().optional(),
  venueCustom: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  totalBudget: z.number().nullable().optional(),
  spentAmount: z.number().optional(),
  timeline: z.any().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        venue: true,
        client: true,
        bookings: {
          include: {
            performer: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Error fetching event' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = updateEventSchema.parse(body)

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.guestCount !== undefined && { guestCount: data.guestCount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.venueId !== undefined && { venueId: data.venueId }),
        ...(data.venueCustom !== undefined && { venueCustom: data.venueCustom }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.totalBudget !== undefined && { totalBudget: data.totalBudget }),
        ...(data.spentAmount !== undefined && { spentAmount: data.spentAmount }),
        ...(data.timeline !== undefined && { timeline: data.timeline }),
      },
      include: {
        venue: true,
        client: true,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Error updating event' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event has bookings
    const bookingsCount = await prisma.booking.count({
      where: { eventId: id },
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with active bookings' },
        { status: 400 }
      )
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Error deleting event' }, { status: 500 })
  }
}
