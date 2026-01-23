// API Route: /api/admin/invoices
// CRUD operations for invoices using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

/**
 * Generate next invoice number (format: FV-YYYY-NNNN)
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `FV-${year}-`

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { invoiceNumber: 'desc' },
  })

  let nextNumber = 1
  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10)
    nextNumber = lastNum + 1
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

/**
 * GET /api/admin/invoices
 * Get all invoices with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')
    const offset = (page - 1) * pageSize

    // Filter params
    const statusFilter = searchParams.getAll('status')
    const issueDateFrom = searchParams.get('issueDateFrom') || undefined
    const issueDateTo = searchParams.get('issueDateTo') || undefined
    const dueDateFrom = searchParams.get('dateFrom') || undefined
    const dueDateTo = searchParams.get('dateTo') || undefined
    const minAmount = searchParams.get('minAmount') ? parseInt(searchParams.get('minAmount')!) : undefined
    const maxAmount = searchParams.get('maxAmount') ? parseInt(searchParams.get('maxAmount')!) : undefined
    const search = searchParams.get('search') || undefined
    const customerId = searchParams.get('customerId') || undefined
    const orderId = searchParams.get('orderId') || undefined
    const hasVyfakturujParam = searchParams.get('hasVyfakturuj')
    const hasVyfakturuj = hasVyfakturujParam === 'true' ? true : hasVyfakturujParam === 'false' ? false : undefined

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {}
    const AND: Prisma.InvoiceWhereInput[] = []

    // Status filter
    if (statusFilter.length > 0) {
      AND.push({ status: { in: statusFilter } })
    }

    // Customer filter
    if (customerId) {
      AND.push({ customerId })
    }

    // Order filter
    if (orderId) {
      AND.push({ orderId })
    }

    // Issue date range
    if (issueDateFrom || issueDateTo) {
      const issueDateFilter: any = {}
      if (issueDateFrom) issueDateFilter.gte = new Date(issueDateFrom)
      if (issueDateTo) issueDateFilter.lte = new Date(issueDateTo)
      AND.push({ issueDate: issueDateFilter })
    }

    // Due date range
    if (dueDateFrom || dueDateTo) {
      const dueDateFilter: any = {}
      if (dueDateFrom) dueDateFilter.gte = new Date(dueDateFrom)
      if (dueDateTo) dueDateFilter.lte = new Date(dueDateTo)
      AND.push({ dueDate: dueDateFilter })
    }

    // Amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
      const amountFilter: any = {}
      if (minAmount !== undefined) amountFilter.gte = minAmount
      if (maxAmount !== undefined) amountFilter.lte = maxAmount
      AND.push({ totalAmount: amountFilter })
    }

    // Vyfakturuj sync filter
    if (hasVyfakturuj !== undefined) {
      if (hasVyfakturuj) {
        AND.push({ vyfakturujId: { not: null } })
      } else {
        AND.push({ vyfakturujId: null })
      }
    }

    // Search filter - search in invoice number and related customer
    if (search) {
      AND.push({
        OR: [
          { invoiceNumber: { contains: search } },
          { customer: { firstName: { contains: search } } },
          { customer: { lastName: { contains: search } } },
          { customer: { organization: { contains: search } } },
          { customer: { email: { contains: search } } },
        ],
      })
    }

    if (AND.length > 0) {
      where.AND = AND
    }

    // Get total count and paginated invoices (optimized selects)
    const [totalItems, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          issueDate: true,
          dueDate: true,
          totalAmount: true,
          paidAmount: true,
          paidDate: true,
          vyfakturujId: true,
          vyfakturujNumber: true,
          publicUrl: true,
          createdAt: true,
          customerId: true,
          orderId: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              organization: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              eventName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: pageSize,
      }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/invoices
 * Create new invoice from order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.orderId || !body.customerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID and Customer ID are required',
        },
        { status: 400 }
      )
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Default due date: 14 days from issue
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: body.customerId,
        orderId: body.orderId,
        issueDate: new Date(),
        dueDate,
        status: 'draft',
        items: [],
        subtotal: 0,
        vatRate: 0,
        vatAmount: 0,
        totalAmount: 0,
      },
      include: {
        customer: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            eventName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      },
      { status: 500 }
    )
  }
}
