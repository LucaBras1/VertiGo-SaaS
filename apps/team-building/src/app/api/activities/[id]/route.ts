/**
 * API Route: /api/activities/[id]
 * Handles individual activity operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/activities/[id]
 * Get a single activity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        programLinks: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/activities/[id]
 * Update an activity
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const {
      title,
      subtitle,
      excerpt,
      description,
      minParticipants,
      maxParticipants,
      idealGroupSize,
      objectives,
      learningOutcomes,
      physicalDemand,
      indoorOutdoor,
      duration,
      materialsNeeded,
      setupTime,
      facilitatorGuide,
      difficultyLevel,
      scalable,
      canCombine,
      price,
      featuredImageUrl,
      featuredImageAlt,
      galleryImages,
      videoUrl,
      instructionPdfUrl,
      seo,
      category,
      status,
      featured,
      order,
    } = body

    // Update activity
    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        title,
        subtitle,
        excerpt,
        description,
        category,
        status,
        featured,
        order,
        minParticipants,
        maxParticipants,
        idealGroupSize,
        objectives,
        learningOutcomes,
        physicalDemand,
        indoorOutdoor,
        duration,
        materialsNeeded,
        setupTime,
        facilitatorGuide,
        difficultyLevel,
        scalable,
        canCombine,
        price,
        featuredImageUrl,
        featuredImageAlt,
        galleryImages,
        videoUrl,
        instructionPdfUrl,
        seo,
      },
      include: {
        programLinks: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/activities/[id]
 * Delete an activity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.activity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}
