/**
 * Event Detail API Routes
 *
 * GET    /api/admin/events/[id] - Get single event
 * PUT    /api/admin/events/[id] - Update event
 * DELETE /api/admin/events/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ data: event }, { status: 200 })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Validate required fields
    if (!data.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    if (!data.venue || !data.venue.name) {
      return NextResponse.json({ error: 'Venue name is required' }, { status: 400 })
    }

    // Validate that either performanceId or gameId is provided (or neither)
    if (data.performanceId && data.gameId) {
      return NextResponse.json(
        { error: 'Event cannot be linked to both performance and game' },
        { status: 400 }
      )
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: params.id },
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

    return NextResponse.json({ data: event }, { status: 200 })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if event exists
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Delete event
    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
