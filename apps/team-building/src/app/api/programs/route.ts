/**
 * API Route: /api/programs
 * Handles CRUD operations for Programs
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

/**
 * GET /api/programs
 * List all programs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')

    const where: any = {}
    if (status) where.status = status
    if (featured !== null) where.featured = featured === 'true'
    if (category) where.category = category

    const programs = await prisma.program.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: {
        activityLinks: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                duration: true,
                objectives: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            sessions: true,
            orderItems: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: programs })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/programs
 * Create a new program
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      subtitle,
      excerpt,
      description,
      teamSize,
      minTeamSize,
      maxTeamSize,
      objectives,
      industryType,
      physicalLevel,
      indoorOutdoor,
      duration,
      includesCatering,
      debriefIncluded,
      facilitationRequired,
      technicalRequirements,
      materialsIncluded,
      venueRequirements,
      price,
      pricePerPerson,
      pricingNotes,
      featuredImageUrl,
      featuredImageAlt,
      galleryImages,
      videoUrl,
      seo,
      category,
      status,
      featured,
      order,
      activityIds, // Array of activity IDs to link
    } = body

    // Generate slug from title
    const slug = slugify(title)

    // Check if slug already exists
    const existingProgram = await prisma.program.findUnique({
      where: { slug },
    })

    if (existingProgram) {
      return NextResponse.json(
        { success: false, error: 'Program with this title already exists' },
        { status: 400 }
      )
    }

    // Create program
    const program = await prisma.program.create({
      data: {
        title,
        slug,
        subtitle,
        excerpt,
        description,
        category: category || 'team-building',
        status: status || 'active',
        featured: featured || false,
        order: order || 100,
        teamSize,
        minTeamSize,
        maxTeamSize,
        objectives,
        industryType,
        physicalLevel,
        indoorOutdoor,
        duration,
        includesCatering: includesCatering || false,
        debriefIncluded: debriefIncluded !== undefined ? debriefIncluded : true,
        facilitationRequired: facilitationRequired !== undefined ? facilitationRequired : true,
        technicalRequirements,
        materialsIncluded,
        venueRequirements,
        price,
        pricePerPerson,
        pricingNotes,
        featuredImageUrl,
        featuredImageAlt,
        galleryImages,
        videoUrl,
        seo,
        // Link activities if provided
        ...(activityIds && activityIds.length > 0
          ? {
              activityLinks: {
                create: activityIds.map((activityId: string, index: number) => ({
                  activityId,
                  order: index,
                })),
              },
            }
          : {}),
      },
      include: {
        activityLinks: {
          include: {
            activity: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: program }, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
      { status: 500 }
    )
  }
}
