/**
 * Entertainer Detail API Routes
 * GET /api/entertainers/[id] - Get entertainer details
 * PATCH /api/entertainers/[id] - Update entertainer
 * DELETE /api/entertainers/[id] - Delete entertainer
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const entertainer = await prisma.entertainer.findUnique({
      where: { id },
    })

    if (!entertainer) {
      return NextResponse.json({ error: 'Entertainer not found' }, { status: 404 })
    }

    return NextResponse.json(entertainer)
  } catch (error) {
    console.error('Error fetching entertainer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entertainer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    // Handle updatable fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.stageName !== undefined) updateData.stageName = body.stageName
    if (body.role !== undefined) updateData.role = body.role
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.specializations !== undefined) updateData.specializations = body.specializations
    if (body.ageGroups !== undefined) updateData.ageGroups = body.ageGroups
    if (body.languages !== undefined) updateData.languages = body.languages
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Handle date fields
    if (body.backgroundCheckDate !== undefined) {
      updateData.backgroundCheckDate = body.backgroundCheckDate
        ? new Date(body.backgroundCheckDate)
        : null
    }
    if (body.backgroundCheckStatus !== undefined) {
      updateData.backgroundCheckStatus = body.backgroundCheckStatus
    }
    if (body.firstAidCertified !== undefined) {
      updateData.firstAidCertified = body.firstAidCertified
    }
    if (body.firstAidExpiryDate !== undefined) {
      updateData.firstAidExpiryDate = body.firstAidExpiryDate
        ? new Date(body.firstAidExpiryDate)
        : null
    }
    if (body.insuranceNumber !== undefined) {
      updateData.insuranceNumber = body.insuranceNumber
    }
    if (body.insuranceExpiryDate !== undefined) {
      updateData.insuranceExpiryDate = body.insuranceExpiryDate
        ? new Date(body.insuranceExpiryDate)
        : null
    }

    const entertainer = await prisma.entertainer.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(entertainer)
  } catch (error) {
    console.error('Error updating entertainer:', error)
    return NextResponse.json(
      { error: 'Failed to update entertainer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.entertainer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entertainer:', error)
    return NextResponse.json(
      { error: 'Failed to delete entertainer' },
      { status: 500 }
    )
  }
}
