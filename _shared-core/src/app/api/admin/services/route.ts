/**
 * Services API Routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      if (statusFilter.includes('active')) {
        where.isActive = true
      } else if (statusFilter.includes('inactive')) {
        where.isActive = false
      }
    }

    // Get total count for pagination
    const totalItems = await prisma.service.count({ where })

    // Get paginated data
    const services = await prisma.service.findMany({
      where,
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      skip,
      take: pageSize,
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      services,
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
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.title || !data.slug || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.service.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        status: data.status || 'active',
        order: data.order || 100,
        excerpt: data.excerpt,
        description: data.description,
        priceFrom: data.priceFrom,
        priceUnit: data.priceUnit,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: service }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
