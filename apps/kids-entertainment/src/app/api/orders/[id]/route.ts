/**
 * Order Detail API Routes
 * GET /api/orders/[id] - Get order by ID
 * PUT /api/orders/[id] - Update order
 * DELETE /api/orders/[id] - Delete order
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow public access for payment page - customers need to see their order
    // But only return limited data for non-authenticated requests
    const session = await getServerSession(authOptions)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        linkedParty: {
          include: {
            package: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // For non-authenticated requests, return limited data (for payment page)
    if (!session) {
      return NextResponse.json({
        id: order.id,
        orderNumber: order.orderNumber,
        partyName: order.partyName,
        status: order.status,
        venue: order.venue,
        guestCount: order.guestCount,
        dates: order.dates,
        pricing: order.pricing,
        customer: order.customer ? {
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
        } : null,
        linkedParty: order.linkedParty ? {
          date: order.linkedParty.date,
          childName: order.linkedParty.childName,
          childAge: order.linkedParty.childAge,
          package: order.linkedParty.package,
        } : null,
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: body.status,
        specialRequests: body.notes || body.specialRequests,
        pricing: body.subtotal || body.tax || body.total ? {
          subtotal: body.subtotal,
          tax: body.tax,
          total: body.total,
        } : undefined,
      },
      include: {
        customer: true,
        items: true,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
