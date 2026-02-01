import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createBookingSchema = z.object({
  eventId: z.string(),
  performerId: z.string(),
  callTime: z.string().optional(),
  setupStart: z.string().optional(),
  performanceStart: z.string().optional(),
  performanceEnd: z.string().optional(),
  loadOut: z.string().optional(),
  agreedRate: z.number(),
  deposit: z.number().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const performerId = searchParams.get('performerId')
    const status = searchParams.get('status')

    const bookings = await prisma.booking.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(eventId && { eventId }),
        ...(performerId && { performerId }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: { id: true, name: true, date: true, type: true },
        },
        performer: {
          select: { id: true, name: true, stageName: true, type: true },
        },
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createBookingSchema.parse(body)

    // Verify event belongs to tenant
    const event = await prisma.event.findFirst({
      where: { id: data.eventId, tenantId: session.user.tenantId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Verify performer belongs to tenant
    const performer = await prisma.performer.findFirst({
      where: { id: data.performerId, tenantId: session.user.tenantId },
    })

    if (!performer) {
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 })
    }

    // Check for existing booking of same performer for same event
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventId: data.eventId,
        performerId: data.performerId,
        status: { not: 'cancelled' },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This performer is already booked for this event' },
        { status: 400 }
      )
    }

    // Create booking and update performer's totalBookings
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          tenantId: session.user.tenantId,
          eventId: data.eventId,
          performerId: data.performerId,
          status: 'pending',
          callTime: data.callTime,
          setupStart: data.setupStart,
          performanceStart: data.performanceStart,
          performanceEnd: data.performanceEnd,
          loadOut: data.loadOut,
          agreedRate: data.agreedRate,
          deposit: data.deposit,
          notes: data.notes,
        },
        include: {
          event: { select: { id: true, name: true, date: true } },
          performer: { select: { id: true, name: true, type: true } },
        },
      })

      // Update performer's total bookings count
      await tx.performer.update({
        where: { id: data.performerId },
        data: { totalBookings: { increment: 1 } },
      })

      return newBooking
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Error creating booking' }, { status: 500 })
  }
}
