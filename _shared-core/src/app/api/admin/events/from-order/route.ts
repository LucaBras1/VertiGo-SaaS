/**
 * API Endpoint: Create Events from Order
 * POST /api/admin/events/from-order
 * Creates calendar events from confirmed order items
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, itemIds } = body

    if (!orderId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'Order ID and item IDs are required' },
        { status: 400 }
      )
    }

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: {
            id: { in: itemIds },
          },
          include: {
            performance: true,
            game: true,
            service: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Parse venue from JSON
    const venue = order.venue as any

    // Create events for selected items
    const eventsCreated = []

    for (const item of order.items) {
      // Only create events for performances and games (not services)
      if (!item.performanceId && !item.gameId) {
        continue
      }

      // Check if event already exists for this item
      // Note: Can't filter by JSON field venue in SQLite, so we filter by date and performance/game
      const existingEvent = await prisma.event.findFirst({
        where: {
          OR: [
            { performanceId: item.performanceId },
            { gameId: item.gameId },
          ],
          date: new Date(item.date),
        },
      })

      if (existingEvent) {
        // Event already exists, skip
        continue
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          performanceId: item.performanceId || null,
          gameId: item.gameId || null,
          date: new Date(item.date),
          venue: {
            name: venue.name,
            city: venue.city,
            address: venue.street,
          },
          status: 'confirmed',
          isPublic: false, // Private by default as requested
        },
      })

      eventsCreated.push(event)
    }

    // Update order with first event ID if created
    if (eventsCreated.length > 0 && !order.linkedEventId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { linkedEventId: eventsCreated[0].id },
      })
    }

    return NextResponse.json({
      success: true,
      eventsCreated: eventsCreated.length,
      events: eventsCreated,
      message: `Vytvořeno ${eventsCreated.length} událostí`,
    })
  } catch (error) {
    console.error('Error creating events from order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
