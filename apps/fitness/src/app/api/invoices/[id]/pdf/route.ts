import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF, InvoiceData } from '@/lib/pdf/invoice-pdf'
import React from 'react'

interface TenantSettings {
  companyAddress?: {
    street?: string
    city?: string
    zip?: string
    country?: string
  }
  bankAccount?: string
  iban?: string
  swift?: string
  ico?: string
  dic?: string
}

function formatAddress(addressJson: TenantSettings['companyAddress']): string | undefined {
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
  return invoiceNumber.replace(/\D/g, '')
}

function parseInvoiceItems(notes: string | null): InvoiceData['items'] {
  // Try to extract items from notes field
  // Format: "Položky: Item 1 (2x 500 Kč), Item 2 (1x 1000 Kč)"
  if (!notes) return []

  const itemsMatch = notes.match(/Položky:\s*(.+)$/m)
  if (!itemsMatch) return []

  const itemsStr = itemsMatch[1]
  const items: InvoiceData['items'] = []

  const itemRegex = /([^(]+)\s*\((\d+)x\s*([\d\s]+)\s*Kč\)/g
  let match

  while ((match = itemRegex.exec(itemsStr)) !== null) {
    const description = match[1].trim()
    const quantity = parseInt(match[2])
    const unitPrice = parseInt(match[3].replace(/\s/g, '')) * 100 // Convert to cents

    items.push({
      description,
      quantity,
      unitPrice,
      total: unitPrice * quantity,
    })
  }

  // If no items parsed, create a single item from the total
  if (items.length === 0) {
    return [{
      description: 'Služby',
      quantity: 1,
      unitPrice: 0, // Will be set from invoice subtotal
      total: 0,
    }]
  }

  return items
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

    // Fetch invoice with client details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch tenant details
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        slug: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Parse items from notes or create default
    let items = parseInvoiceItems(invoice.notes)

    // If items couldn't be parsed, create a default item from the subtotal
    if (items.length === 1 && items[0].unitPrice === 0) {
      items = [{
        description: 'Služby',
        quantity: 1,
        unitPrice: Math.round(invoice.subtotal * 100),
        total: Math.round(invoice.subtotal * 100),
      }]
    }

    // Get notes without the items description
    const cleanNotes = invoice.notes?.replace(/\n*Položky:.+$/m, '').trim() || undefined

    // Generate variable symbol from invoice number
    const variableSymbol = generateVariableSymbol(invoice.invoiceNumber)

    // Transform to PDF format
    const pdfData: InvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      customer: {
        name: invoice.client.name,
        email: invoice.client.email,
        phone: invoice.client.phone || undefined,
      },
      items,
      subtotal: Math.round(invoice.subtotal * 100),
      taxRate: invoice.tax > 0 ? 21 : 0, // Default 21% VAT if tax > 0
      taxAmount: Math.round(invoice.tax * 100),
      total: Math.round(invoice.total * 100),
      notes: cleanNotes,
      variableSymbol,
      tenant: {
        name: tenant.name,
        email: tenant.email || undefined,
        phone: tenant.phone || undefined,
        website: tenant.website || undefined,
      },
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDF, { data: pdfData }) as React.ReactElement
    )

    // Create filename with invoice number
    const filename = `faktura-${invoice.invoiceNumber}.pdf`.replace(/\//g, '-')

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
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
