import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resumeSubscription } from '@/lib/subscriptions/subscription-processor'

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

    if (existing.status !== 'paused') {
      return NextResponse.json(
        { error: 'Only paused subscriptions can be resumed' },
        { status: 400 }
      )
    }

    const subscription = await resumeSubscription(id)

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Subscription resume error:', error)
    return NextResponse.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}
