import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSubscription, getSubscriptionStats } from '@/lib/subscriptions/subscription-processor'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  clientId: z.string().min(1),
  packageId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('CZK'),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  billingDay: z.number().min(1).max(31).optional(),
  autoRenew: z.boolean().default(true),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const includeStats = searchParams.get('includeStats') === 'true'

    const subscriptions = await prisma.subscription.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            credits: true,
          },
        },
        _count: {
          select: {
            generatedInvoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let stats = null
    if (includeStats) {
      stats = await getSubscriptionStats(session.user.tenantId)
    }

    return NextResponse.json({
      subscriptions,
      stats,
    })
  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = createSubscriptionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Verify package if provided
    if (data.packageId) {
      const pkg = await prisma.package.findFirst({
        where: {
          id: data.packageId,
          tenantId: session.user.tenantId,
        },
      })

      if (!pkg) {
        return NextResponse.json(
          { error: 'Package not found' },
          { status: 404 }
        )
      }
    }

    const subscription = await createSubscription({
      tenantId: session.user.tenantId,
      clientId: data.clientId,
      packageId: data.packageId,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      billingDay: data.billingDay,
      autoRenew: data.autoRenew,
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Subscription create error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
