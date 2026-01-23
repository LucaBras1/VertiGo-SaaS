/**
 * Public Games API
 * GET /api/games - List all active games
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    // Build where clause
    const where: any = {
      status: 'active',
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.featured = true
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        featured: true,
        excerpt: true,
        duration: true,
        ageRange: true,
        minPlayers: true,
        maxPlayers: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: games,
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
