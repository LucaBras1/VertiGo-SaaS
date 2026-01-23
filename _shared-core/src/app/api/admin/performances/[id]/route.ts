/**
 * Performance Detail API Routes
 *
 * GET    /api/admin/performances/[id] - Get single performance
 * PUT    /api/admin/performances/[id] - Update performance
 * DELETE /api/admin/performances/[id] - Delete performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/performances/[id] - Get single performance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const performance = await prisma.performance.findUnique({
      where: { id: params.id },
    })

    if (!performance) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 })
    }

    return NextResponse.json({ data: performance }, { status: 200 })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 })
  }
}

// PUT /api/admin/performances/[id] - Update performance
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if performance exists
    const existing = await prisma.performance.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 })
    }

    // Check if slug is being changed and conflicts with another performance
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.performance.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Update performance
    const performance = await prisma.performance.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        status: data.status,
        featured: data.featured,
        order: data.order,
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        description: data.description,
        duration: data.duration,
        ageRange: data.ageRange,
        price: data.price,
        technicalRequirements: data.technicalRequirements,
        crew: data.crew,
        premiere: data.premiere ? new Date(data.premiere) : null,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt,
        galleryImages: data.galleryImages,
        videoUrl: data.videoUrl,
        posterUrl: data.posterUrl,
        references: data.references,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: performance }, { status: 200 })
  } catch (error) {
    console.error('Error updating performance:', error)
    return NextResponse.json({ error: 'Failed to update performance' }, { status: 500 })
  }
}

// DELETE /api/admin/performances/[id] - Delete performance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if performance exists
    const existing = await prisma.performance.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 })
    }

    // Delete performance
    await prisma.performance.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Performance deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting performance:', error)
    return NextResponse.json({ error: 'Failed to delete performance' }, { status: 500 })
  }
}
