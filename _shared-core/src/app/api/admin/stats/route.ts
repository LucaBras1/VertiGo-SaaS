// API Route: /api/admin/stats
// Dashboard statistics using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get customer statistics from Prisma
 */
async function getCustomerStats(): Promise<{
  total: number
  byType: Record<string, number>
  recentCount: number
}> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [total, byType, recentCount] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.groupBy({
      by: ['organizationType'],
      _count: { organizationType: true },
    }),
    prisma.customer.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  // Convert groupBy result to record format
  const byTypeRecord: Record<string, number> = {
    elementary_school: 0,
    kindergarten: 0,
    high_school: 0,
    cultural_center: 0,
    municipality: 0,
    private_company: 0,
    nonprofit: 0,
    other: 0,
  }

  byType.forEach((item) => {
    if (item.organizationType) {
      byTypeRecord[item.organizationType] = item._count.organizationType
    }
  })

  return {
    total,
    byType: byTypeRecord,
    recentCount,
  }
}

/**
 * Get order statistics from Prisma
 */
async function getOrderStats(options?: { dateFrom?: string; dateTo?: string }) {
  const { dateFrom, dateTo } = options || {}

  const dateFilter: any = {}
  if (dateFrom) {
    dateFilter.gte = new Date(dateFrom)
  }
  if (dateTo) {
    dateFilter.lte = new Date(dateTo)
  }

  const whereClause: any = {}
  if (dateFrom || dateTo) {
    whereClause.createdAt = dateFilter
  }

  const [total, byStatus, revenueOrders] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
      where: whereClause,
    }),
    // Get orders with pricing to calculate revenue manually (pricing is JSON)
    prisma.order.findMany({
      where: {
        ...whereClause,
        status: { in: ['approved', 'completed'] },
      },
      select: { pricing: true },
    }),
  ])

  const statusCounts: Record<string, number> = {
    new: 0,
    reviewing: 0,
    awaiting_info: 0,
    quote_sent: 0,
    confirmed: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
  }

  byStatus.forEach(item => {
    statusCounts[item.status] = item._count.status
  })

  // Calculate revenue from JSON pricing field
  let totalRevenue = 0
  revenueOrders.forEach(order => {
    const pricing = order.pricing as any
    if (pricing?.totalPrice) {
      totalRevenue += pricing.totalPrice
    }
  })
  const avgOrderValue = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0

  return {
    total,
    byStatus: statusCounts,
    totalRevenue,
    avgOrderValue,
  }
}

/**
 * Get invoice statistics from Prisma
 */
async function getInvoiceStats(options?: { dateFrom?: string; dateTo?: string }) {
  const { dateFrom, dateTo } = options || {}

  const dateFilter: any = {}
  if (dateFrom) {
    dateFilter.gte = new Date(dateFrom)
  }
  if (dateTo) {
    dateFilter.lte = new Date(dateTo)
  }

  const whereClause: any = {}
  if (dateFrom || dateTo) {
    whereClause.issueDate = dateFilter
  }

  const [total, byStatus, allInvoices] = await Promise.all([
    prisma.invoice.count({ where: whereClause }),
    prisma.invoice.groupBy({
      by: ['status'],
      _count: { status: true },
      where: whereClause,
    }),
    prisma.invoice.findMany({
      where: whereClause,
      select: {
        status: true,
        totalAmount: true,
      },
    }),
  ])

  // Build status counts
  const statusCounts: Record<string, number> = {
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  }

  byStatus.forEach(item => {
    statusCounts[item.status] = item._count.status
  })

  // Calculate totals from invoices
  let totalAmount = 0
  let paidAmount = 0
  let unpaidAmount = 0

  allInvoices.forEach(invoice => {
    totalAmount += invoice.totalAmount || 0
    if (invoice.status === 'paid') {
      paidAmount += invoice.totalAmount || 0
    } else if (invoice.status !== 'cancelled' && invoice.status !== 'draft') {
      unpaidAmount += invoice.totalAmount || 0
    }
  })

  return {
    total,
    byStatus: statusCounts,
    totalAmount,
    paidAmount,
    unpaidAmount,
  }
}

/**
 * Get upcoming events from Prisma (optimized)
 * Note: dates is a JSON field, so we fetch and filter in JS
 */
async function getUpcomingEvents(limit = 5) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Optimized: only select needed fields
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['approved', 'confirmed'] },
    },
    select: {
      id: true,
      orderNumber: true,
      eventName: true,
      dates: true,
      venue: true,
      items: {
        select: {
          performance: {
            select: { id: true, title: true },
          },
        },
        take: 1, // Only need first item for display
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3, // Fetch more to filter (some may be past)
  })

  // Filter and sort by first date (dates is JSON array)
  return orders
    .filter(order => {
      const dates = order.dates as string[] | null
      if (!dates || dates.length === 0) return false
      const firstDate = new Date(dates[0])
      return firstDate >= today
    })
    .sort((a, b) => {
      const datesA = a.dates as string[]
      const datesB = b.dates as string[]
      return new Date(datesA[0]).getTime() - new Date(datesB[0]).getTime()
    })
    .slice(0, limit)
}

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 * Query params: dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    // Fetch all stats in parallel
    const [orderStats, customerStats, invoiceStats, upcomingEvents] = await Promise.all([
      getOrderStats({ dateFrom, dateTo }),
      getCustomerStats(),
      getInvoiceStats({ dateFrom, dateTo }),
      getUpcomingEvents(5),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders: orderStats,
        customers: customerStats,
        invoices: invoiceStats,
        upcomingEvents,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
      { status: 500 }
    )
  }
}
