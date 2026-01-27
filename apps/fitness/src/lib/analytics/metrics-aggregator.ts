/**
 * Metrics Aggregator
 *
 * Aggregates key business metrics for analytics dashboard.
 */

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface OverviewMetrics {
  clients: {
    total: number
    active: number
    new: number
    churnedThisMonth: number
    growthRate: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    growthRate: number
    averagePerClient: number
  }
  sessions: {
    thisMonth: number
    lastMonth: number
    completionRate: number
    averagePerClient: number
  }
  packages: {
    activeSubscriptions: number
    totalCreditsIssued: number
    creditsUsed: number
    utilizationRate: number
  }
}

export interface PeriodComparison {
  current: number
  previous: number
  change: number
  changePercent: number
}

/**
 * Get overview metrics with comparison to previous period
 */
export async function getOverviewMetrics(tenantId: string): Promise<OverviewMetrics> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Client metrics
  const [totalClients, activeClients, newClientsThisMonth, newClientsLastMonth] = await Promise.all([
    prisma.client.count({
      where: { tenantId },
    }),
    prisma.client.count({
      where: {
        tenantId,
        status: 'active',
      },
    }),
    prisma.client.count({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.client.count({
      where: {
        tenantId,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
  ])

  // Churned clients (status changed to inactive this month)
  const churnedThisMonth = await prisma.client.count({
    where: {
      tenantId,
      status: 'inactive',
      updatedAt: { gte: startOfMonth },
    },
  })

  // Revenue metrics
  const [revenueThisMonth, revenueLastMonth] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: 'paid',
        paidAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: 'paid',
        paidAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { total: true },
    }),
  ])

  const thisMonthRevenue = Number(revenueThisMonth._sum.total || 0)
  const lastMonthRevenue = Number(revenueLastMonth._sum.total || 0)

  // Session metrics
  const [sessionsThisMonth, sessionsLastMonth, completedSessions, totalSessions] = await Promise.all([
    prisma.session.count({
      where: {
        tenantId,
        status: 'completed',
        scheduledAt: { gte: startOfMonth },
      },
    }),
    prisma.session.count({
      where: {
        tenantId,
        status: 'completed',
        scheduledAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    }),
    prisma.session.count({
      where: {
        tenantId,
        status: 'completed',
        scheduledAt: { gte: startOfMonth },
      },
    }),
    prisma.session.count({
      where: {
        tenantId,
        scheduledAt: { gte: startOfMonth },
        status: { not: 'cancelled' },
      },
    }),
  ])

  // Package metrics
  const [activeSubscriptions, creditStats] = await Promise.all([
    prisma.subscription.count({
      where: {
        tenantId,
        status: 'active',
      },
    }),
    prisma.client.aggregate({
      where: { tenantId },
      _sum: {
        creditsRemaining: true,
        creditsPurchased: true,
      },
    }),
  ])

  const totalCreditsIssued = creditStats._sum.creditsPurchased || 0
  const creditsRemaining = creditStats._sum.creditsRemaining || 0
  const creditsUsed = totalCreditsIssued - creditsRemaining

  return {
    clients: {
      total: totalClients,
      active: activeClients,
      new: newClientsThisMonth,
      churnedThisMonth,
      growthRate: newClientsLastMonth > 0
        ? ((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100
        : newClientsThisMonth > 0 ? 100 : 0,
    },
    revenue: {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growthRate: lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0 ? 100 : 0,
      averagePerClient: activeClients > 0 ? thisMonthRevenue / activeClients : 0,
    },
    sessions: {
      thisMonth: sessionsThisMonth,
      lastMonth: sessionsLastMonth,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      averagePerClient: activeClients > 0 ? sessionsThisMonth / activeClients : 0,
    },
    packages: {
      activeSubscriptions,
      totalCreditsIssued,
      creditsUsed,
      utilizationRate: totalCreditsIssued > 0 ? (creditsUsed / totalCreditsIssued) * 100 : 0,
    },
  }
}

/**
 * Get revenue breakdown by category
 */
export async function getRevenueBreakdown(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  sessions: number
  packages: number
  subscriptions: number
  other: number
  total: number
}> {
  // Get invoices within date range
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: 'paid',
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  })

  let sessions = 0
  let packages = 0
  let subscriptions = 0
  let other = 0

  for (const invoice of invoices) {
    if (invoice.subscriptionId) {
      subscriptions += Number(invoice.total)
    } else {
      for (const item of invoice.items) {
        const desc = (item.description || '').toLowerCase()
        if (desc.includes('session') || desc.includes('lekce') || desc.includes('trénink')) {
          sessions += Number(item.total)
        } else if (desc.includes('balíč') || desc.includes('kredit') || desc.includes('package')) {
          packages += Number(item.total)
        } else {
          other += Number(item.total)
        }
      }
    }
  }

  return {
    sessions,
    packages,
    subscriptions,
    other,
    total: sessions + packages + subscriptions + other,
  }
}

/**
 * Get daily/weekly/monthly trends
 */
export async function getTrends(
  tenantId: string,
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
): Promise<{
  labels: string[]
  revenue: number[]
  sessions: number[]
  newClients: number[]
}> {
  const labels: string[] = []
  const revenue: number[] = []
  const sessions: number[] = []
  const newClients: number[] = []

  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    let periodStart: Date
    let periodEnd: Date
    let label: string

    if (period === 'daily') {
      periodStart = new Date(currentDate)
      periodEnd = new Date(currentDate)
      periodEnd.setHours(23, 59, 59, 999)
      label = currentDate.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })
      currentDate.setDate(currentDate.getDate() + 1)
    } else if (period === 'weekly') {
      periodStart = new Date(currentDate)
      periodEnd = new Date(currentDate)
      periodEnd.setDate(periodEnd.getDate() + 6)
      periodEnd.setHours(23, 59, 59, 999)
      label = `${periodStart.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}`
      currentDate.setDate(currentDate.getDate() + 7)
    } else {
      periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      periodEnd.setHours(23, 59, 59, 999)
      label = currentDate.toLocaleDateString('cs-CZ', { month: 'short' })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Get data for this period
    const [periodRevenue, periodSessions, periodNewClients] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'paid',
          paidAt: { gte: periodStart, lte: periodEnd },
        },
        _sum: { total: true },
      }),
      prisma.session.count({
        where: {
          tenantId,
          status: 'completed',
          scheduledAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      prisma.client.count({
        where: {
          tenantId,
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      }),
    ])

    labels.push(label)
    revenue.push(Number(periodRevenue._sum.total || 0))
    sessions.push(periodSessions)
    newClients.push(periodNewClients)
  }

  return { labels, revenue, sessions, newClients }
}

/**
 * Create a daily snapshot for analytics
 */
export async function createDailySnapshot(tenantId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const metrics = await getOverviewMetrics(tenantId)

  // Check if snapshot already exists for today
  const existing = await prisma.analyticsSnapshot.findUnique({
    where: {
      tenantId_date_period: {
        tenantId,
        date: today,
        period: 'daily',
      },
    },
  })

  if (existing) {
    await prisma.analyticsSnapshot.update({
      where: { id: existing.id },
      data: { metrics: metrics as object },
    })
  } else {
    await prisma.analyticsSnapshot.create({
      data: {
        tenantId,
        date: today,
        period: 'daily',
        metrics: metrics as object,
      },
    })
  }
}
