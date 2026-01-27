/**
 * Retention Calculator
 *
 * Calculates client retention rates over different time periods.
 */

import { prisma } from '@/lib/prisma'

export interface RetentionData {
  period: string
  totalClients: number
  retainedClients: number
  retentionRate: number
}

export interface RetentionAnalysis {
  oneMonth: RetentionData
  threeMonths: RetentionData
  sixMonths: RetentionData
  oneYear: RetentionData
  byMonth: RetentionData[]
}

/**
 * Calculate retention rate for a specific period
 */
async function calculateRetention(
  tenantId: string,
  startDate: Date,
  endDate: Date,
  retentionPeriodMonths: number
): Promise<RetentionData> {
  // Get clients who joined during the period
  const clientsJoined = await prisma.client.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
  })

  if (clientsJoined.length === 0) {
    return {
      period: `${retentionPeriodMonths}m`,
      totalClients: 0,
      retainedClients: 0,
      retentionRate: 0,
    }
  }

  // Check how many have activity after the retention period
  let retainedCount = 0

  for (const client of clientsJoined) {
    const retentionCheckDate = new Date(client.createdAt)
    retentionCheckDate.setMonth(retentionCheckDate.getMonth() + retentionPeriodMonths)

    // Client is retained if they have a session after the retention check date
    const hasRecentSession = await prisma.session.findFirst({
      where: {
        clientId: client.id,
        status: 'completed',
        scheduledAt: { gte: retentionCheckDate },
      },
    })

    if (hasRecentSession) {
      retainedCount++
    }
  }

  return {
    period: `${retentionPeriodMonths}m`,
    totalClients: clientsJoined.length,
    retainedClients: retainedCount,
    retentionRate: (retainedCount / clientsJoined.length) * 100,
  }
}

/**
 * Get full retention analysis
 */
export async function getRetentionAnalysis(tenantId: string): Promise<RetentionAnalysis> {
  const now = new Date()

  // For retention analysis, we look at clients who joined at least X months ago
  const thirteenMonthsAgo = new Date(now)
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13)

  const sevenMonthsAgo = new Date(now)
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7)

  const fourMonthsAgo = new Date(now)
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

  const twoMonthsAgo = new Date(now)
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  // Calculate retention for different periods
  const [oneMonth, threeMonths, sixMonths, oneYear] = await Promise.all([
    calculateRetention(tenantId, thirteenMonthsAgo, twoMonthsAgo, 1),
    calculateRetention(tenantId, thirteenMonthsAgo, fourMonthsAgo, 3),
    calculateRetention(tenantId, thirteenMonthsAgo, sevenMonthsAgo, 6),
    calculateRetention(tenantId, thirteenMonthsAgo, thirteenMonthsAgo, 12),
  ])

  // Calculate monthly retention for the last 6 months
  const byMonth: RetentionData[] = []

  for (let i = 6; i >= 1; i--) {
    const monthStart = new Date(now)
    monthStart.setMonth(monthStart.getMonth() - i - 1)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthEnd = new Date(monthStart)
    monthEnd.setMonth(monthEnd.getMonth() + 1)

    const retention = await calculateRetention(tenantId, monthStart, monthEnd, 1)
    retention.period = monthStart.toLocaleDateString('cs-CZ', { month: 'short' })
    byMonth.push(retention)
  }

  return {
    oneMonth,
    threeMonths,
    sixMonths,
    oneYear,
    byMonth,
  }
}

/**
 * Calculate monthly churn rate
 */
export async function getChurnRate(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalAtStart: number
  totalAtEnd: number
  churned: number
  churnRate: number
}> {
  // Clients at start of period
  const clientsAtStart = await prisma.client.count({
    where: {
      tenantId,
      createdAt: { lt: startDate },
      status: 'active',
    },
  })

  // Clients at end of period
  const clientsAtEnd = await prisma.client.count({
    where: {
      tenantId,
      createdAt: { lt: endDate },
      status: 'active',
    },
  })

  // Clients who churned during the period
  const churned = await prisma.client.count({
    where: {
      tenantId,
      status: 'inactive',
      updatedAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  })

  return {
    totalAtStart: clientsAtStart,
    totalAtEnd: clientsAtEnd,
    churned,
    churnRate: clientsAtStart > 0 ? (churned / clientsAtStart) * 100 : 0,
  }
}

/**
 * Calculate client lifetime value (LTV)
 */
export async function calculateLTV(tenantId: string): Promise<{
  averageLTV: number
  medianLTV: number
  highestLTV: number
  lowestLTV: number
}> {
  // Get all clients with their total spending
  const clients = await prisma.client.findMany({
    where: { tenantId },
    include: {
      invoices: {
        where: { status: 'paid' },
        select: { total: true },
      },
    },
  })

  if (clients.length === 0) {
    return {
      averageLTV: 0,
      medianLTV: 0,
      highestLTV: 0,
      lowestLTV: 0,
    }
  }

  const ltvValues = clients.map((client) =>
    client.invoices.reduce((sum, inv) => sum + Number(inv.total), 0)
  )

  const sortedLTV = [...ltvValues].sort((a, b) => a - b)
  const totalLTV = ltvValues.reduce((sum, ltv) => sum + ltv, 0)

  return {
    averageLTV: totalLTV / clients.length,
    medianLTV: sortedLTV[Math.floor(sortedLTV.length / 2)] || 0,
    highestLTV: sortedLTV[sortedLTV.length - 1] || 0,
    lowestLTV: sortedLTV[0] || 0,
  }
}
