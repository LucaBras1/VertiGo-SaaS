// API Route: /api/admin/invoices/bulk
// Bulk operations for invoices using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/invoices/bulk
 * Bulk delete invoices
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

    // Use deleteMany for efficient bulk deletion
    const result = await prisma.invoice.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Smazáno ${result.count} faktur`,
      data: { succeeded: result.count, failed: ids.length - result.count, total: ids.length },
    })
  } catch (error) {
    console.error('Error bulk deleting invoices:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete invoices' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/invoices/bulk
 * Bulk update invoices
 */
export async function PATCH(request: NextRequest) {
  try {
    const { ids, data } = await request.json()
    if (!ids || !Array.isArray(ids) || !data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: ids array and data are required' },
        { status: 400 }
      )
    }

    // Remove fields that shouldn't be directly updated
    const { id: _id, createdAt, updatedAt, invoiceNumber, customer, order, ...updateData } = data

    // Convert date strings to Date objects if present
    if (updateData.issueDate && typeof updateData.issueDate === 'string') {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
      updateData.dueDate = new Date(updateData.dueDate)
    }
    if (updateData.paidDate && typeof updateData.paidDate === 'string') {
      updateData.paidDate = new Date(updateData.paidDate)
    }

    // Use updateMany for efficient bulk update
    const result = await prisma.invoice.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `Aktualizováno ${result.count} faktur`,
      data: { succeeded: result.count, failed: ids.length - result.count, total: ids.length },
    })
  } catch (error) {
    console.error('Error bulk updating invoices:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update invoices' },
      { status: 500 }
    )
  }
}
