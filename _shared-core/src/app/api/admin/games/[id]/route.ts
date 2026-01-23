/**
 * Game Detail API Routes
 *
 * GET    /api/admin/games/[id] - Get single game
 * PUT    /api/admin/games/[id] - Update game
 * DELETE /api/admin/games/[id] - Delete game
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/games/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { id: params.id },
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json({ data: game }, { status: 200 })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}

// PUT /api/admin/games/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const existing = await prisma.game.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.game.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const game = await prisma.game.update({
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
        minPlayers: data.minPlayers,
        maxPlayers: data.maxPlayers,
        technicalRequirements: data.technicalRequirements,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt,
        galleryImages: data.galleryImages,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: game }, { status: 200 })
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }
}

// DELETE /api/admin/games/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.game.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    await prisma.game.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}
