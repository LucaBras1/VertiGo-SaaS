/**
 * Orders API Route
 * GET all orders, POST create new order
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const orderItemSchema = z.object({
  programId: z.string().optional(),
  activityId: z.string().optional(),
  extraId: z.string().optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  price: z.number().default(0),
  notes: z.string().optional(),
})

const orderSchema = z.object({
  customerId: z.string().optional(),
  source: z.enum(['manual', 'web', 'phone', 'email']).default('manual'),
  status: z.enum(['new', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('new'),
  sessionName: z.string().optional(),
  dates: z.array(z.string()).default([]),
  venue: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    indoorOutdoor: z.string().optional(),
  }).default({}),
  teamSize: z.number().optional(),
  teamComposition: z.object({
    departments: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
    seniority: z.string().optional(),
  }).optional(),
  objectives: z.array(z.string()).optional(),
  customObjectives: z.string().optional(),
  industryType: z.string().optional(),
  items: z.array(orderItemSchema).default([]),
  technicalRequirements: z.any().optional(),
  pricing: z.object({
    subtotal: z.number().optional(),
    discount: z.number().optional(),
    total: z.number().optional(),
  }).optional(),
  paymentMethod: z.string().optional(),
  paymentDueDate: z.string().optional(),
  invoiceEmail: z.string().email().optional(),
  logistics: z.any().optional(),
  contacts: z.any().optional(),
  documents: z.any().optional(),
  linkedSessionId: z.string().optional(),
  internalNotes: z.string().optional(),
})

function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD-${year}${month}-${random}`
}

// GET - List all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
          items: {
            include: {
              program: { select: { id: true, title: true } },
              activity: { select: { id: true, title: true } },
              extra: { select: { id: true, title: true } },
            },
          },
          linkedSession: {
            select: { id: true, date: true, status: true },
          },
          _count: {
            select: { invoices: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: validatedData.customerId,
        source: validatedData.source,
        status: validatedData.status,
        sessionName: validatedData.sessionName,
        dates: validatedData.dates,
        venue: validatedData.venue,
        teamSize: validatedData.teamSize,
        teamComposition: validatedData.teamComposition,
        objectives: validatedData.objectives,
        customObjectives: validatedData.customObjectives,
        industryType: validatedData.industryType,
        technicalRequirements: validatedData.technicalRequirements,
        pricing: validatedData.pricing,
        paymentMethod: validatedData.paymentMethod,
        paymentDueDate: validatedData.paymentDueDate ? new Date(validatedData.paymentDueDate) : undefined,
        invoiceEmail: validatedData.invoiceEmail,
        logistics: validatedData.logistics,
        contacts: validatedData.contacts,
        documents: validatedData.documents,
        linkedSessionId: validatedData.linkedSessionId,
        internalNotes: validatedData.internalNotes,
        items: {
          create: validatedData.items.map(item => ({
            programId: item.programId,
            activityId: item.activityId,
            extraId: item.extraId,
            date: item.date,
            startTime: item.startTime,
            endTime: item.endTime,
            price: item.price,
            notes: item.notes,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            program: { select: { id: true, title: true } },
            activity: { select: { id: true, title: true } },
            extra: { select: { id: true, title: true } },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
