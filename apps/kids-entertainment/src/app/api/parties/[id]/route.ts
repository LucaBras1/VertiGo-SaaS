/**
 * Party Detail API Routes
 * GET /api/parties/[id] - Get party details
 * PATCH /api/parties/[id] - Update party
 * DELETE /api/parties/[id] - Delete party
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const party = await prisma.party.findUnique({
      where: { id },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            duration: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json(party)
  } catch (error) {
    console.error('Error fetching party:', error)
    return NextResponse.json(
      { error: 'Failed to fetch party' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const updateData: any = {}

    // Handle updatable fields
    if (body.status !== undefined) updateData.status = body.status
    if (body.childName !== undefined) updateData.childName = body.childName
    if (body.childAge !== undefined) updateData.childAge = body.childAge
    if (body.guestCount !== undefined) updateData.guestCount = body.guestCount
    if (body.theme !== undefined) updateData.theme = body.theme
    if (body.specialRequests !== undefined) updateData.specialRequests = body.specialRequests
    if (body.allergies !== undefined) updateData.allergies = body.allergies
    if (body.venue !== undefined) updateData.venue = body.venue
    if (body.date !== undefined) updateData.date = new Date(body.date)

    const party = await prisma.party.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(party)
  } catch (error) {
    console.error('Error updating party:', error)
    return NextResponse.json(
      { error: 'Failed to update party' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await prisma.party.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting party:', error)
    return NextResponse.json(
      { error: 'Failed to delete party' },
      { status: 500 }
    )
  }
}
