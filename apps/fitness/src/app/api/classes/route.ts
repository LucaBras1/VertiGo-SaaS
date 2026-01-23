import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classes = await prisma.class.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Chyba při načítání lekcí' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, scheduledAt, duration, capacity, location, price } = body

    if (!name || !scheduledAt || !duration || !capacity) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        description: description || null,
        type: 'general',
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        location: location || null,
        price: parseFloat(price) || 0,
        status: 'scheduled',
      },
    })

    return NextResponse.json({ class: newClass }, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Chyba při vytváření lekce' }, { status: 500 })
  }
}
