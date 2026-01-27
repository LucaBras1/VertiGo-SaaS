import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStepSchema = z.object({
  stepOrder: z.number().int().min(0).optional(),
  delayDays: z.number().int().min(0).default(0),
  delayHours: z.number().int().min(0).max(23).default(0),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  conditions: z.record(z.unknown()).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId } = await params
    const body = await request.json()

    const result = createStepSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Verify sequence belongs to tenant
    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id: sequenceId,
        tenantId: session.user.tenantId,
      },
      include: {
        steps: {
          orderBy: { stepOrder: 'desc' },
          take: 1,
        },
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Determine step order
    const stepOrder = result.data.stepOrder ?? (sequence.steps[0]?.stepOrder ?? -1) + 1

    const step = await prisma.emailSequenceStep.create({
      data: {
        sequenceId,
        stepOrder,
        delayDays: result.data.delayDays,
        delayHours: result.data.delayHours,
        subject: result.data.subject,
        htmlContent: result.data.htmlContent,
        textContent: result.data.textContent,
        conditions: result.data.conditions,
      },
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Email sequence step create error:', error)
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}
