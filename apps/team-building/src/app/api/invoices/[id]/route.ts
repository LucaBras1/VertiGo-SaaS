/**
 * Invoice Detail API Route
 * GET, PUT, DELETE for single invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const invoiceUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().default(1),
    unitPrice: z.number(),
    totalPrice: z.number(),
  })).optional(),
  subtotal: z.number().optional(),
  vatRate: z.number().optional(),
  vatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  paidAmount: z.number().optional(),
  paymentMethod: z.string().optional(),
  bankAccount: z.string().optional(),
  variableSymbol: z.string().optional(),
  textBeforeItems: z.string().optional(),
  textAfterItems: z.string().optional(),
  notes: z.string().optional(),
})

// GET - Get single invoice
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
          include: {
            items: {
              include: {
                program: { select: { id: true, title: true } },
                activity: { select: { id: true, title: true } },
                extra: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
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
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = invoiceUpdateSchema.parse(body)

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Track payment changes for customer stats
    const wasNotPaid = existingInvoice.status !== 'paid'
    const isNowPaid = validatedData.status === 'paid'
    const paymentAmountDiff = (validatedData.paidAmount || 0) - existingInvoice.paidAmount

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) :
                  (isNowPaid && wasNotPaid ? new Date() : undefined),
      },
      include: {
        customer: true,
        order: true,
      },
    })

    // Update customer payment stats if payment changed
    if (paymentAmountDiff !== 0) {
      await prisma.customer.update({
        where: { id: existingInvoice.customerId },
        data: {
          totalPaid: { increment: paymentAmountDiff },
          lastPaymentDate: paymentAmountDiff > 0 ? new Date() : undefined,
        },
      })
    }

    // Update overdue count if status changed
    if (wasNotPaid && isNowPaid) {
      // Check if this was overdue
      if (existingInvoice.dueDate < new Date()) {
        await prisma.customer.update({
          where: { id: existingInvoice.customerId },
          data: {
            overdueCount: { decrement: 1 },
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id },
    })

    // Update customer stats
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: {
        totalInvoiced: { decrement: invoice.totalAmount },
        invoiceCount: { decrement: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
