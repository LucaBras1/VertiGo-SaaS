import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.classBooking.findUnique({
      where: { id: params.id },
      include: {
        class: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    // Verify class belongs to tenant
    if (booking.class.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client details
    const client = await prisma.client.findFirst({
      where: {
        id: booking.clientId,
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    })

    return NextResponse.json({
      booking: {
        ...booking,
        client,
      },
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Chyba pri nacitani rezervace' }, { status: 500 })
  }
}

// PATCH /api/bookings/[id] - Update booking (check-in, status change)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.classBooking.findUnique({
      where: { id: params.id },
      include: {
        class: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    // Verify class belongs to tenant
    if (booking.class.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { checkedIn, status, paid } = body

    const updatedBooking = await prisma.classBooking.update({
      where: { id: params.id },
      data: {
        ...(typeof checkedIn === 'boolean' && { checkedIn }),
        ...(status && { status }),
        ...(typeof paid === 'boolean' && { paid }),
      },
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Chyba pri aktualizaci rezervace' }, { status: 500 })
  }
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.classBooking.findUnique({
      where: { id: params.id },
      include: {
        class: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Rezervace nenalezena' }, { status: 404 })
    }

    // Verify class belongs to tenant
    if (booking.class.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If booking was paid with credits, refund them
    if (booking.paid) {
      const client = await prisma.client.findFirst({
        where: {
          id: booking.clientId,
          tenantId: session.user.tenantId,
        },
      })

      if (client) {
        await prisma.client.update({
          where: { id: client.id },
          data: { creditsRemaining: client.creditsRemaining + 1 },
        })
      }
    }

    // Soft delete - change status to cancelled
    await prisma.classBooking.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Chyba pri ruseni rezervace' }, { status: 500 })
  }
}
