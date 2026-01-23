/**
 * Public Game Detail API
 * GET /api/games/[slug] - Get game by slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Cache for 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const game = await prisma.game.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        featured: true,
        subtitle: true,
        excerpt: true,
        description: true,
        duration: true,
        ageRange: true,
        minPlayers: true,
        maxPlayers: true,
        technicalRequirements: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
        galleryImages: true,
        seo: true,
      },
    })

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    // Only return active games publicly
    if (game.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: game,
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
