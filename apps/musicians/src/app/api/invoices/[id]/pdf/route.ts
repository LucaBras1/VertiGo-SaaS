import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvoiceById } from '@/lib/services/invoices'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF, InvoiceData } from '@/lib/pdf/invoice-pdf'
import { prisma } from '@/lib/db'
import React from 'react'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: Date
  dueDate: Date
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  notes?: string | null
  items: any
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    company?: string | null
    address?: any
  }
  gig?: {
    id: string
    title: string
  } | null
}

interface Tenant {
  id: string
  name: string
  email: string
  phone?: string | null
  website?: string | null
  slug: string
  bandName?: string | null
  settings?: any
}

interface User {
  id: string
  tenantId: string
  tenant: Tenant
}

function formatAddress(addressJson: any): string | undefined {
  if (!addressJson) return undefined

  const parts = []
  if (addressJson.street) parts.push(addressJson.street)
  if (addressJson.city) {
    if (addressJson.zip) {
      parts.push(`${addressJson.zip} ${addressJson.city}`)
    } else {
      parts.push(addressJson.city)
    }
  }
  if (addressJson.country) parts.push(addressJson.country)

  return parts.length > 0 ? parts.join(', ') : undefined
}

function generateVariableSymbol(invoiceNumber: string): string {
  // Extract numbers from invoice number (e.g., "INV-2024-0001" -> "20240001")
  return invoiceNumber.replace(/\D/g, '')
}

function transformInvoiceForPDF(invoice: Invoice, user: User): InvoiceData {
  const tenant = user.tenant
  const settings = tenant.settings || {}

  // Format dates to ISO string for consistency
  const issueDate = invoice.issueDate.toISOString()
  const dueDate = invoice.dueDate.toISOString()

  // Parse invoice items
  let items = []
  try {
    items = typeof invoice.items === 'string'
      ? JSON.parse(invoice.items)
      : invoice.items || []
  } catch (error) {
    console.error('Error parsing invoice items:', error)
    items = []
  }

  // Build customer name
  const customerName = invoice.customer.company
    ? `${invoice.customer.company} (${invoice.customer.firstName} ${invoice.customer.lastName})`
    : `${invoice.customer.firstName} ${invoice.customer.lastName}`

  // Get customer address
  const customerAddress = formatAddress(invoice.customer.address)

  // Get tenant/company information from settings or defaults
  const tenantAddress = settings.companyAddress
    ? formatAddress(settings.companyAddress)
    : undefined

  const bankAccount = settings.bankAccount || undefined
  const iban = settings.iban || undefined
  const swift = settings.swift || undefined
  const ico = settings.ico || undefined
  const dic = settings.dic || undefined

  // Generate variable symbol from invoice number
  const variableSymbol = generateVariableSymbol(invoice.invoiceNumber)

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate,
    dueDate,
    customer: {
      name: customerName,
      address: customerAddress,
      email: invoice.customer.email,
      phone: invoice.customer.phone || undefined,
      ico: undefined, // Customer ICO/DIC can be added to Customer model if needed
      dic: undefined,
    },
    items: items.map((item: any) => ({
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: Math.round(item.unitPrice || 0),
      total: Math.round(item.total || 0),
    })),
    subtotal: Math.round(invoice.subtotal),
    taxRate: invoice.taxRate || 0,
    taxAmount: Math.round(invoice.taxAmount),
    total: Math.round(invoice.totalAmount),
    notes: invoice.notes || undefined,
    bankAccount,
    variableSymbol,
    tenant: {
      name: tenant.bandName || tenant.name,
      address: tenantAddress,
      ico,
      dic,
      email: tenant.email,
      phone: tenant.phone || undefined,
      website: tenant.website || undefined,
      bankAccount,
      iban,
      swift,
    },
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch invoice with customer details
    const invoice = await getInvoiceById(id, session.user.tenantId) as Invoice | null

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch tenant details with settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        slug: true,
        bandName: true,
        settings: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const user = {
      id: session.user.id,
      tenantId: session.user.tenantId,
      tenant,
    }

    // Transform invoice data to PDF format
    const pdfData = transformInvoiceForPDF(invoice, user)

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }) as any)

    // Create filename with invoice number
    const filename = `faktura-${invoice.invoiceNumber}.pdf`.replace(/\//g, '-')

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('GET /api/invoices/[id]/pdf error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
