/**
 * Events API Routes
 *
 * GET  /api/admin/events - List all events
 * POST /api/admin/events - Create new event
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/events - List all events with relations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 25
    const skip = (page - 1) * pageSize

    // Filter params
    const statusFilter = searchParams.getAll('status')
    const visibilityFilter = searchParams.getAll('visibility')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build where clause
    const where: any = {}

    if (statusFilter.length > 0) {
      where.status = { in: statusFilter }
    }

    if (visibilityFilter.length > 0) {
      if (visibilityFilter.includes('public')) {
        where.isPublic = true
      } else if (visibilityFilter.includes('private')) {
        where.isPublic = false
      }
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo)
      }
    }

    // Get total count for pagination
    const totalItems = await prisma.event.count({ where })

    // Get paginated data
    const events = await prisma.event.findMany({
      where,
      include: {
        performance: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }],
      skip,
      take: pageSize,
    })

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      events,
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
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    if (!data.venue || !data.venue.name) {
      return NextResponse.json({ error: 'Venue name is required' }, { status: 400 })
    }

    // Validate that either performanceId or gameId is provided (or neither for custom events)
    if (data.performanceId && data.gameId) {
      return NextResponse.json(
        { error: 'Event cannot be linked to both performance and game' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        performanceId: data.performanceId || null,
        gameId: data.gameId || null,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        venue: data.venue,
        status: data.status || 'confirmed',
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        ticketUrl: data.ticketUrl || null,
        notes: data.notes || null,
      },
      include: {
        performance: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
