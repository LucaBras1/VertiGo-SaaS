/**
 * Party Safety Checklist API Routes
 * GET /api/parties/[id]/checklist - Get checklist
 * PATCH /api/parties/[id]/checklist - Update checklist
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

    // Try to find existing checklist
    let checklist = await prisma.safetyChecklist.findUnique({
      where: { partyId: id },
    })

    // If no checklist exists, create one
    if (!checklist) {
      checklist = await prisma.safetyChecklist.create({
        data: {
          partyId: id,
          allergyReview: false,
          emergencyContacts: false,
          venueAssessment: false,
          equipmentCheck: false,
          staffBriefing: false,
          headcountVerified: false,
          allergiesConfirmed: false,
          incidentReport: false,
          feedbackCollected: false,
        },
      })
    }

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
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

    // Handle boolean fields
    const booleanFields = [
      'allergyReview',
      'emergencyContacts',
      'venueAssessment',
      'equipmentCheck',
      'staffBriefing',
      'headcountVerified',
      'allergiesConfirmed',
      'incidentReport',
      'feedbackCollected',
    ]

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.completedBy !== undefined) updateData.completedBy = body.completedBy

    // Check if all pre-party checks are complete
    const allPrePartyComplete =
      (body.allergyReview ?? false) &&
      (body.emergencyContacts ?? false) &&
      (body.venueAssessment ?? false) &&
      (body.equipmentCheck ?? false) &&
      (body.staffBriefing ?? false)

    if (allPrePartyComplete && !updateData.completedAt) {
      updateData.completedAt = new Date()
      updateData.completedBy = session.user?.name || session.user?.email
    }

    const checklist = await prisma.safetyChecklist.upsert({
      where: { partyId: id },
      update: updateData,
      create: {
        partyId: id,
        ...updateData,
      },
    })

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Error updating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    )
  }
}
