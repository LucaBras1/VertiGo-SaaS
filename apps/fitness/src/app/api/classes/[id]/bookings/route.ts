import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/classes/[id]/bookings - Get all bookings for a class
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify class belongs to tenant
    const classItem = await prisma.class.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    const bookings = await prisma.classBooking.findMany({
      where: { classId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get client details for each booking
    const clientIds = bookings.map((b) => b.clientId)
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        creditsRemaining: true,
      },
    })

    const clientMap = new Map(clients.map((c) => [c.id, c]))

    const bookingsWithClients = bookings.map((booking) => ({
      ...booking,
      client: clientMap.get(booking.clientId) || null,
    }))

    return NextResponse.json({
      bookings: bookingsWithClients,
      totalCount: bookings.length,
      checkedInCount: bookings.filter((b) => b.checkedIn).length,
      capacity: classItem.capacity,
      availableSpots: classItem.capacity - bookings.filter((b) => b.status === 'confirmed').length,
    })
  } catch (error) {
    console.error('Error fetching class bookings:', error)
    return NextResponse.json({ error: 'Chyba pri nacitani rezervaci' }, { status: 500 })
  }
}

// POST /api/classes/[id]/bookings - Create a new booking
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, useCredits = false } = body

    if (!clientId) {
      return NextResponse.json({ error: 'clientId je povinny' }, { status: 400 })
    }

    // Verify class belongs to tenant
    const classItem = await prisma.class.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        _count: {
          select: { bookings: { where: { status: 'confirmed' } } },
        },
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    // Check if class is in the future
    if (new Date(classItem.scheduledAt) < new Date()) {
      return NextResponse.json({ error: 'Nelze rezervovat minulou lekci' }, { status: 400 })
    }

    // Check capacity
    if (classItem._count.bookings >= classItem.capacity) {
      return NextResponse.json({ error: 'Lekce je plna' }, { status: 400 })
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Check for existing booking
    const existingBooking = await prisma.classBooking.findFirst({
      where: {
        classId: params.id,
        clientId,
        status: { not: 'cancelled' },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: 'Klient je jiz prihlasen na tuto lekci' }, { status: 400 })
    }

    // Handle credits if requested
    let paid = false
    if (useCredits && client.creditsRemaining > 0) {
      await prisma.client.update({
        where: { id: clientId },
        data: { creditsRemaining: client.creditsRemaining - 1 },
      })
      paid = true
    }

    // Create booking
    const booking = await prisma.classBooking.create({
      data: {
        classId: params.id,
        clientId,
        status: 'confirmed',
        paid,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Chyba pri vytvareni rezervace' }, { status: 500 })
  }
}
