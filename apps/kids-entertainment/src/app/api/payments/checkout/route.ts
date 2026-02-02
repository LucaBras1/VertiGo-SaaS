/**
 * Payment Checkout API Routes
 * POST /api/payments/checkout - Create checkout session
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBookingDepositCheckout, createBookingFullPaymentCheckout } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // For customer-facing payments, we don't require admin session
    // but we do require the order to exist

    const body = await request.json()
    const { orderId, paymentType } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      )
    }

    // Get order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        linkedParty: {
          include: {
            package: true,
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

    if (!order.customer) {
      return NextResponse.json(
        { error: 'Customer not found for this order' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'
    const packageName = order.linkedParty?.package?.title || 'Dětská oslava'
    const partyDate = order.linkedParty?.date
      ? new Date(order.linkedParty.date).toLocaleDateString('cs-CZ')
      : 'TBD'

    // Get total from pricing JSON
    const pricing = order.pricing as { total?: number } | null
    const orderTotal = pricing?.total || 0

    // Check if this is deposit or full payment
    if (paymentType === 'deposit' || !paymentType) {
      // Calculate deposit (e.g., 30% of total)
      const depositPercent = 30
      const depositAmount = Math.round((orderTotal * depositPercent) / 100)

      const session = await createBookingDepositCheckout({
        orderId: order.id,
        orderNumber: order.orderNumber,
        partyDate,
        depositAmount,
        totalAmount: orderTotal,
        customerId: order.customer.id,
        customerEmail: order.customer.email,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        packageName,
        successUrl: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/booking/cancel?order_id=${order.id}`,
      })

      return NextResponse.json({
        sessionId: session.sessionId,
        url: session.url,
      })
    } else if (paymentType === 'full') {
      // Get already paid deposit from pricing
      const pricingData = order.pricing as { deposit?: number } | null
      const paidDeposit = pricingData?.deposit || 0

      const session = await createBookingFullPaymentCheckout({
        orderId: order.id,
        orderNumber: order.orderNumber,
        partyDate,
        totalAmount: orderTotal,
        paidDeposit,
        customerId: order.customer.id,
        customerEmail: order.customer.email,
        packageName,
        successUrl: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/booking/cancel?order_id=${order.id}`,
      })

      return NextResponse.json({
        sessionId: session.sessionId,
        url: session.url,
      })
    }

    return NextResponse.json(
      { error: 'Invalid payment type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
