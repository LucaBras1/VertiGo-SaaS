/**
 * Pages API Routes
 *
 * GET    /api/admin/pages - List all pages
 * POST   /api/admin/pages - Create new page
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/pages - List all pages with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 25
    const skip = (page - 1) * pageSize

    // Filter params
    const statusFilter = searchParams.getAll('status')

    // Build where clause
    const where: any = {}

    if (statusFilter.length > 0) {
      where.status = { in: statusFilter }
    }

    // Get total count for pagination
    const totalItems = await prisma.page.count({ where })

    // Get paginated data
    const pages = await prisma.page.findMany({
      where,
      orderBy: { title: 'asc' },
      skip,
      take: pageSize,
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      pages,
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
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST /api/admin/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.page.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status || 'draft',
        content: data.content,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: page }, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
