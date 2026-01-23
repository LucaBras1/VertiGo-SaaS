// API Route: /api/admin/orders/[id]
// Get, update, delete single order

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/orders/[id]
 * Get single order by ID
 * Query params: populate (true/false) - include related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const populate = searchParams.get('populate') === 'true'

    const order = await prisma.order.findUnique({
      where: { id },
      include: populate
        ? {
            customer: true,
            items: {
              include: {
                performance: true,
                game: true,
                service: true,
              },
            },
            linkedEvent: true,
          }
        : { customer: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Transform to match frontend expectations
    const transformedOrder = {
      ...order,
      _id: order.id,
      items: (order as any).items?.map((item: any) => ({
        ...item,
        _id: item.id,
      })),
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order including items
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Remove fields that shouldn't be directly updated
    const { _id, id: bodyId, items, customer, linkedEvent, ...updateData } = body

    // Convert paymentDueDate string to Date if provided
    if (updateData.paymentDueDate) {
      updateData.paymentDueDate = new Date(updateData.paymentDueDate)
    }

    // Use transaction to update order and items atomically
    const order = await prisma.$transaction(async (tx) => {
      // Update order data
      await tx.order.update({
        where: { id },
        data: updateData,
      })

      // If items are provided, replace all existing items
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        })

        // Create new items
        if (items.length > 0) {
          await tx.orderItem.createMany({
            data: items.map((item: any) => ({
              orderId: id,
              performanceId: item.performanceId || null,
              gameId: item.gameId || null,
              serviceId: item.serviceId || null,
              date: item.date,
              startTime: item.startTime || null,
              endTime: item.endTime || null,
              price: item.price || 0,
              notes: item.notes || null,
            })),
          })
        }
      }

      // Return updated order with all relations
      return tx.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              performance: true,
              game: true,
              service: true,
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order!.id,
      },
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Delete order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete order',
      },
      { status: 500 }
    )
  }
}
