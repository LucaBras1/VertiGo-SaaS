/**
 * Activities API Routes
 * GET /api/activities - List all activities
 * POST /api/activities - Create new activity
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import slugify from 'slugify'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category
    if (featured) where.featured = featured === 'true'

    const activities = await prisma.activity.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
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

    // Generate slug from title
    const slug = slugify(body.title, { lower: true, strict: true })

    // Check if slug already exists
    const existing = await prisma.activity.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Activity with this title already exists' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        title: body.title,
        slug,
        category: body.category,
        status: body.status || 'draft',
        featured: body.featured || false,
        subtitle: body.subtitle,
        excerpt: body.excerpt,
        description: body.description,
        duration: body.duration,
        ageAppropriate: body.ageAppropriate || [],
        minChildren: body.minChildren,
        maxChildren: body.maxChildren,
        safetyRating: body.safetyRating,
        safetyNotes: body.safetyNotes,
        allergensInvolved: body.allergensInvolved || [],
        choking_hazard: body.choking_hazard || false,
        energyLevel: body.energyLevel,
        indoorOutdoor: body.indoorOutdoor,
        materials: body.materials || [],
        setupTime: body.setupTime,
        skillsDeveloped: body.skillsDeveloped || [],
        educationalValue: body.educationalValue,
        price: body.price,
        featuredImageUrl: body.featuredImageUrl,
        featuredImageAlt: body.featuredImageAlt,
        galleryImages: body.galleryImages,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
