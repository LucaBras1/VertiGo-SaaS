// API Route: /api/admin/orders/bulk
// Bulk operations for orders

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/orders/bulk
 * Delete multiple orders by IDs
 *
 * Request body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: ids array is required',
        },
        { status: 400 }
      )
    }

    // Delete all orders with provided IDs using Prisma
    const deleteResults = await Promise.allSettled(
      ids.map((id) => prisma.order.delete({ where: { id } }))
    )

    // Count successes and failures
    const succeeded = deleteResults.filter((r) => r.status === 'fulfilled').length
    const failed = deleteResults.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Deleted ${succeeded} order(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      data: {
        succeeded,
        failed,
        total: ids.length,
      },
    })
  } catch (error) {
    console.error('Error deleting orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete orders',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/orders/bulk
 * Update multiple orders with the same data
 *
 * Request body: { ids: string[], data: Partial<Order> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: ids array is required',
        },
        { status: 400 }
      )
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: data object is required',
        },
        { status: 400 }
      )
    }

    // Update all orders with provided IDs using Prisma
    const updateResults = await Promise.allSettled(
      ids.map((id) => prisma.order.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        }
      }))
    )

    // Count successes and failures
    const succeeded = updateResults.filter((r) => r.status === 'fulfilled').length
    const failed = updateResults.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Updated ${succeeded} order(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      data: {
        succeeded,
        failed,
        total: ids.length,
      },
    })
  } catch (error) {
    console.error('Error updating orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update orders',
      },
      { status: 500 }
    )
  }
}
