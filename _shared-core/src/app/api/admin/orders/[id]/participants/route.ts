// API Route: /api/admin/orders/[id]/participants
// CRUD operations for event participants

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/orders/[id]/participants
 * Get all participants for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const participants = await prisma.eventParticipant.findMany({
      where: { orderId: id },
      include: {
        teamMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      participants,
    })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch participants',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/orders/[id]/participants
 * Add a new participant to an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { type, email, name, phone, teamMemberId, includePricing } = body

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Typ ucastnika je povinny' },
        { status: 400 }
      )
    }

    // Build participant data
    let participantData: any = {
      orderId: id,
      type,
      includePricing: includePricing ?? (type === 'customer'), // Default: customers see pricing
    }

    // If it's an employee, get data from TeamMember
    if (type === 'employee' && teamMemberId) {
      const teamMember = await prisma.teamMember.findUnique({
        where: { id: teamMemberId },
      })

      if (!teamMember) {
        return NextResponse.json(
          { success: false, error: 'Clen tymu nenalezen' },
          { status: 404 }
        )
      }

      if (!teamMember.email) {
        return NextResponse.json(
          { success: false, error: 'Clen tymu nema email' },
          { status: 400 }
        )
      }

      participantData.teamMemberId = teamMemberId
      participantData.email = teamMember.email
      participantData.name = `${teamMember.firstName} ${teamMember.lastName}`
      participantData.phone = teamMember.phone
      participantData.includePricing = includePricing ?? false // Employees don't see pricing by default
    } else if (type === 'customer') {
      // For customer, try to get data from order's customer
      const order = await prisma.order.findUnique({
        where: { id },
        include: { customer: true },
      })

      if (order?.customer) {
        participantData.email = email || order.customer.email
        participantData.name = name || `${order.customer.firstName} ${order.customer.lastName}`
        participantData.phone = phone || order.customer.phone
      } else {
        // Validate email for customer without linked customer record
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email je povinny' },
            { status: 400 }
          )
        }
        participantData.email = email
        participantData.name = name
        participantData.phone = phone
      }
    } else {
      // External participant - require email
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email je povinny' },
          { status: 400 }
        )
      }
      participantData.email = email
      participantData.name = name
      participantData.phone = phone
    }

    // Check if participant with same email already exists for this order
    const existingParticipant = await prisma.eventParticipant.findFirst({
      where: {
        orderId: id,
        email: participantData.email,
      },
    })

    if (existingParticipant) {
      return NextResponse.json(
        { success: false, error: 'Ucastnik s timto emailem jiz existuje' },
        { status: 400 }
      )
    }

    const participant = await prisma.eventParticipant.create({
      data: participantData,
      include: {
        teamMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      participant,
    })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create participant',
      },
      { status: 500 }
    )
  }
}
