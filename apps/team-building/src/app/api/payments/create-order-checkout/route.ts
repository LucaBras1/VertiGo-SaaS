import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createOrderCheckoutSession } from '@/lib/stripe'

// Force dynamic - prevent prerendering during build
export const dynamic = 'force-dynamic'

// POST /api/payments/create-order-checkout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Fetch the order with customer details and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            program: true,
            activity: true,
            extra: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order has a payment status (could be stored in pricing JSON)
    const pricing = (order.pricing as { paymentStatus?: string } | null)
    if (pricing?.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Order is already paid' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009'
    const successUrl = `${baseUrl}/admin/orders/${orderId}?payment=success`
    const cancelUrl = `${baseUrl}/admin/orders/${orderId}?payment=cancelled`

    // Prepare line items from order items
    const items = order.items.map((item) => {
      const name = item.program?.title
        || item.activity?.title
        || item.extra?.title
        || 'Team Building Service'

      return {
        name,
        description: item.notes || undefined,
        quantity: 1,
        price: item.price || 0,
      }
    })

    // Calculate total from items or use pricing.total if available
    const total = items.reduce((sum, item) => sum + item.price, 0)

    const checkoutSession = await createOrderCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total,
      customerId: order.customerId || '',
      customerEmail: order.customer?.email || undefined,
      items,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
    })
  } catch (error) {
    console.error('Error creating order checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
