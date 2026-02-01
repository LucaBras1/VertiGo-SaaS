import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createVenueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['indoor', 'outdoor', 'mixed']),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.number().optional(),
  setupAccessTime: z.string().optional(),
  curfew: z.string().optional(),
  restrictions: z.array(z.string()).default([]),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const venues = await prisma.venue.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })

    return NextResponse.json({ venues })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json({ error: 'Error fetching venues' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = createVenueSchema.parse(body)

    const venue = await prisma.venue.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        capacity: data.capacity,
        setupAccessTime: data.setupAccessTime,
        curfew: data.curfew,
        restrictions: data.restrictions,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        notes: data.notes,
      },
    })

    return NextResponse.json({ venue }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating venue:', error)
    return NextResponse.json({ error: 'Error creating venue' }, { status: 500 })
  }
}
