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
    const statusFilter = searchParams.getAll('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build where clause
    const where: any = {}

    if (statusFilter.length > 0) {
      where.status = { in: statusFilter }
    }

    if (dateFrom || dateTo) {
      where.publishedAt = {}
      if (dateFrom) {
        where.publishedAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.publishedAt.lte = new Date(dateTo)
      }
    }

    // Get total count for pagination
    const totalItems = await prisma.post.count({ where })

    // Get paginated data
    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: pageSize,
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      posts,
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
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.title || !data.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.post.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status || 'draft',
        featured: data.featured || false,
        categories: data.categories,
        excerpt: data.excerpt,
        content: data.content,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt,
        author: data.author,
        publishedAt: data.status === 'published' ? new Date() : null,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
