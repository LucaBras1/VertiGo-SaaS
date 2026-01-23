/**
 * Invoice Vyfakturuj API Routes
 *
 * POST /api/admin/invoices/[id]/vyfakturuj/sync - Sync invoice status from Vyfakturuj
 * POST /api/admin/invoices/[id]/vyfakturuj/send-email - Send invoice via email
 * POST /api/admin/invoices/[id]/vyfakturuj/mark-paid - Mark invoice as paid
 * POST /api/admin/invoices/[id]/vyfakturuj/credit-note - Create credit note
 * GET /api/admin/invoices/[id]/vyfakturuj/pdf - Get PDF URL
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  syncInvoiceStatus,
  sendInvoiceEmail,
  markInvoicePaid,
  createCreditNote,
  getInvoicePdfUrl,
} from '@/lib/vyfakturuj/invoice-sync'

// GET - Get PDF URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = request.nextUrl
    const action = url.searchParams.get('action')

    if (action === 'pdf') {
      const pdfUrl = await getInvoicePdfUrl(id)
      if (pdfUrl) {
        return NextResponse.json({ pdfUrl })
      } else {
        return NextResponse.json(
          { error: 'PDF URL not available' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in invoice vyfakturuj GET:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    )
  }
}

// POST - Various actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const action = body.action as string

    let result

    switch (action) {
      case 'sync':
        result = await syncInvoiceStatus(id)
        break

      case 'send-email':
        if (!body.recipients || !Array.isArray(body.recipients)) {
          return NextResponse.json(
            { error: 'Recipients array is required' },
            { status: 400 }
          )
        }
        result = await sendInvoiceEmail(id, body.recipients)
        break

      case 'mark-paid':
        const paidDate = body.paidDate ? new Date(body.paidDate) : new Date()
        const amount = body.amount ? parseFloat(body.amount) : undefined
        result = await markInvoicePaid(id, paidDate, amount)
        break

      case 'credit-note':
        result = await createCreditNote(id, body.items)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: sync, send-email, mark-paid, credit-note' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          invoiceId: result.invoiceId,
          vyfakturujId: result.vyfakturujId,
          vyfakturujNumber: result.vyfakturujNumber,
          pdfUrl: result.pdfUrl,
          publicUrl: result.publicUrl,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in invoice vyfakturuj POST:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      },
      { status: 500 }
    )
  }
}
