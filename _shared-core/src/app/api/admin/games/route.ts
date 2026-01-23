/**
 * Games API Routes
 *
 * GET    /api/admin/games - List all games
 * POST   /api/admin/games - Create new game
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/games - List all games with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 25
    const skip = (page - 1) * pageSize

    // Filter params
    const categoryFilter = searchParams.getAll('category')
    const statusFilter = searchParams.getAll('status')

    // Build where clause
    const where: any = {}

    if (categoryFilter.length > 0) {
      where.category = { in: categoryFilter }
    }

    if (statusFilter.length > 0) {
      where.status = { in: statusFilter }
    }

    // Get total count for pagination
    const totalItems = await prisma.game.count({ where })

    // Get paginated data
    const games = await prisma.game.findMany({
      where,
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        featured: true,
        order: true,
        featuredImageUrl: true,
        featuredImageAlt: true,
        duration: true,
        price: true,
        minPlayers: true,
        maxPlayers: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      data: games,
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
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

// POST /api/admin/games - Create new game
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.slug || !data.category || !data.featuredImageUrl || !data.duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.game.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        status: data.status || 'active',
        featured: data.featured || false,
        order: data.order || 100,
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        description: data.description,
        duration: data.duration,
        ageRange: data.ageRange,
        minPlayers: data.minPlayers,
        maxPlayers: data.maxPlayers,
        technicalRequirements: data.technicalRequirements,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt || data.title,
        galleryImages: data.galleryImages,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: game }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
