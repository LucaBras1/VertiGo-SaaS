/**
 * API Route: /api/programs/[id]
 * Handles operations for a specific program
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

/**
 * GET /api/programs/[id]
 * Get a specific program by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      include: {
        activityLinks: {
          include: {
            activity: true,
          },
          orderBy: { order: 'asc' },
        },
        sessions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            sessions: true,
            orderItems: true,
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: program })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch program' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/programs/[id]
 * Update a specific program
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { activityIds, ...updateData } = body

    // If title changed, regenerate slug
    if (updateData.title) {
      const newSlug = slugify(updateData.title)

      // Check if new slug conflicts with another program
      const existingProgram = await prisma.program.findFirst({
        where: {
          slug: newSlug,
          id: { not: params.id },
        },
      })

      if (existingProgram) {
        return NextResponse.json(
          { success: false, error: 'Program with this title already exists' },
          { status: 400 }
        )
      }

      updateData.slug = newSlug
    }

    // Update program
    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        ...updateData,
        // Update activity links if provided
        ...(activityIds
          ? {
              activityLinks: {
                deleteMany: {}, // Remove all existing links
                create: activityIds.map((activityId: string, index: number) => ({
                  activityId,
                  order: index,
                })),
              },
            }
          : {}),
      },
      include: {
        activityLinks: {
          include: {
            activity: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ success: true, data: program })
  } catch (error) {
    console.error('Error updating program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/programs/[id]
 * Delete a specific program
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if program has sessions or orders
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            sessions: true,
            orderItems: true,
          },
        },
      },
    })

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      )
    }

    if (program._count.sessions > 0 || program._count.orderItems > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cannot delete program with existing sessions or orders. Set status to inactive instead.',
        },
        { status: 400 }
      )
    }

    // Delete program (cascade will delete activity links)
    await prisma.program.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete program' },
      { status: 500 }
    )
  }
}
