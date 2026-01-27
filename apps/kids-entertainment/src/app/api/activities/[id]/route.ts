/**
 * Activity Detail API Routes
 * GET /api/activities/[id] - Get activity by ID
 * PUT /api/activities/[id] - Update activity
 * DELETE /api/activities/[id] - Delete activity
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
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        title: body.title,
        category: body.category,
        status: body.status,
        featured: body.featured,
        subtitle: body.subtitle,
        excerpt: body.excerpt,
        description: body.description,
        duration: body.duration,
        ageAppropriate: body.ageAppropriate,
        minChildren: body.minChildren,
        maxChildren: body.maxChildren,
        safetyRating: body.safetyRating,
        safetyNotes: body.safetyNotes,
        allergensInvolved: body.allergensInvolved,
        choking_hazard: body.choking_hazard,
        energyLevel: body.energyLevel,
        indoorOutdoor: body.indoorOutdoor,
        materials: body.materials,
        setupTime: body.setupTime,
        skillsDeveloped: body.skillsDeveloped,
        educationalValue: body.educationalValue,
        price: body.price,
        featuredImageUrl: body.featuredImageUrl,
        featuredImageAlt: body.featuredImageAlt,
        galleryImages: body.galleryImages,
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
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

    await prisma.activity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}
