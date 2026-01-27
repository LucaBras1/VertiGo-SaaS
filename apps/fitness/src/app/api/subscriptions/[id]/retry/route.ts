import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retryPayment } from '@/lib/subscriptions/subscription-processor'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    if (!['active', 'past_due'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Cannot retry payment for this subscription status' },
        { status: 400 }
      )
    }

    const result = await retryPayment(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment retry failed' },
        { status: 400 }
      )
    }

    // Fetch updated subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { client: true, package: true },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    )
  }
}
