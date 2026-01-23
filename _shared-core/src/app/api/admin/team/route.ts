/**
 * Team Members API Routes
 *
 * GET    /api/admin/team - List all team members
 * POST   /api/admin/team - Create new team member
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/team - List all team members with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 25
    const skip = (page - 1) * pageSize

    // Filter params
    const statusFilter = searchParams.getAll('status')

    // Build where clause
    const where: any = {}

    if (statusFilter.length > 0) {
      if (statusFilter.includes('active')) {
        where.isActive = true
      } else if (statusFilter.includes('inactive')) {
        where.isActive = false
      }
    }

    // Get total count for pagination
    const totalItems = await prisma.teamMember.count({ where })

    // Get paginated data
    const teamMembers = await prisma.teamMember.findMany({
      where,
      orderBy: [{ order: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      skip,
      take: pageSize,
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      teamMembers,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST /api/admin/team - Create new team member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        order: data.order || 100,
        bio: data.bio,
        photoUrl: data.photoUrl,
        photoAlt: data.photoAlt,
        email: data.email,
        phone: data.phone,
        socialLinks: data.socialLinks,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })

    return NextResponse.json({ data: teamMember }, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
