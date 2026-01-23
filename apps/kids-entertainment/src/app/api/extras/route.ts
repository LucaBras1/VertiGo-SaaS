/**
 * Extras API Routes
 * GET /api/extras - List all extras
 * POST /api/extras - Create new extra
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) where.category = category

    const extras = await prisma.extra.findMany({
      where,
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json(extras)
  } catch (error) {
    console.error('Error fetching extras:', error)
    return NextResponse.json(
      { error: 'Failed to fetch extras' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const extra = await prisma.extra.create({
      data: {
        title: body.title || body.name,
        slug: body.slug || slug,
        category: body.category,
        description: body.description,
        priceFrom: body.price || body.priceFrom,
        featuredImageUrl: body.imageUrl || body.featuredImageUrl,
      },
    })

    return NextResponse.json(extra, { status: 201 })
  } catch (error) {
    console.error('Error creating extra:', error)
    return NextResponse.json(
      { error: 'Failed to create extra' },
      { status: 500 }
    )
  }
}
