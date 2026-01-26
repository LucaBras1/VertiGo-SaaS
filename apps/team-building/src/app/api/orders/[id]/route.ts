/**
 * Order Detail API Route
 * GET, PUT, DELETE for single order
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const orderItemSchema = z.object({
  id: z.string().optional(),
  programId: z.string().optional(),
  activityId: z.string().optional(),
  extraId: z.string().optional(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  price: z.number().default(0),
  notes: z.string().optional(),
})

const orderUpdateSchema = z.object({
  customerId: z.string().optional(),
  source: z.enum(['manual', 'web', 'phone', 'email']).optional(),
  status: z.enum(['new', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  sessionName: z.string().optional(),
  dates: z.array(z.string()).optional(),
  venue: z.object({
    name: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    indoorOutdoor: z.string().optional(),
  }).optional(),
  teamSize: z.number().optional(),
  teamComposition: z.any().optional(),
  objectives: z.array(z.string()).optional(),
  customObjectives: z.string().optional(),
  industryType: z.string().optional(),
  items: z.array(orderItemSchema).optional(),
  technicalRequirements: z.any().optional(),
  pricing: z.any().optional(),
  paymentMethod: z.string().optional(),
  paymentDueDate: z.string().optional(),
  invoiceEmail: z.string().email().optional(),
  logistics: z.any().optional(),
  contacts: z.any().optional(),
  documents: z.any().optional(),
  linkedSessionId: z.string().optional(),
  internalNotes: z.string().optional(),
})

// GET - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            program: { select: { id: true, title: true, price: true } },
            activity: { select: { id: true, title: true, price: true } },
            extra: { select: { id: true, title: true, priceFrom: true } },
          },
        },
        linkedSession: true,
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = orderUpdateSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Handle items update if provided
    if (validatedData.items) {
      // Delete existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      })

      // Create new items
      await prisma.orderItem.createMany({
        data: validatedData.items.map(item => ({
          orderId: id,
          programId: item.programId,
          activityId: item.activityId,
          extraId: item.extraId,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          price: item.price,
          notes: item.notes,
        })),
      })
    }

    // Update order
    const { items, ...orderData } = validatedData
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        paymentDueDate: orderData.paymentDueDate ? new Date(orderData.paymentDueDate) : undefined,
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
        linkedSession: true,
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

    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if order has invoices
    const order = await prisma.order.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true } } },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order._count.invoices > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete order with invoices. Delete invoices first.' },
        { status: 400 }
      )
    }

    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
