/**
 * Invoice Export API
 *
 * Export invoices to CSV or Excel format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DOCUMENT_TYPE_LABELS, INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/types/invoicing'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    const status = url.searchParams.get('status')
    const documentType = url.searchParams.get('documentType')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const search = url.searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (documentType && documentType !== 'ALL') {
      where.documentType = documentType
    }

    if (dateFrom || dateTo) {
      where.issueDate = {}
      if (dateFrom) where.issueDate.gte = new Date(dateFrom)
      if (dateTo) where.issueDate.lte = new Date(dateTo + 'T23:59:59')
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
      ]
    }

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            ico: true,
            dic: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    })

    // Generate CSV
    if (format === 'csv') {
      const headers = [
        'Číslo faktury',
        'Typ dokladu',
        'Stav',
        'Zákazník',
        'IČO',
        'DIČ',
        'Email',
        'Datum vystavení',
        'Datum splatnosti',
        'Základ',
        'DPH',
        'Celkem',
        'Měna',
        'Uhrazeno',
        'Způsob platby',
        'VS',
      ]

      const rows = invoices.map((invoice) => [
        invoice.invoiceNumber,
        DOCUMENT_TYPE_LABELS[invoice.documentType as keyof typeof DOCUMENT_TYPE_LABELS] || invoice.documentType,
        INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] || invoice.status,
        invoice.customer?.name || '',
        invoice.customer?.ico || '',
        invoice.customer?.dic || '',
        invoice.customer?.email || '',
        new Date(invoice.issueDate).toLocaleDateString('cs-CZ'),
        new Date(invoice.dueDate).toLocaleDateString('cs-CZ'),
        invoice.totalWithoutVat.toFixed(2),
        invoice.vatAmount.toFixed(2),
        invoice.totalAmount.toFixed(2),
        invoice.currency,
        (invoice.paidAmount || 0).toFixed(2),
        PAYMENT_METHOD_LABELS[invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || invoice.paymentMethod || '',
        invoice.variableSymbol || '',
      ])

      // Build CSV content
      const csvContent = [
        headers.join(';'),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
        ),
      ].join('\n')

      // Add BOM for Excel compatibility with Czech characters
      const bom = '\uFEFF'

      return new NextResponse(bom + csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="faktury-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // For Excel format, we'll return JSON that can be processed client-side
    // (Full Excel generation would require additional dependencies)
    if (format === 'xlsx') {
      const data = invoices.map((invoice) => ({
        'Číslo faktury': invoice.invoiceNumber,
        'Typ dokladu': DOCUMENT_TYPE_LABELS[invoice.documentType as keyof typeof DOCUMENT_TYPE_LABELS] || invoice.documentType,
        Stav: INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS] || invoice.status,
        Zákazník: invoice.customer?.name || '',
        IČO: invoice.customer?.ico || '',
        DIČ: invoice.customer?.dic || '',
        Email: invoice.customer?.email || '',
        'Datum vystavení': new Date(invoice.issueDate).toLocaleDateString('cs-CZ'),
        'Datum splatnosti': new Date(invoice.dueDate).toLocaleDateString('cs-CZ'),
        Základ: invoice.totalWithoutVat,
        DPH: invoice.vatAmount,
        Celkem: invoice.totalAmount,
        Měna: invoice.currency,
        Uhrazeno: invoice.paidAmount || 0,
        'Způsob platby': PAYMENT_METHOD_LABELS[invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || invoice.paymentMethod || '',
        VS: invoice.variableSymbol || '',
      }))

      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting invoices:', error)
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    )
  }
}
