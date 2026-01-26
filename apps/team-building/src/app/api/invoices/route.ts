/**
 * Invoices API Route
 * GET all invoices, POST create new invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const invoiceItemSchema = z.object({
  description: z.string(),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  totalPrice: z.number(),
})

const invoiceSchema = z.object({
  customerId: z.string(),
  orderId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  issueDate: z.string().optional(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema),
  subtotal: z.number(),
  vatRate: z.number().default(21),
  vatAmount: z.number().default(0),
  totalAmount: z.number(),
  paymentMethod: z.string().optional(),
  bankAccount: z.string().optional(),
  variableSymbol: z.string().optional(),
  currency: z.string().default('CZK'),
  textBeforeItems: z.string().optional(),
  textAfterItems: z.string().optional(),
  notes: z.string().optional(),
})

function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `${year}${random}`
}

// GET - List all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const orderId = searchParams.get('orderId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId
    if (orderId) where.orderId = orderId

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
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
              sessionName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + invoices.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: validatedData.customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerId: validatedData.customerId,
        orderId: validatedData.orderId,
        status: validatedData.status,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: new Date(validatedData.dueDate),
        items: validatedData.items,
        subtotal: validatedData.subtotal,
        vatRate: validatedData.vatRate,
        vatAmount: validatedData.vatAmount,
        totalAmount: validatedData.totalAmount,
        paymentMethod: validatedData.paymentMethod,
        bankAccount: validatedData.bankAccount,
        variableSymbol: validatedData.variableSymbol,
        currency: validatedData.currency,
        textBeforeItems: validatedData.textBeforeItems,
        textAfterItems: validatedData.textAfterItems,
        notes: validatedData.notes,
      },
      include: {
        customer: true,
        order: true,
      },
    })

    // Update customer invoice stats
    await prisma.customer.update({
      where: { id: validatedData.customerId },
      data: {
        totalInvoiced: { increment: validatedData.totalAmount },
        invoiceCount: { increment: 1 },
        lastInvoiceDate: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
