/**
 * Team Member Detail API Routes
 *
 * GET    /api/admin/team/[id] - Get single team member
 * PUT    /api/admin/team/[id] - Update team member
 * DELETE /api/admin/team/[id] - Delete team member
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/team/[id] - Get single team member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    return NextResponse.json({ data: teamMember }, { status: 200 })
  } catch (error) {
    console.error('Error fetching team member:', error)
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 })
  }
}

// PUT /api/admin/team/[id] - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if team member exists
    const existing = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update team member
    const teamMember = await prisma.teamMember.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        order: data.order,
        bio: data.bio,
        photoUrl: data.photoUrl,
        photoAlt: data.photoAlt,
        email: data.email,
        phone: data.phone,
        socialLinks: data.socialLinks,
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ data: teamMember }, { status: 200 })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
  }
}

// DELETE /api/admin/team/[id] - Delete team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if team member exists
    const existing = await prisma.teamMember.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Delete team member
    await prisma.teamMember.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Team member deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}
