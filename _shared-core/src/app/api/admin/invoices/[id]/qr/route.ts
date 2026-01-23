/**
 * Invoice QR Code API
 *
 * GET /api/admin/invoices/[id]/qr
 * Generuje QR kód pro platbu faktury ve formátu SPAYD.
 *
 * Query params:
 * - format: 'dataurl' (default) | 'svg' | 'png'
 * - width: number (default: 200)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateQRCodeDataUrl,
  generateQRCodeSvg,
  generateQRCodeBuffer,
  createPaymentDataFromInvoice,
} from '@/lib/qr-payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'dataurl'
    const width = parseInt(searchParams.get('width') || '200', 10)

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        vyfakturujVS: true,
        dueDate: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get settings for bank account
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
      select: {
        supplierIban: true,
        supplierBankAccount: true,
        supplierName: true,
      },
    })

    if (!settings?.supplierIban && !settings?.supplierBankAccount) {
      return NextResponse.json(
        { error: 'Bank account not configured. Please configure in Vyfakturuj settings.' },
        { status: 400 }
      )
    }

    // Create payment data
    const paymentData = createPaymentDataFromInvoice(invoice, settings)

    if (!paymentData) {
      return NextResponse.json(
        { error: 'Could not generate payment data' },
        { status: 400 }
      )
    }

    const qrOptions = { width }

    // Generate QR code based on format
    switch (format) {
      case 'svg': {
        const svg = await generateQRCodeSvg(paymentData, qrOptions)
        return new NextResponse(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      case 'png': {
        const buffer = await generateQRCodeBuffer(paymentData, qrOptions)
        // Convert Buffer to Uint8Array for NextResponse compatibility
        const uint8Array = new Uint8Array(buffer)
        return new NextResponse(uint8Array, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `inline; filename="qr-${invoice.invoiceNumber || invoice.id}.png"`,
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      case 'dataurl':
      default: {
        const dataUrl = await generateQRCodeDataUrl(paymentData, qrOptions)
        return NextResponse.json({
          success: true,
          qrCode: dataUrl,
          paymentData: {
            accountNumber: paymentData.accountNumber,
            amount: paymentData.amount,
            variableSymbol: paymentData.variableSymbol,
            message: paymentData.message,
          },
        })
      }
    }
  } catch (error) {
    console.error('[QR Code] Error generating QR code:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate QR code',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
