// API Route: /api/admin/customers/bulk
// Bulk operations for customers using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/customers/bulk
 * Delete multiple customers by IDs
 */
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: ids array is required' },
        { status: 400 }
      )
    }

    // Delete associated data first, then customers
    const deleteResults = await Promise.allSettled(
      ids.map(async (id) => {
        // Delete communications
        await prisma.communication.deleteMany({
          where: { customerId: id },
        })
        // Delete invoices
        await prisma.invoice.deleteMany({
          where: { customerId: id },
        })
        // Delete customer
        return prisma.customer.delete({ where: { id } })
      })
    )

    const succeeded = deleteResults.filter((r) => r.status === 'fulfilled').length
    const failed = deleteResults.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Smazáno ${succeeded} zákazníků${failed > 0 ? `, ${failed} selhalo` : ''}`,
      data: { succeeded, failed, total: ids.length },
    })
  } catch (error) {
    console.error('Error deleting customers:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete customers' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/customers/bulk
 * Update multiple customers with the same data
 */
export async function PATCH(request: NextRequest) {
  try {
    const { ids, data } = await request.json()
    if (!ids || !Array.isArray(ids) || !data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: ids array and data object are required' },
        { status: 400 }
      )
    }

    const updateResults = await Promise.allSettled(
      ids.map((id) =>
        prisma.customer.update({
          where: { id },
          data: {
            ...(data.tags !== undefined && { tags: data.tags }),
            ...(data.organizationType !== undefined && { organizationType: data.organizationType }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
        })
      )
    )

    const succeeded = updateResults.filter((r) => r.status === 'fulfilled').length
    const failed = updateResults.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Aktualizováno ${succeeded} zákazníků${failed > 0 ? `, ${failed} selhalo` : ''}`,
      data: { succeeded, failed, total: ids.length },
    })
  } catch (error) {
    console.error('Error updating customers:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update customers' },
      { status: 500 }
    )
  }
}
