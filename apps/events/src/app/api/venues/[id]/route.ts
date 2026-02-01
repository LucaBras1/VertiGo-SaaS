import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateVenueSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['indoor', 'outdoor', 'mixed']).optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),
  setupAccessTime: z.string().nullable().optional(),
  curfew: z.string().nullable().optional(),
  restrictions: z.array(z.string()).optional(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
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

    const venue = await prisma.venue.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        events: {
          select: { id: true, name: true, date: true, type: true, status: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json({ error: 'Error fetching venue' }, { status: 500 })
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

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = updateVenueSchema.parse(body)

    const venue = await prisma.venue.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.setupAccessTime !== undefined && { setupAccessTime: data.setupAccessTime }),
        ...(data.curfew !== undefined && { curfew: data.curfew }),
        ...(data.restrictions !== undefined && { restrictions: data.restrictions }),
        ...(data.contactName !== undefined && { contactName: data.contactName }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })

    return NextResponse.json({ venue })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating venue:', error)
    return NextResponse.json({ error: 'Error updating venue' }, { status: 500 })
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

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Check for upcoming events at this venue
    const upcomingEvents = await prisma.event.count({
      where: {
        venueId: id,
        date: { gte: new Date() },
        status: { in: ['planning', 'confirmed'] },
      },
    })

    if (upcomingEvents > 0) {
      return NextResponse.json(
        { error: 'Cannot delete venue with upcoming events' },
        { status: 400 }
      )
    }

    await prisma.venue.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json({ error: 'Error deleting venue' }, { status: 500 })
  }
}
