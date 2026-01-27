/**
 * Package Detail API Routes
 * GET /api/packages/[id] - Get package by ID
 * PUT /api/packages/[id] - Update package
 * DELETE /api/packages/[id] - Delete package
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
    const packageData = await prisma.package.findUnique({
      where: { id: params.id },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
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

    const packageData = await prisma.package.update({
      where: { id: params.id },
      data: {
        title: body.title,
        category: body.category,
        status: body.status,
        featured: body.featured,
        subtitle: body.subtitle,
        excerpt: body.excerpt,
        description: body.description,
        ageGroupMin: body.ageGroupMin,
        ageGroupMax: body.ageGroupMax,
        ageGroups: body.ageGroups,
        maxChildren: body.maxChildren,
        duration: body.duration,
        themeName: body.themeName,
        includesCharacter: body.includesCharacter,
        characterName: body.characterName,
        includesCake: body.includesCake,
        includesGoodybags: body.includesGoodybags,
        includesDecoration: body.includesDecoration,
        includesPhotos: body.includesPhotos,
        safetyNotes: body.safetyNotes,
        allergens: body.allergens,
        indoorOutdoor: body.indoorOutdoor,
        price: body.price,
        pricePerChild: body.pricePerChild,
        featuredImageUrl: body.featuredImageUrl,
        featuredImageAlt: body.featuredImageAlt,
        galleryImages: body.galleryImages,
        videoUrl: body.videoUrl,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
    })

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
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

    await prisma.package.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}
