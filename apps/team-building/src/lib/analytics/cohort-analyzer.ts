/**
 * Cohort Analyzer
 * Cohort analysis for TeamForge customers
 */

import { prisma } from '@/lib/db'

export interface CohortData {
  cohortLabel: string
  cohortSize: number
  retentionByMonth: number[] // Array of retention percentages for each month
}

export interface CohortAnalysis {
  cohorts: CohortData[]
  months: string[] // Column headers (Month 0, Month 1, etc.)
}

/**
 * Get cohort retention analysis
 * Groups customers by signup month and tracks their retention over time
 */
export async function getCohortAnalysis(monthsBack: number = 12): Promise<CohortAnalysis> {
  const now = new Date()
  const cohorts: CohortData[] = []
  const months: string[] = []

  // Generate month headers
  for (let i = 0; i <= monthsBack; i++) {
    months.push(`M${i}`)
  }

  // Process each monthly cohort
  for (let i = monthsBack - 1; i >= 0; i--) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const cohortLabel = cohortStart.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })

    // Get customers who joined in this cohort month
    const cohortCustomers = await prisma.customer.findMany({
      where: {
        createdAt: { gte: cohortStart, lte: cohortEnd },
      },
      select: {
        id: true,
        orders: {
          select: { createdAt: true },
        },
      },
    })

    const cohortSize = cohortCustomers.length
    if (cohortSize === 0) {
      cohorts.push({
        cohortLabel,
        cohortSize: 0,
        retentionByMonth: [],
      })
      continue
    }

    const customerIds = cohortCustomers.map((c) => c.id)
    const retentionByMonth: number[] = []

    // Track retention for each subsequent month
    const monthsToTrack = Math.min(i + 1, monthsBack)
    for (let month = 0; month < monthsToTrack; month++) {
      const checkStart = new Date(cohortStart)
      checkStart.setMonth(checkStart.getMonth() + month)
      const checkEnd = new Date(checkStart)
      checkEnd.setMonth(checkEnd.getMonth() + 1)
      checkEnd.setDate(0)
      checkEnd.setHours(23, 59, 59)

      // Count customers with orders in this month
      const activeInMonth = await prisma.order.groupBy({
        by: ['customerId'],
        where: {
          customerId: { in: customerIds },
          createdAt: { gte: checkStart, lte: checkEnd },
        },
      })

      const retentionRate = (activeInMonth.length / cohortSize) * 100
      retentionByMonth.push(Math.round(retentionRate * 10) / 10)
    }

    cohorts.push({
      cohortLabel,
      cohortSize,
      retentionByMonth,
    })
  }

  return { cohorts, months }
}

/**
 * Get industry-based cohort analysis
 */
export interface IndustryCohort {
  industry: string
  customerCount: number
  averageOrderValue: number
  repeatRate: number
  avgTeamSize: number
}

export async function getIndustryCohorts(): Promise<IndustryCohort[]> {
  const industries = [
    'TECHNOLOGY',
    'FINANCE',
    'HEALTHCARE',
    'EDUCATION',
    'MANUFACTURING',
    'RETAIL',
    'HOSPITALITY',
    'CONSULTING',
    'GOVERNMENT',
    'NONPROFIT',
    'OTHER',
  ]

  const results: IndustryCohort[] = []

  for (const industry of industries) {
    const customers = await prisma.customer.findMany({
      where: { industryType: industry },
      select: {
        id: true,
        teamSize: true,
        orders: {
          select: {
            id: true,
            pricing: true,
          },
        },
      },
    })

    if (customers.length === 0) continue

    const customerCount = customers.length
    const customersWithMultipleOrders = customers.filter((c) => c.orders.length > 1).length
    const repeatRate = (customersWithMultipleOrders / customerCount) * 100

    // Calculate average order value
    let totalOrderValue = 0
    let orderCount = 0
    customers.forEach((c) => {
      c.orders.forEach((order) => {
        const pricing = order.pricing as { total?: number } | null
        if (pricing?.total) {
          totalOrderValue += pricing.total
          orderCount++
        }
      })
    })
    const averageOrderValue = orderCount > 0 ? totalOrderValue / orderCount : 0

    // Calculate average team size
    const customersWithTeamSize = customers.filter((c) => c.teamSize)
    const avgTeamSize =
      customersWithTeamSize.length > 0
        ? customersWithTeamSize.reduce((sum, c) => sum + (c.teamSize || 0), 0) / customersWithTeamSize.length
        : 0

    results.push({
      industry,
      customerCount,
      averageOrderValue,
      repeatRate,
      avgTeamSize,
    })
  }

  return results.sort((a, b) => b.customerCount - a.customerCount)
}

/**
 * Get team size cohort analysis
 */
export interface TeamSizeCohort {
  segment: string
  range: string
  customerCount: number
  averageOrderValue: number
  repeatRate: number
  popularObjectives: string[]
}

export async function getTeamSizeCohorts(): Promise<TeamSizeCohort[]> {
  const segments = [
    { name: 'small', label: 'Malé týmy', min: 1, max: 10 },
    { name: 'medium', label: 'Střední týmy', min: 11, max: 50 },
    { name: 'large', label: 'Velké týmy', min: 51, max: 200 },
    { name: 'enterprise', label: 'Enterprise', min: 201, max: 100000 },
  ]

  const results: TeamSizeCohort[] = []

  for (const segment of segments) {
    const customers = await prisma.customer.findMany({
      where: {
        teamSize: { gte: segment.min, lte: segment.max },
      },
      select: {
        id: true,
        orders: {
          select: {
            id: true,
            pricing: true,
            objectives: true,
          },
        },
      },
    })

    if (customers.length === 0) continue

    const customerCount = customers.length
    const customersWithMultipleOrders = customers.filter((c) => c.orders.length > 1).length
    const repeatRate = (customersWithMultipleOrders / customerCount) * 100

    // Calculate average order value
    let totalOrderValue = 0
    let orderCount = 0
    const objectiveCounts: Record<string, number> = {}

    customers.forEach((c) => {
      c.orders.forEach((order) => {
        const pricing = order.pricing as { total?: number } | null
        if (pricing?.total) {
          totalOrderValue += pricing.total
          orderCount++
        }
        const objectives = order.objectives as string[] | null
        if (objectives) {
          objectives.forEach((obj) => {
            objectiveCounts[obj] = (objectiveCounts[obj] || 0) + 1
          })
        }
      })
    })

    const averageOrderValue = orderCount > 0 ? totalOrderValue / orderCount : 0

    // Get top 3 objectives
    const sortedObjectives = Object.entries(objectiveCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([obj]) => obj)

    results.push({
      segment: segment.name,
      range: `${segment.min}-${segment.max === 100000 ? '∞' : segment.max}`,
      customerCount,
      averageOrderValue,
      repeatRate,
      popularObjectives: sortedObjectives,
    })
  }

  return results
}
