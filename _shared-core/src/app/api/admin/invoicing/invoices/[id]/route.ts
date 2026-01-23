/**
 * Single Invoice API Routes
 *
 * GET /api/admin/invoicing/invoices/[id] - Get invoice
 * PUT /api/admin/invoicing/invoices/[id] - Update invoice
 * DELETE /api/admin/invoicing/invoices/[id] - Delete invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  markInvoiceAsSent,
  cancelInvoice,
  duplicateInvoice,
} from '@/lib/invoicing/invoice-service'
import { UpdateInvoiceData } from '@/types/invoicing'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const invoice = await getInvoice(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Failed to get invoice:', error)
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json() as UpdateInvoiceData

    const invoice = await updateInvoice(id, data)

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Failed to update invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await deleteInvoice(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { action, ...data } = await request.json()

    switch (action) {
      case 'mark_paid':
        await markInvoiceAsPaid(id, data.paidDate ? new Date(data.paidDate) : undefined, data.paidAmount)
        break

      case 'mark_sent':
        await markInvoiceAsSent(id)
        break

      case 'cancel':
        await cancelInvoice(id, data.reason)
        break

      case 'duplicate':
        const duplicated = await duplicateInvoice(id)
        return NextResponse.json(duplicated)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const invoice = await getInvoice(id)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Failed to perform action on invoice:', error)
    return NextResponse.json(
      { error: 'Failed to perform action', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
