/**
 * Email Sequence Steps API
 * GET /api/email-sequences/[id]/steps - List steps
 * POST /api/email-sequences/[id]/steps - Add a step
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId } = await context.params

    const steps = await prisma.emailSequenceStep.findMany({
      where: { sequenceId },
      orderBy: { stepOrder: 'asc' },
    })

    return NextResponse.json(steps)
  } catch (error) {
    console.error('Error fetching sequence steps:', error)
    return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 500 })
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sequenceId } = await context.params
    const body = await request.json()
    const { stepOrder, delayDays, delayHours, subject, htmlContent, textContent } = body

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: 'Subject and HTML content are required' }, { status: 400 })
    }

    // If stepOrder not provided, add to end
    let order = stepOrder
    if (order === undefined) {
      const lastStep = await prisma.emailSequenceStep.findFirst({
        where: { sequenceId },
        orderBy: { stepOrder: 'desc' },
      })
      order = lastStep ? lastStep.stepOrder + 1 : 0
    }

    const step = await prisma.emailSequenceStep.create({
      data: {
        sequenceId,
        stepOrder: order,
        delayDays: delayDays ?? 0,
        delayHours: delayHours ?? 0,
        subject,
        htmlContent,
        textContent,
      },
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating sequence step:', error)
    return NextResponse.json({ error: 'Failed to create step' }, { status: 500 })
  }
}
