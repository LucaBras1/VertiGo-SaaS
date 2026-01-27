import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cancelSubscription } from '@/lib/subscriptions/subscription-processor'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const updateSubscriptionSchema = z.object({
  amount: z.number().positive().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  billingDay: z.number().min(1).max(31).optional().nullable(),
  autoRenew: z.boolean().optional(),
  endDate: z.string().datetime().optional().nullable(),
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

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: true,
        package: true,
        generatedInvoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
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

    const result = updateSubscriptionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Verify subscription belongs to tenant
    const existing = await prisma.subscription.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const data = result.data
    const updateData: Record<string, unknown> = {}

    if (data.amount !== undefined) {
      updateData.amount = new Decimal(data.amount)
    }
    if (data.frequency !== undefined) {
      updateData.frequency = data.frequency
    }
    if (data.billingDay !== undefined) {
      updateData.billingDay = data.billingDay
    }
    if (data.autoRenew !== undefined) {
      updateData.autoRenew = data.autoRenew
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        package: true,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
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
    const { searchParams } = new URL(request.url)
    const immediate = searchParams.get('immediate') === 'true'

    // Verify subscription belongs to tenant
    const existing = await prisma.subscription.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscription = await cancelSubscription(id, { immediate })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription cancel error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
