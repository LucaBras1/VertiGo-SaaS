/**
 * Email Sequence Step Detail API
 * PATCH /api/email-sequences/[id]/steps/[stepId] - Update step
 * DELETE /api/email-sequences/[id]/steps/[stepId] - Delete step
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stepId } = await context.params
    const body = await request.json()
    const { stepOrder, delayDays, delayHours, subject, htmlContent, textContent } = body

    const step = await prisma.emailSequenceStep.update({
      where: { id: stepId },
      data: {
        ...(stepOrder !== undefined && { stepOrder }),
        ...(delayDays !== undefined && { delayDays }),
        ...(delayHours !== undefined && { delayHours }),
        ...(subject !== undefined && { subject }),
        ...(htmlContent !== undefined && { htmlContent }),
        ...(textContent !== undefined && { textContent }),
      },
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error updating sequence step:', error)
    return NextResponse.json({ error: 'Failed to update step' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId, stepId } = await context.params

    // Delete the step
    await prisma.emailSequenceStep.delete({
      where: { id: stepId },
    })

    // Reorder remaining steps
    const remainingSteps = await prisma.emailSequenceStep.findMany({
      where: { sequenceId },
      orderBy: { stepOrder: 'asc' },
    })

    for (let i = 0; i < remainingSteps.length; i++) {
      if (remainingSteps[i].stepOrder !== i) {
        await prisma.emailSequenceStep.update({
          where: { id: remainingSteps[i].id },
          data: { stepOrder: i },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sequence step:', error)
    return NextResponse.json({ error: 'Failed to delete step' }, { status: 500 })
  }
}
