/**
 * Email Sequences API
 * GET /api/email-sequences - List all sequences
 * POST /api/email-sequences - Create a new sequence
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSequenceStats } from '@/lib/email-sequences'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sequences = await prisma.emailSequence.findMany({
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch stats for each sequence
    const sequencesWithStats = await Promise.all(
      sequences.map(async (seq) => {
        const stats = await getSequenceStats(seq.id)
        return {
          ...seq,
          stats,
        }
      })
    )

    return NextResponse.json(sequencesWithStats)
  } catch (error) {
    console.error('Error fetching email sequences:', error)
    return NextResponse.json({ error: 'Failed to fetch email sequences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, triggerType, triggerConfig, isActive, steps } = body

    if (!name || !triggerType) {
      return NextResponse.json({ error: 'Name and trigger type are required' }, { status: 400 })
    }

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        description,
        triggerType,
        triggerConfig: triggerConfig || null,
        isActive: isActive ?? false,
        steps: steps
          ? {
              create: steps.map((step: any, index: number) => ({
                stepOrder: step.stepOrder ?? index,
                delayDays: step.delayDays ?? 0,
                delayHours: step.delayHours ?? 0,
                subject: step.subject,
                htmlContent: step.htmlContent,
                textContent: step.textContent,
              })),
            }
          : undefined,
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(sequence, { status: 201 })
  } catch (error) {
    console.error('Error creating email sequence:', error)
    return NextResponse.json({ error: 'Failed to create email sequence' }, { status: 500 })
  }
}
