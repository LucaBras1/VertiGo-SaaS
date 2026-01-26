import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'

// GET /api/dashboard/stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()

    // Date ranges
    const thisMonthStart = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })

    // Parallel queries for performance
    const [
      activeClientsCount,
      lastMonthClientsCount,
      thisWeekSessions,
      lastWeekSessions,
      thisMonthRevenue,
      lastMonthRevenue,
      clientsWithProgress,
    ] = await Promise.all([
      // Active clients this month
      prisma.client.count({
        where: {
          tenantId,
          status: 'active',
        },
      }),

      // Clients count last month (for comparison)
      prisma.client.count({
        where: {
          tenantId,
          status: 'active',
          createdAt: { lt: thisMonthStart },
        },
      }),

      // Sessions this week
      prisma.session.count({
        where: {
          tenantId,
          scheduledAt: {
            gte: thisWeekStart,
            lte: thisWeekEnd,
          },
        },
      }),

      // Sessions last week
      prisma.session.count({
        where: {
          tenantId,
          scheduledAt: {
            gte: lastWeekStart,
            lte: lastWeekEnd,
          },
        },
      }),

      // Revenue this month (from completed sessions)
      prisma.session.aggregate({
        where: {
          tenantId,
          status: 'completed',
          scheduledAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
        _sum: {
          price: true,
        },
      }),

      // Revenue last month
      prisma.session.aggregate({
        where: {
          tenantId,
          status: 'completed',
          scheduledAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
        _sum: {
          price: true,
        },
      }),

      // Clients with goal progress (those who have target weight set and current weight)
      prisma.client.findMany({
        where: {
          tenantId,
          status: 'active',
          targetWeight: { not: null },
          currentWeight: { not: null },
        },
        select: {
          currentWeight: true,
          targetWeight: true,
        },
      }),
    ])

    // Calculate percentage changes
    const clientsChange = lastMonthClientsCount > 0
      ? Math.round(((activeClientsCount - lastMonthClientsCount) / lastMonthClientsCount) * 100)
      : activeClientsCount > 0 ? 100 : 0

    const sessionsChange = lastWeekSessions > 0
      ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100)
      : thisWeekSessions > 0 ? 100 : 0

    const thisMonthRevenueValue = thisMonthRevenue._sum.price || 0
    const lastMonthRevenueValue = lastMonthRevenue._sum.price || 0
    const revenueChange = lastMonthRevenueValue > 0
      ? Math.round(((thisMonthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100)
      : thisMonthRevenueValue > 0 ? 100 : 0

    // Calculate average progress toward goals
    let avgProgress = 0
    if (clientsWithProgress.length > 0) {
      const progressValues = clientsWithProgress.map((client) => {
        const current = client.currentWeight || 0
        const target = client.targetWeight || current
        if (current === target) return 100

        // Assuming weight loss goal if target < current
        if (target < current) {
          const totalToLose = current - target
          const startingWeight = current * 1.1 // Assume started 10% higher
          const lost = startingWeight - current
          return Math.min(100, Math.round((lost / totalToLose) * 100))
        }

        // Weight gain goal
        const totalToGain = target - current
        const startingWeight = current * 0.9 // Assume started 10% lower
        const gained = current - startingWeight
        return Math.min(100, Math.round((gained / totalToGain) * 100))
      })

      avgProgress = Math.round(
        progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      )
    }

    // Format revenue
    const formattedRevenue = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).format(thisMonthRevenueValue)

    return NextResponse.json({
      stats: {
        activeClients: {
          value: activeClientsCount,
          change: clientsChange,
          trend: clientsChange >= 0 ? 'up' : 'down',
        },
        weekSessions: {
          value: thisWeekSessions,
          change: sessionsChange,
          trend: sessionsChange >= 0 ? 'up' : 'down',
        },
        monthlyRevenue: {
          value: thisMonthRevenueValue,
          formatted: formattedRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down',
        },
        avgProgress: {
          value: avgProgress,
          change: 5, // Placeholder - would need historical data to calculate
          trend: 'up',
        },
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání statistik' },
      { status: 500 }
    )
  }
}
