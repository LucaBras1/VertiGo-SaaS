/**
 * Invoices API Routes
 *
 * GET /api/admin/invoicing/invoices - List invoices
 * POST /api/admin/invoicing/invoices - Create invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listInvoices, createInvoice } from '@/lib/invoicing/invoice-service'
import { InvoiceFilters, CreateInvoiceData, InvoiceStatus, DocumentType } from '@/types/invoicing'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams

    // Build filters from query params
    const filters: InvoiceFilters = {}

    const search = searchParams.get('search')
    if (search) filters.search = search

    const status = searchParams.get('status')
    if (status) filters.status = status.split(',') as InvoiceStatus[]

    const documentType = searchParams.get('documentType')
    if (documentType) filters.documentType = documentType.split(',') as DocumentType[]

    const customerId = searchParams.get('customerId')
    if (customerId) filters.customerId = customerId

    const dateFrom = searchParams.get('dateFrom')
    if (dateFrom) filters.dateFrom = dateFrom

    const dateTo = searchParams.get('dateTo')
    if (dateTo) filters.dateTo = dateTo

    const amountMin = searchParams.get('amountMin')
    if (amountMin) filters.amountMin = parseInt(amountMin)

    const amountMax = searchParams.get('amountMax')
    if (amountMax) filters.amountMax = parseInt(amountMax)

    const isPaid = searchParams.get('isPaid')
    if (isPaid) filters.isPaid = isPaid === 'true'

    const isOverdue = searchParams.get('isOverdue')
    if (isOverdue) filters.isOverdue = isOverdue === 'true'

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    const result = await listInvoices(filters, page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to list invoices:', error)
    return NextResponse.json(
      { error: 'Failed to list invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json() as CreateInvoiceData

    // Validate required fields
    if (!data.customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (!data.dueDate) {
      return NextResponse.json(
        { error: 'Due date is required' },
        { status: 400 }
      )
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    const invoice = await createInvoice(data)

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
