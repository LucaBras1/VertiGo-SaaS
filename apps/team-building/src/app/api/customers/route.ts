/**
 * API Route: /api/customers
 * Handles CRUD operations for Customers
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/customers
 * List all customers with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industryType = searchParams.get('industryType')
    const organizationType = searchParams.get('organizationType')

    const where: any = {}
    if (industryType) where.industryType = industryType
    if (organizationType) where.organizationType = organizationType

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        organization: true,
        organizationType: true,
        industryType: true,
        teamSize: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            invoices: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 400 }
      )
    }

    // Create customer
    const customer = await prisma.customer.create({
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

    return NextResponse.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
