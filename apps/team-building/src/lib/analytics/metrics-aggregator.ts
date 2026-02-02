/**
 * Metrics Aggregator
 * Core analytics calculations for TeamForge
 */

import { prisma } from '@/lib/db'

export interface OverviewMetrics {
  customers: {
    total: number
    active: number
    new: number
    byIndustry: Record<string, number>
    byTeamSize: {
      small: number // 1-10
      medium: number // 11-50
      large: number // 51-200
      enterprise: number // 200+
    }
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growthRate: number
    averageOrderValue: number
    byProgram: Record<string, number>
  }
  sessions: {
    total: number
    completed: number
    cancelled: number
    completionRate: number
    averageTeamSize: number
    byObjective: Record<string, number>
  }
  retention: {
    repeatCustomers: number
    repeatRate: number
    avgTimeBetweenBookings: number
  }
}

/**
 * Get overview metrics for the dashboard
 */
export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)

  // Parallel data fetching
  const [
    totalCustomers,
    newCustomers,
    allCustomers,
    totalSessions,
    completedSessions,
    cancelledSessions,
    allSessions,
    thisMonthInvoices,
    lastMonthInvoices,
    allPaidInvoices,
    ordersWithPrograms,
    customersWithMultipleOrders,
  ] = await Promise.all([
    // Customer counts
    prisma.customer.count(),
    prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        industryType: true,
        teamSize: true,
        orders: {
          select: { id: true },
          where: { createdAt: { gte: twelveMonthsAgo } },
        },
      },
    }),
    // Session counts
    prisma.session.count(),
    prisma.session.count({ where: { status: 'completed' } }),
    prisma.session.count({ where: { status: 'cancelled' } }),
    prisma.session.findMany({
      select: {
        id: true,
        teamSize: true,
        objectives: true,
        status: true,
      },
    }),
    // Revenue - this month
    prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidDate: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Revenue - last month
    prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Total revenue
    prisma.invoice.aggregate({
      where: { status: 'paid' },
      _sum: { totalAmount: true },
    }),
    // Orders with programs for revenue breakdown
    prisma.order.findMany({
      select: {
        items: {
          select: {
            price: true,
            program: { select: { title: true } },
          },
        },
      },
      where: {
        status: { in: ['confirmed', 'completed'] },
      },
    }),
    // Repeat customers
    prisma.customer.findMany({
      select: {
        id: true,
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      where: {
        orders: {
          some: {},
        },
      },
    }),
  ])

  // Calculate active customers (ordered in last 12 months)
  const activeCustomers = allCustomers.filter((c) => c.orders.length > 0).length

  // Industry breakdown
  const byIndustry: Record<string, number> = {}
  allCustomers.forEach((c) => {
    if (c.industryType) {
      byIndustry[c.industryType] = (byIndustry[c.industryType] || 0) + 1
    }
  })

  // Team size breakdown
  const byTeamSize = { small: 0, medium: 0, large: 0, enterprise: 0 }
  allCustomers.forEach((c) => {
    if (c.teamSize) {
      if (c.teamSize <= 10) byTeamSize.small++
      else if (c.teamSize <= 50) byTeamSize.medium++
      else if (c.teamSize <= 200) byTeamSize.large++
      else byTeamSize.enterprise++
    }
  })

  // Revenue calculations
  const thisMonthRevenue = thisMonthInvoices._sum.totalAmount || 0
  const lastMonthRevenue = lastMonthInvoices._sum.totalAmount || 0
  const totalRevenue = allPaidInvoices._sum.totalAmount || 0
  const revenueGrowthRate =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0
        ? 100
        : 0

  // Average order value
  const totalOrders = ordersWithPrograms.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Revenue by program
  const byProgram: Record<string, number> = {}
  ordersWithPrograms.forEach((order) => {
    order.items.forEach((item) => {
      if (item.program?.title) {
        byProgram[item.program.title] = (byProgram[item.program.title] || 0) + item.price
      }
    })
  })

  // Session metrics
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
  const sessionsWithTeamSize = allSessions.filter((s) => s.teamSize)
  const avgTeamSize =
    sessionsWithTeamSize.length > 0
      ? sessionsWithTeamSize.reduce((sum, s) => sum + (s.teamSize || 0), 0) / sessionsWithTeamSize.length
      : 0

  // Objectives breakdown
  const byObjective: Record<string, number> = {}
  allSessions.forEach((s) => {
    if (s.objectives && Array.isArray(s.objectives)) {
      ;(s.objectives as string[]).forEach((obj) => {
        byObjective[obj] = (byObjective[obj] || 0) + 1
      })
    }
  })

  // Retention calculations
  const repeatCustomers = customersWithMultipleOrders.filter((c) => c.orders.length > 1)
  const repeatRate =
    customersWithMultipleOrders.length > 0
      ? (repeatCustomers.length / customersWithMultipleOrders.length) * 100
      : 0

  // Average time between bookings (in days)
  let totalDaysBetween = 0
  let bookingIntervals = 0
  repeatCustomers.forEach((c) => {
    for (let i = 1; i < c.orders.length; i++) {
      const diff = c.orders[i].createdAt.getTime() - c.orders[i - 1].createdAt.getTime()
      totalDaysBetween += diff / (1000 * 60 * 60 * 24)
      bookingIntervals++
    }
  })
  const avgTimeBetweenBookings = bookingIntervals > 0 ? totalDaysBetween / bookingIntervals : 0

  return {
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      new: newCustomers,
      byIndustry,
      byTeamSize,
    },
    revenue: {
      total: totalRevenue,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growthRate: revenueGrowthRate,
      averageOrderValue: avgOrderValue,
      byProgram,
    },
    sessions: {
      total: totalSessions,
      completed: completedSessions,
      cancelled: cancelledSessions,
      completionRate,
      averageTeamSize: avgTeamSize,
      byObjective,
    },
    retention: {
      repeatCustomers: repeatCustomers.length,
      repeatRate,
      avgTimeBetweenBookings,
    },
  }
}

/**
 * Get trend data for charts
 */
export interface TrendData {
  labels: string[]
  revenue: number[]
  sessions: number[]
  newCustomers: number[]
}

export async function getTrends(
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  months: number = 12
): Promise<TrendData> {
  const now = new Date()
  const labels: string[] = []
  const revenue: number[] = []
  const sessions: number[] = []
  const newCustomers: number[] = []

  for (let i = months - 1; i >= 0; i--) {
    const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const label = periodStart.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
    labels.push(label)

    const [periodRevenue, periodSessions, periodCustomers] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          status: 'paid',
          paidDate: { gte: periodStart, lte: periodEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.session.count({
        where: {
          date: { gte: periodStart, lte: periodEnd },
          status: { in: ['confirmed', 'completed'] },
        },
      }),
      prisma.customer.count({
        where: { createdAt: { gte: periodStart, lte: periodEnd } },
      }),
    ])

    revenue.push(periodRevenue._sum.totalAmount || 0)
    sessions.push(periodSessions)
    newCustomers.push(periodCustomers)
  }

  return { labels, revenue, sessions, newCustomers }
}
