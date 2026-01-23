/**
 * Public API Route: /api/public/catalog
 * Returns list of active performances, games, and services for public order form
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/public/catalog
 * Returns active catalog items for public ordering
 */
export async function GET() {
  try {
    // Fetch active performances, games, and services in parallel
    const [performances, games, services] = await Promise.all([
      prisma.performance.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
        },
        orderBy: [
          { order: 'asc' },
          { title: 'asc' },
        ],
      }),
      prisma.game.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
        },
        orderBy: [
          { order: 'asc' },
          { title: 'asc' },
        ],
      }),
      prisma.service.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
        },
        orderBy: [
          { order: 'asc' },
          { title: 'asc' },
        ],
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        performances,
        games,
        services,
      },
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Nepodařilo se načíst katalog.',
      },
      { status: 500 }
    )
  }
}
