import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSequenceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  triggerType: z.enum([
    'client_created',
    'package_purchased',
    'session_completed',
    'days_inactive',
    'membership_expiring',
    'manual',
  ]),
  triggerConfig: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const triggerType = searchParams.get('triggerType')
    const isActive = searchParams.get('isActive')

    const sequences = await prisma.emailSequence.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(triggerType && { triggerType }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get enrollment stats for each sequence
    const sequencesWithStats = await Promise.all(
      sequences.map(async (sequence) => {
        const stats = await prisma.emailSequenceEnrollment.groupBy({
          by: ['status'],
          where: { sequenceId: sequence.id },
          _count: true,
        })

        return {
          ...sequence,
          stats: {
            active: stats.find((s) => s.status === 'active')?._count || 0,
            completed: stats.find((s) => s.status === 'completed')?._count || 0,
            paused: stats.find((s) => s.status === 'paused')?._count || 0,
            unsubscribed: stats.find((s) => s.status === 'unsubscribed')?._count || 0,
          },
        }
      })
    )

    return NextResponse.json(sequencesWithStats)
  } catch (error) {
    console.error('Email sequences fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = createSequenceSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Prepare data with proper JSON handling
    const createData = {
      tenantId: session.user.tenantId,
      name: result.data.name,
      description: result.data.description,
      triggerType: result.data.triggerType,
      triggerConfig: result.data.triggerConfig as object | undefined,
      isActive: result.data.isActive,
    }

    const sequence = await prisma.emailSequence.create({
      data: createData,
      include: {
        steps: true,
      },
    })

    return NextResponse.json(sequence, { status: 201 })
  } catch (error) {
    console.error('Email sequence create error:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}
