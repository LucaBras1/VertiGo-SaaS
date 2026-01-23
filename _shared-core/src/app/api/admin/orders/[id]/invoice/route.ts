/**
 * Order Invoice API Routes
 *
 * POST /api/admin/orders/[id]/invoice - Create invoice from order in Vyfakturuj
 */

import { NextRequest, NextResponse } from 'next/server'
import { createInvoiceFromOrder } from '@/lib/vyfakturuj/invoice-sync'

// POST /api/admin/orders/[id]/invoice - Create invoice from order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const options = {
      type: body.type as 'invoice' | 'proforma' | 'advance' | undefined,
      sendEmail: body.sendEmail === true,
      emailRecipients: body.emailRecipients as string[] | undefined,
      notes: body.notes as string | undefined,
    }

    const result = await createInvoiceFromOrder(id, options)

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
          invoiceId: result.invoiceId,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating invoice from order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      },
      { status: 500 }
    )
  }
}
