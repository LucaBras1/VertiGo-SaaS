/**
 * Cohort Analyzer
 *
 * Performs cohort analysis on client data.
 */

import { prisma } from '@/lib/prisma'

export interface CohortData {
  cohort: string
  cohortDate: Date
  totalClients: number
  retentionByMonth: number[] // Percentage retained for each month (0-12)
}

export interface CohortAnalysis {
  cohorts: CohortData[]
  averageRetention: number[]
}

/**
 * Get cohort analysis for the last N months
 */
export async function getCohortAnalysis(
  tenantId: string,
  monthsBack: number = 12
): Promise<CohortAnalysis> {
  const now = new Date()
  const cohorts: CohortData[] = []

  // Process each monthly cohort
  for (let i = monthsBack - 1; i >= 0; i--) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    cohortEnd.setHours(23, 59, 59, 999)

    // Get clients in this cohort
    const cohortClients = await prisma.client.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: cohortStart,
          lte: cohortEnd,
        },
      },
      select: { id: true },
    })

    const totalClients = cohortClients.length

    if (totalClients === 0) {
      cohorts.push({
        cohort: cohortStart.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' }),
        cohortDate: cohortStart,
        totalClients: 0,
        retentionByMonth: Array(monthsBack - i).fill(0),
      })
      continue
    }

    const clientIds = cohortClients.map((c) => c.id)
    const retentionByMonth: number[] = []

    // Calculate retention for each subsequent month
    const monthsToTrack = Math.min(12, monthsBack - i)

    for (let month = 0; month < monthsToTrack; month++) {
      const checkStart = new Date(cohortStart)
      checkStart.setMonth(checkStart.getMonth() + month)
      const checkEnd = new Date(checkStart)
      checkEnd.setMonth(checkEnd.getMonth() + 1)

      // Count clients with activity in this month
      const activeClients = await prisma.session.groupBy({
        by: ['clientId'],
        where: {
          clientId: { in: clientIds },
          status: 'completed',
          scheduledAt: {
            gte: checkStart,
            lt: checkEnd,
          },
        },
      })

      const retentionRate = (activeClients.length / totalClients) * 100
      retentionByMonth.push(Math.round(retentionRate * 10) / 10)
    }

    cohorts.push({
      cohort: cohortStart.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' }),
      cohortDate: cohortStart,
      totalClients,
      retentionByMonth,
    })
  }

  // Calculate average retention across all cohorts
  const maxMonths = Math.max(...cohorts.map((c) => c.retentionByMonth.length))
  const averageRetention: number[] = []

  for (let month = 0; month < maxMonths; month++) {
    const cohortsWithData = cohorts.filter((c) => c.retentionByMonth[month] !== undefined)
    if (cohortsWithData.length === 0) {
      averageRetention.push(0)
    } else {
      const sum = cohortsWithData.reduce((s, c) => s + c.retentionByMonth[month], 0)
      averageRetention.push(Math.round((sum / cohortsWithData.length) * 10) / 10)
    }
  }

  return {
    cohorts,
    averageRetention,
  }
}

/**
 * Get client segments by activity level
 */
export async function getClientSegments(tenantId: string): Promise<{
  active: { count: number; percentage: number }
  atRisk: { count: number; percentage: number }
  churned: { count: number; percentage: number }
  new: { count: number; percentage: number }
}> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Get all clients
  const allClients = await prisma.client.findMany({
    where: { tenantId },
    select: { id: true, createdAt: true, status: true },
  })

  const totalClients = allClients.length

  if (totalClients === 0) {
    return {
      active: { count: 0, percentage: 0 },
      atRisk: { count: 0, percentage: 0 },
      churned: { count: 0, percentage: 0 },
      new: { count: 0, percentage: 0 },
    }
  }

  // Get session activity in last 90 days
  const recentActivity = await prisma.session.groupBy({
    by: ['clientId'],
    where: {
      tenantId,
      status: 'completed',
      scheduledAt: { gte: ninetyDaysAgo },
    },
    _max: { scheduledAt: true },
  })

  const activityMap = new Map(
    recentActivity.map((a) => [a.clientId, a._max.scheduledAt])
  )

  let activeCount = 0
  let atRiskCount = 0
  let churnedCount = 0
  let newCount = 0

  for (const client of allClients) {
    const lastActivity = activityMap.get(client.id)
    const isNew = client.createdAt > thirtyDaysAgo

    if (isNew) {
      newCount++
    } else if (!lastActivity || client.status === 'inactive') {
      churnedCount++
    } else if (lastActivity > thirtyDaysAgo) {
      activeCount++
    } else if (lastActivity > sixtyDaysAgo) {
      atRiskCount++
    } else {
      churnedCount++
    }
  }

  return {
    active: {
      count: activeCount,
      percentage: Math.round((activeCount / totalClients) * 100),
    },
    atRisk: {
      count: atRiskCount,
      percentage: Math.round((atRiskCount / totalClients) * 100),
    },
    churned: {
      count: churnedCount,
      percentage: Math.round((churnedCount / totalClients) * 100),
    },
    new: {
      count: newCount,
      percentage: Math.round((newCount / totalClients) * 100),
    },
  }
}

/**
 * Get top performing clients by revenue
 */
export async function getTopClients(
  tenantId: string,
  limit: number = 10
): Promise<{
  id: string
  name: string
  email: string
  totalRevenue: number
  sessionsCompleted: number
  memberSince: Date
}[]> {
  const clients = await prisma.client.findMany({
    where: { tenantId },
    include: {
      invoices: {
        where: { status: 'paid' },
        select: { total: true },
      },
      sessions: {
        where: { status: 'completed' },
        select: { id: true },
      },
    },
  })

  const clientsWithRevenue = clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    totalRevenue: client.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
    sessionsCompleted: client.sessions.length,
    memberSince: client.createdAt,
  }))

  return clientsWithRevenue
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
}
