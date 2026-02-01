import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get counts and stats in parallel
    const [
      activeEvents,
      totalPerformers,
      upcomingEvents,
      completedEvents,
      totalBookings,
      totalClients,
      recentEvents,
    ] = await Promise.all([
      // Active events (planning, confirmed, in_progress)
      prisma.event.count({
        where: {
          tenantId,
          status: { in: ['planning', 'confirmed', 'in_progress'] },
        },
      }),

      // Total performers
      prisma.performer.count({
        where: { tenantId },
      }),

      // Upcoming events (next 30 days)
      prisma.event.findMany({
        where: {
          tenantId,
          date: { gte: now, lte: thirtyDaysFromNow },
          status: { in: ['planning', 'confirmed'] },
        },
        orderBy: { date: 'asc' },
        take: 5,
        include: {
          venue: { select: { name: true } },
          client: { select: { name: true } },
          _count: { select: { bookings: true } },
        },
      }),

      // Completed events count
      prisma.event.count({
        where: {
          tenantId,
          status: 'completed',
        },
      }),

      // Total bookings
      prisma.booking.count({
        where: { tenantId },
      }),

      // Total clients
      prisma.client.count({
        where: { tenantId },
      }),

      // Recent events for activity
      prisma.event.findMany({
        where: { tenantId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          venue: { select: { name: true } },
          _count: { select: { bookings: true, tasks: true } },
        },
      }),
    ])

    // Calculate revenue from completed bookings
    const revenueResult = await prisma.booking.aggregate({
      where: {
        tenantId,
        status: 'completed',
      },
      _sum: {
        agreedRate: true,
      },
    })

    const revenue = revenueResult._sum.agreedRate?.toNumber() || 0

    return NextResponse.json({
      stats: {
        activeEvents,
        totalPerformers,
        upcomingEventsCount: upcomingEvents.length,
        completedEvents,
        totalBookings,
        totalClients,
        revenue,
      },
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event.id,
        name: event.name,
        date: event.date,
        type: event.type,
        status: event.status,
        venue: event.venue?.name || event.venueCustom,
        client: event.client?.name,
        performersCount: event._count.bookings,
      })),
      recentActivity: recentEvents.map((event) => ({
        id: event.id,
        name: event.name,
        type: event.type,
        status: event.status,
        updatedAt: event.updatedAt,
        venue: event.venue?.name,
        bookingsCount: event._count.bookings,
        tasksCount: event._count.tasks,
      })),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Error fetching dashboard stats' }, { status: 500 })
  }
}
