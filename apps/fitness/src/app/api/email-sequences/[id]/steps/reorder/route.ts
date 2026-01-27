import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  stepIds: z.array(z.string()).min(1),
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
    const result = reorderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { stepIds } = result.data

    // Verify sequence belongs to tenant
    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id: sequenceId,
        tenantId: session.user.tenantId,
      },
      include: {
        steps: true,
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Verify all step IDs belong to this sequence
    const sequenceStepIds = sequence.steps.map(s => s.id)
    const allStepsValid = stepIds.every(id => sequenceStepIds.includes(id))

    if (!allStepsValid || stepIds.length !== sequence.steps.length) {
      return NextResponse.json(
        { error: 'Invalid step IDs' },
        { status: 400 }
      )
    }

    // Update step orders in transaction
    await prisma.$transaction(
      stepIds.map((stepId, index) =>
        prisma.emailSequenceStep.update({
          where: { id: stepId },
          data: { stepOrder: index + 1 },
        })
      )
    )

    // Fetch updated sequence with steps
    const updatedSequence = await prisma.emailSequence.findUnique({
      where: { id: sequenceId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedSequence)
  } catch (error) {
    console.error('Reorder email sequence steps error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder steps' },
      { status: 500 }
    )
  }
}
