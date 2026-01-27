import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStepSchema = z.object({
  stepOrder: z.number().int().min(1).optional(),
  delayDays: z.number().int().min(0).optional(),
  delayHours: z.number().int().min(0).max(23).optional(),
  subject: z.string().min(1).max(200).optional(),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),
  conditions: z.record(z.unknown()).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId, stepId } = await params

    // Verify sequence belongs to tenant
    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id: sequenceId,
        tenantId: session.user.tenantId,
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const step = await prisma.emailSequenceStep.findFirst({
      where: {
        id: stepId,
        sequenceId,
      },
    })

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error('Get email sequence step error:', error)
    return NextResponse.json(
      { error: 'Failed to get step' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId, stepId } = await params
    const body = await request.json()
    const result = updateStepSchema.safeParse(body)

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
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Verify step exists
    const existingStep = await prisma.emailSequenceStep.findFirst({
      where: {
        id: stepId,
        sequenceId,
      },
    })

    if (!existingStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Prepare data with proper JSON handling
    const updateData = {
      ...result.data,
      conditions: result.data.conditions !== undefined
        ? (result.data.conditions as object)
        : undefined,
    }

    const step = await prisma.emailSequenceStep.update({
      where: { id: stepId },
      data: updateData,
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Update email sequence step error:', error)
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId, stepId } = await params

    // Verify sequence belongs to tenant
    const sequence = await prisma.emailSequence.findFirst({
      where: {
        id: sequenceId,
        tenantId: session.user.tenantId,
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Get step to be deleted
    const stepToDelete = await prisma.emailSequenceStep.findFirst({
      where: {
        id: stepId,
        sequenceId,
      },
    })

    if (!stepToDelete) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Delete step and reorder remaining steps
    await prisma.$transaction(async (tx) => {
      await tx.emailSequenceStep.delete({
        where: { id: stepId },
      })

      // Reorder remaining steps
      await tx.emailSequenceStep.updateMany({
        where: {
          sequenceId,
          stepOrder: { gt: stepToDelete.stepOrder },
        },
        data: {
          stepOrder: { decrement: 1 },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete email sequence step error:', error)
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    )
  }
}
