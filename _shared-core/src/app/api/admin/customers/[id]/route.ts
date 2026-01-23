// API Route: /api/admin/customers/[id]
// Single customer operations using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/customers/[id]
 * Get single customer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch customer',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/customers/[id]
 * Update customer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // If email is being changed, check for duplicates
    if (body.email) {
      const existing = await prisma.customer.findFirst({
        where: {
          email: body.email,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: 'Another customer with this email already exists',
          },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.email && { email: body.email }),
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.organization !== undefined && { organization: body.organization || null }),
        ...(body.organizationType !== undefined && { organizationType: body.organizationType || null }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.billingInfo !== undefined && { billingInfo: body.billingInfo }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
        ...(body.gdprConsent !== undefined && { gdprConsent: body.gdprConsent }),
        ...(body.vyfakturujContactId !== undefined && { vyfakturujContactId: body.vyfakturujContactId }),
        ...(body.vyfakturujSyncedAt !== undefined && { vyfakturujSyncedAt: body.vyfakturujSyncedAt ? new Date(body.vyfakturujSyncedAt) : null }),
      },
    })

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update customer',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete customer permanently
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            invoices: true,
            communications: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found',
        },
        { status: 404 }
      )
    }

    // Delete associated communications first (no cascade in schema)
    await prisma.communication.deleteMany({
      where: { customerId: id },
    })

    // Delete associated invoices (no cascade in schema)
    await prisma.invoice.deleteMany({
      where: { customerId: id },
    })

    // Delete the customer
    await prisma.customer.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Customer has been permanently deleted',
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete customer',
      },
      { status: 500 }
    )
  }
}
