import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSequenceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  triggerType: z.enum([
    'client_created',
    'package_purchased',
    'session_completed',
    'days_inactive',
    'membership_expiring',
    'manual',
  ]).optional(),
  triggerConfig: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        enrollments: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            emails: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sequence)
  } catch (error) {
    console.error('Email sequence fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequence' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const result = updateSequenceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Verify sequence belongs to tenant
    const existing = await prisma.emailSequence.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Prepare data with proper JSON handling for Prisma 7
    const { triggerConfig, ...rest } = result.data

    const sequence = await prisma.emailSequence.update({
      where: { id },
      data: {
        ...rest,
        ...(triggerConfig !== undefined && {
          triggerConfig: triggerConfig === null
            ? { set: null }
            : triggerConfig,
        }),
      } as any,
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(sequence)
  } catch (error) {
    console.error('Email sequence update error:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify sequence belongs to tenant
    const existing = await prisma.emailSequence.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Delete sequence (cascades to steps and enrollments)
    await prisma.emailSequence.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email sequence delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}
