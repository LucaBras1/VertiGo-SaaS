/**
 * API Route: /api/activities
 * Handles CRUD operations for Activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

/**
 * GET /api/activities
 * List all activities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const objective = searchParams.get('objective') // Filter by objective
    const physicalDemand = searchParams.get('physicalDemand')
    const indoorOutdoor = searchParams.get('indoorOutdoor')

    const where: any = {}
    if (status) where.status = status
    if (featured !== null) where.featured = featured === 'true'
    if (physicalDemand) where.physicalDemand = physicalDemand
    if (indoorOutdoor) where.indoorOutdoor = indoorOutdoor

    // Note: JSON array filtering would need custom logic
    // For now, fetch all and filter in memory if objective is specified

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: {
        programLinks: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            programLinks: true,
            orderItems: true,
          },
        },
      },
    })

    // Filter by objective if specified (client-side filtering for JSON field)
    let filteredActivities = activities
    if (objective) {
      filteredActivities = activities.filter((activity) => {
        const objectives = activity.objectives as string[] | null
        return objectives && objectives.includes(objective)
      })
    }

    return NextResponse.json({ success: true, data: filteredActivities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/activities
 * Create a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      subtitle,
      excerpt,
      description,
      minParticipants,
      maxParticipants,
      idealGroupSize,
      objectives,
      learningOutcomes,
      physicalDemand,
      indoorOutdoor,
      duration,
      materialsNeeded,
      setupTime,
      facilitatorGuide,
      difficultyLevel,
      scalable,
      canCombine,
      price,
      featuredImageUrl,
      featuredImageAlt,
      galleryImages,
      videoUrl,
      instructionPdfUrl,
      seo,
      category,
      status,
      featured,
      order,
    } = body

    // Generate slug from title
    const slug = slugify(title)

    // Check if slug already exists
    const existingActivity = await prisma.activity.findUnique({
      where: { slug },
    })

    if (existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity with this title already exists' },
        { status: 400 }
      )
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        title,
        slug,
        subtitle,
        excerpt,
        description,
        category: category || 'team-activity',
        status: status || 'active',
        featured: featured || false,
        order: order || 100,
        minParticipants,
        maxParticipants,
        idealGroupSize,
        objectives,
        learningOutcomes,
        physicalDemand,
        indoorOutdoor,
        duration,
        materialsNeeded,
        setupTime,
        facilitatorGuide,
        difficultyLevel,
        scalable: scalable !== undefined ? scalable : true,
        canCombine: canCombine !== undefined ? canCombine : true,
        price,
        featuredImageUrl,
        featuredImageAlt,
        galleryImages,
        videoUrl,
        instructionPdfUrl,
        seo,
      },
    })

    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
