// API Route: /api/admin/orders/[id]/participants/[pid]
// Update and delete individual participant

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/orders/[id]/participants/[pid]
 * Update a participant
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; pid: string } }
) {
  try {
    const { pid } = params
    const body = await request.json()

    // Only allow updating specific fields
    const { name, email, phone, includePricing } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (includePricing !== undefined) updateData.includePricing = includePricing

    const participant = await prisma.eventParticipant.update({
      where: { id: pid },
      data: updateData,
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
    console.error('Error updating participant:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update participant',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/orders/[id]/participants/[pid]
 * Delete a participant
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pid: string } }
) {
  try {
    const { pid } = params

    // Get participant to check if it has a calendar event
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: pid },
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'Ucastnik nenalezen' },
        { status: 404 }
      )
    }

    // TODO: If participant has a calendar event, delete it from Google Calendar

    await prisma.eventParticipant.delete({
      where: { id: pid },
    })

    return NextResponse.json({
      success: true,
      message: 'Ucastnik odstranen',
    })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete participant',
      },
      { status: 500 }
    )
  }
}
