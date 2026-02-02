/**
 * Email Sequence Detail API
 * GET /api/email-sequences/[id] - Get sequence details
 * PATCH /api/email-sequences/[id] - Update sequence
 * DELETE /api/email-sequences/[id] - Delete sequence
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSequenceStats } from '@/lib/email-sequences'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const sequence = await prisma.emailSequence.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        enrollments: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                organization: true,
              },
            },
            emails: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    const stats = await getSequenceStats(id)

    return NextResponse.json({ ...sequence, stats })
  } catch (error) {
    console.error('Error fetching email sequence:', error)
    return NextResponse.json({ error: 'Failed to fetch email sequence' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, description, triggerType, triggerConfig, isActive } = body

    const sequence = await prisma.emailSequence.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(triggerType !== undefined && { triggerType }),
        ...(triggerConfig !== undefined && { triggerConfig }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(sequence)
  } catch (error) {
    console.error('Error updating email sequence:', error)
    return NextResponse.json({ error: 'Failed to update email sequence' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.emailSequence.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email sequence:', error)
    return NextResponse.json({ error: 'Failed to delete email sequence' }, { status: 500 })
  }
}
