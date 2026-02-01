import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  callTime: z.string().nullable().optional(),
  setupStart: z.string().nullable().optional(),
  performanceStart: z.string().nullable().optional(),
  performanceEnd: z.string().nullable().optional(),
  loadOut: z.string().nullable().optional(),
  agreedRate: z.number().optional(),
  deposit: z.number().nullable().optional(),
  paidAmount: z.number().optional(),
  contractSigned: z.boolean().optional(),
  contractUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        event: {
          select: { id: true, name: true, date: true, type: true, venue: true },
        },
        performer: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Error fetching booking' }, { status: 500 })
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

    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = updateBookingSchema.parse(body)

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.callTime !== undefined && { callTime: data.callTime }),
        ...(data.setupStart !== undefined && { setupStart: data.setupStart }),
        ...(data.performanceStart !== undefined && { performanceStart: data.performanceStart }),
        ...(data.performanceEnd !== undefined && { performanceEnd: data.performanceEnd }),
        ...(data.loadOut !== undefined && { loadOut: data.loadOut }),
        ...(data.agreedRate !== undefined && { agreedRate: data.agreedRate }),
        ...(data.deposit !== undefined && { deposit: data.deposit }),
        ...(data.paidAmount !== undefined && { paidAmount: data.paidAmount }),
        ...(data.contractSigned !== undefined && { contractSigned: data.contractSigned }),
        ...(data.contractUrl !== undefined && { contractUrl: data.contractUrl }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        event: { select: { id: true, name: true, date: true } },
        performer: { select: { id: true, name: true, type: true } },
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Error updating booking' }, { status: 500 })
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

    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Don't allow deleting confirmed/completed bookings
    if (existingBooking.status === 'confirmed' || existingBooking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot delete confirmed or completed bookings. Cancel it instead.' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Delete the booking
      await tx.booking.delete({
        where: { id },
      })

      // Decrement performer's total bookings if it was pending
      if (existingBooking.status === 'pending') {
        await tx.performer.update({
          where: { id: existingBooking.performerId },
          data: { totalBookings: { decrement: 1 } },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Error deleting booking' }, { status: 500 })
  }
}
