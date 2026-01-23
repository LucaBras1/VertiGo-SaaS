// API Route: /api/admin/invoices/[id]
// Single invoice operations using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/invoices/[id]
 * Get single invoice by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            eventName: true,
            venue: true,
            dates: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoice',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/invoices/[id]
 * Update invoice
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Remove fields that shouldn't be directly updated
    const { id: _id, createdAt, updatedAt, invoiceNumber, customer, order, ...updateData } = body

    // Recalculate totals if items changed
    if (updateData.items) {
      const items = updateData.items
      const subtotal = items.reduce((sum: number, item: any) => {
        const total = (item.quantity || 1) * (item.unitPrice || 0)
        return sum + total
      }, 0)

      // Get current VAT rate if not provided
      let vatRate = updateData.vatRate
      if (vatRate === undefined) {
        const existingInvoice = await prisma.invoice.findUnique({
          where: { id },
          select: { vatRate: true },
        })
        vatRate = existingInvoice?.vatRate || 0
      }

      const vatAmount = (subtotal * (vatRate || 0)) / 100
      const totalAmount = subtotal + vatAmount

      updateData.subtotal = Math.round(subtotal)
      updateData.vatAmount = Math.round(vatAmount)
      updateData.totalAmount = Math.round(totalAmount)

      // Update totalPrice in each item
      updateData.items = items.map((item: any) => ({
        ...item,
        totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
      }))
    }

    // Convert date strings to Date objects
    if (updateData.issueDate && typeof updateData.issueDate === 'string') {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
      updateData.dueDate = new Date(updateData.dueDate)
    }
    if (updateData.paidDate && typeof updateData.paidDate === 'string') {
      updateData.paidDate = new Date(updateData.paidDate)
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            eventName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update invoice',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/invoices/[id]
 * Delete invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted',
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete invoice',
      },
      { status: 500 }
    )
  }
}
