/**
 * Retention Calculator
 * Customer retention and churn analysis for TeamForge
 */

import { prisma } from '@/lib/db'

export interface RetentionData {
  period: string
  totalCustomers: number
  retainedCustomers: number
  retentionRate: number
}

export interface ChurnData {
  thisMonth: number
  lastMonth: number
  trend: number // positive = improvement, negative = worsening
  atRiskCustomers: number
}

export interface CustomerLTV {
  averageLTV: number
  medianLTV: number
  topCustomers: Array<{
    id: string
    name: string
    organization: string | null
    ltv: number
    orderCount: number
  }>
}

/**
 * Calculate retention for different time periods
 */
export async function getRetentionAnalysis(): Promise<RetentionData[]> {
  const now = new Date()
  const periods = [
    { label: '3 měsíce', months: 3 },
    { label: '6 měsíců', months: 6 },
    { label: '12 měsíců', months: 12 },
  ]

  const results: RetentionData[] = []

  for (const period of periods) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - period.months * 2, 1)
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - period.months, 0, 23, 59, 59)
    const retentionCheckStart = new Date(now.getFullYear(), now.getMonth() - period.months, 1)

    // Get customers who joined in the cohort period
    const cohortCustomers = await prisma.customer.findMany({
      where: {
        createdAt: { gte: cohortStart, lte: cohortEnd },
        orders: { some: {} }, // Had at least one order
      },
      select: {
        id: true,
        orders: {
          where: { createdAt: { gte: retentionCheckStart } },
          select: { id: true },
        },
      },
    })

    const totalCustomers = cohortCustomers.length
    const retainedCustomers = cohortCustomers.filter((c) => c.orders.length > 0).length
    const retentionRate = totalCustomers > 0 ? (retainedCustomers / totalCustomers) * 100 : 0

    results.push({
      period: period.label,
      totalCustomers,
      retainedCustomers,
      retentionRate,
    })
  }

  return results
}

/**
 * Calculate churn metrics
 */
export async function getChurnData(): Promise<ChurnData> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Get all customers with their last order date
  const customersWithOrders = await prisma.customer.findMany({
    where: {
      orders: { some: {} },
    },
    select: {
      id: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  })

  // Customers who were active last month but not this month
  const churnedThisMonth = customersWithOrders.filter((c) => {
    const lastOrderDate = c.orders[0]?.createdAt
    if (!lastOrderDate) return false
    return lastOrderDate >= startOfLastMonth && lastOrderDate < startOfMonth
  }).length

  // Customers who were active 2 months ago but not last month
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const churnedLastMonth = customersWithOrders.filter((c) => {
    const lastOrderDate = c.orders[0]?.createdAt
    if (!lastOrderDate) return false
    return lastOrderDate >= twoMonthsAgo && lastOrderDate < startOfLastMonth
  }).length

  // At-risk customers: last order 60-90 days ago
  const atRiskCustomers = customersWithOrders.filter((c) => {
    const lastOrderDate = c.orders[0]?.createdAt
    if (!lastOrderDate) return false
    return lastOrderDate <= sixtyDaysAgo && lastOrderDate > ninetyDaysAgo
  }).length

  const trend = churnedLastMonth > 0 ? ((churnedLastMonth - churnedThisMonth) / churnedLastMonth) * 100 : 0

  return {
    thisMonth: churnedThisMonth,
    lastMonth: churnedLastMonth,
    trend,
    atRiskCustomers,
  }
}

/**
 * Calculate Customer Lifetime Value
 */
export async function calculateLTV(): Promise<CustomerLTV> {
  const customersWithRevenue = await prisma.customer.findMany({
    where: {
      invoices: {
        some: { status: 'paid' },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      organization: true,
      invoices: {
        where: { status: 'paid' },
        select: { totalAmount: true },
      },
      orders: {
        select: { id: true },
      },
    },
  })

  const ltvs = customersWithRevenue.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    organization: c.organization,
    ltv: c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    orderCount: c.orders.length,
  }))

  const sortedLtvs = [...ltvs].sort((a, b) => b.ltv - a.ltv)
  const averageLTV = ltvs.length > 0 ? ltvs.reduce((sum, c) => sum + c.ltv, 0) / ltvs.length : 0

  // Calculate median
  let medianLTV = 0
  if (sortedLtvs.length > 0) {
    const mid = Math.floor(sortedLtvs.length / 2)
    medianLTV = sortedLtvs.length % 2 !== 0 ? sortedLtvs[mid].ltv : (sortedLtvs[mid - 1].ltv + sortedLtvs[mid].ltv) / 2
  }

  return {
    averageLTV,
    medianLTV,
    topCustomers: sortedLtvs.slice(0, 10),
  }
}

/**
 * Get customer segments based on activity
 */
export interface CustomerSegments {
  active: { count: number; percentage: number }
  atRisk: { count: number; percentage: number }
  churned: { count: number; percentage: number }
  new: { count: number; percentage: number }
}

export async function getCustomerSegments(): Promise<CustomerSegments> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const allCustomers = await prisma.customer.findMany({
    select: {
      id: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  })

  let activeCount = 0
  let atRiskCount = 0
  let churnedCount = 0
  let newCount = 0

  allCustomers.forEach((customer) => {
    const lastOrder = customer.orders[0]?.createdAt
    const isNew = customer.createdAt > thirtyDaysAgo

    if (isNew) {
      newCount++
    } else if (!lastOrder) {
      churnedCount++ // Never ordered
    } else if (lastOrder > thirtyDaysAgo) {
      activeCount++
    } else if (lastOrder > sixtyDaysAgo) {
      atRiskCount++
    } else {
      churnedCount++
    }
  })

  const total = allCustomers.length

  return {
    active: { count: activeCount, percentage: total > 0 ? (activeCount / total) * 100 : 0 },
    atRisk: { count: atRiskCount, percentage: total > 0 ? (atRiskCount / total) * 100 : 0 },
    churned: { count: churnedCount, percentage: total > 0 ? (churnedCount / total) * 100 : 0 },
    new: { count: newCount, percentage: total > 0 ? (newCount / total) * 100 : 0 },
  }
}
