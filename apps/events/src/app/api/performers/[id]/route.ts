import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updatePerformerSchema = z.object({
  name: z.string().min(1).optional(),
  stageName: z.string().nullable().optional(),
  type: z.enum(['fire', 'magic', 'circus', 'music', 'dance', 'comedy', 'interactive']).optional(),
  bio: z.string().nullable().optional(),
  specialties: z.array(z.string()).optional(),
  setupTime: z.number().optional(),
  performanceTime: z.number().optional(),
  breakdownTime: z.number().optional(),
  requirements: z.any().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  standardRate: z.number().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  availability: z.any().optional(),
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

    const performer = await prisma.performer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        bookings: {
          include: {
            event: {
              select: { id: true, name: true, date: true, type: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!performer) {
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 })
    }

    return NextResponse.json({ performer })
  } catch (error) {
    console.error('Error fetching performer:', error)
    return NextResponse.json({ error: 'Error fetching performer' }, { status: 500 })
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

    const existingPerformer = await prisma.performer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingPerformer) {
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = updatePerformerSchema.parse(body)

    const performer = await prisma.performer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.stageName !== undefined && { stageName: data.stageName }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.specialties !== undefined && { specialties: data.specialties }),
        ...(data.setupTime !== undefined && { setupTime: data.setupTime }),
        ...(data.performanceTime !== undefined && { performanceTime: data.performanceTime }),
        ...(data.breakdownTime !== undefined && { breakdownTime: data.breakdownTime }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.standardRate !== undefined && { standardRate: data.standardRate }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.availability !== undefined && { availability: data.availability }),
      },
    })

    return NextResponse.json({ performer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating performer:', error)
    return NextResponse.json({ error: 'Error updating performer' }, { status: 500 })
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

    const existingPerformer = await prisma.performer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingPerformer) {
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 })
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        performerId: id,
        status: { in: ['pending', 'confirmed'] },
      },
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete performer with active bookings' },
        { status: 400 }
      )
    }

    await prisma.performer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting performer:', error)
    return NextResponse.json({ error: 'Error deleting performer' }, { status: 500 })
  }
}
