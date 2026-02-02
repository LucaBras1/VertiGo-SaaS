/**
 * Invoice Email Resend API
 * POST /api/invoices/[id]/send-email - Regenerate PDF and resend invoice email
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/services/invoices'
import { sendPaymentReceiptEmail } from '@/lib/email'
import { formatAmountForDisplay } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get invoice with customer and order details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          include: {
            linkedParty: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.customer) {
      return NextResponse.json({ error: 'Invoice has no customer' }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(id)

    // Determine payment type from invoice notes
    const paymentType: 'deposit' | 'full_payment' = invoice.notes?.toLowerCase().includes('zaloha')
      ? 'deposit'
      : 'full_payment'

    // Format amount
    const amount = formatAmountForDisplay(invoice.totalAmount, invoice.currency)

    // Format party date if available
    let partyDate: string | undefined
    if (invoice.order?.linkedParty?.date) {
      partyDate = invoice.order.linkedParty.date.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }

    // Send email
    const result = await sendPaymentReceiptEmail({
      to: invoice.customer.email,
      parentName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      invoiceNumber: invoice.invoiceNumber,
      amount,
      paymentType,
      partyDate,
      pdfBuffer,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id },
      data: {
        invoiceStatus: 'SENT',
        status: 'sent',
      },
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: invoice.customer.email,
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
