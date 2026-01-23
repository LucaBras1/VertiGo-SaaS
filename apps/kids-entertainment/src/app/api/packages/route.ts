/**
 * Packages API Routes
 * GET /api/packages - List all packages
 * POST /api/packages - Create new package
 */

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

    const packages = await prisma.package.findMany({
      where,
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
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
    const existing = await prisma.package.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Package with this title already exists' },
        { status: 400 }
      )
    }

    const packageData = await prisma.package.create({
      data: {
        title: body.title,
        slug,
        category: body.category,
        status: body.status || 'draft',
        featured: body.featured || false,
        subtitle: body.subtitle,
        excerpt: body.excerpt,
        description: body.description,
        ageGroupMin: body.ageGroupMin,
        ageGroupMax: body.ageGroupMax,
        ageGroups: body.ageGroups || [],
        maxChildren: body.maxChildren,
        duration: body.duration,
        themeName: body.themeName,
        includesCharacter: body.includesCharacter || false,
        characterName: body.characterName,
        includesCake: body.includesCake || false,
        includesGoodybags: body.includesGoodybags || false,
        includesDecoration: body.includesDecoration || false,
        includesPhotos: body.includesPhotos || false,
        safetyNotes: body.safetyNotes,
        allergens: body.allergens || [],
        indoorOutdoor: body.indoorOutdoor,
        price: body.price,
        pricePerChild: body.pricePerChild,
        featuredImageUrl: body.featuredImageUrl,
        featuredImageAlt: body.featuredImageAlt,
        galleryImages: body.galleryImages,
        videoUrl: body.videoUrl,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
