/**
 * API Route: /api/customers/[id]
 * Handles individual customer operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/customers/[id]
 * Get a single customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/customers/[id]
 * Update a customer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const {
      email,
      firstName,
      lastName,
      phone,
      organization,
      organizationType,
      industryType,
      teamSize,
      notes,
    } = body

    // Check if email is being changed and already exists
    if (email) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      })

      if (existingCustomer && existingCustomer.id !== params.id) {
        return NextResponse.json(
          { success: false, error: 'Customer with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        email,
        firstName,
        lastName,
        phone,
        organization,
        organizationType,
        industryType,
        teamSize,
        notes,
      },
    })

    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer has orders
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (customer && customer._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
