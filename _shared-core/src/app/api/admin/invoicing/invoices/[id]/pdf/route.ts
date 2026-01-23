/**
 * Invoice PDF Generation Route
 *
 * GET /api/admin/invoicing/invoices/[id]/pdf - Generate and download PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvoice } from '@/lib/invoicing/invoice-service'
import { generateInvoicePDF, getSupplierFromSettings } from '@/lib/invoicing/pdf-generator'
import { prisma } from '@/lib/prisma'

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

    // Get supplier info
    const supplier = await getSupplierFromSettings()

    // Get template settings if using a template
    let templateSettings = undefined
    if (invoice.templateId) {
      const template = await prisma.invoiceTemplate.findUnique({
        where: { id: invoice.templateId },
      })
      if (template) {
        templateSettings = {
          showLogo: template.showLogo,
          showQrCode: template.showQrCode,
          showBankDetails: template.showBankDetails,
          showItemNumbers: template.showItemNumbers,
          showVatBreakdown: template.showVatBreakdown,
          logoUrl: template.logoUrl || undefined,
          primaryColor: template.primaryColor || undefined,
          headerText: template.headerText || undefined,
          footerText: template.footerText || undefined,
        }
      }
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice, supplier, templateSettings)

    // Return PDF with appropriate headers
    const response = new NextResponse(pdfBuffer)
    response.headers.set('Content-Type', 'application/pdf')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber}.pdf"`
    )

    return response
  } catch (error) {
    console.error('Failed to generate invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
