import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classItem = await prisma.class.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        bookings: true,
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!classItem) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    return NextResponse.json({ class: classItem })
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Chyba při načítání lekce' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, scheduledAt, duration, capacity, location, price, status } = body

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(location !== undefined && { location: location || null }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
      },
    })

    return NextResponse.json({ class: updatedClass })
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci lekce' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Lekce nenalezena' }, { status: 404 })
    }

    // Check if there are bookings
    const bookingsCount = await prisma.classBooking.count({
      where: { classId: params.id },
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'Nelze smazat lekci s aktivními rezervacemi' },
        { status: 400 }
      )
    }

    await prisma.class.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Chyba při mazání lekce' }, { status: 500 })
  }
}
