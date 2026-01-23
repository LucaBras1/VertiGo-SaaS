/**
 * Dashboard API Routes
 *
 * GET /api/admin/invoicing/dashboard - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardStats, RevenueChartData, TurnoverData, AgingData } from '@/types/invoicing'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'stats'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    switch (type) {
      case 'stats':
        return NextResponse.json(await getStats())

      case 'revenue':
        return NextResponse.json(await getRevenueData(year))

      case 'turnover':
        return NextResponse.json(await getTurnoverData(year))

      case 'aging':
        return NextResponse.json(await getAgingData())

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Failed to get dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard data' },
      { status: 500 }
    )
  }
}

/**
 * Get overall statistics
 */
async function getStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Total invoiced this year
  const invoicedResult = await prisma.invoice.aggregate({
    where: {
      issueDate: { gte: startOfYear },
      invoiceStatus: { not: 'CANCELLED' },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  })

  // Total paid
  const paidResult = await prisma.invoice.aggregate({
    where: {
      issueDate: { gte: startOfYear },
      invoiceStatus: 'PAID',
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  })

  // Unpaid
  const unpaidResult = await prisma.invoice.aggregate({
    where: {
      issueDate: { gte: startOfYear },
      invoiceStatus: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID'] },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  })

  // Overdue
  const overdueResult = await prisma.invoice.aggregate({
    where: {
      issueDate: { gte: startOfYear },
      invoiceStatus: 'OVERDUE',
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  })

  return {
    totalInvoiced: invoicedResult._sum.totalAmount || 0,
    totalPaid: paidResult._sum.totalAmount || 0,
    totalUnpaid: unpaidResult._sum.totalAmount || 0,
    totalOverdue: overdueResult._sum.totalAmount || 0,
    invoiceCount: invoicedResult._count.id,
    paidCount: paidResult._count.id,
    unpaidCount: unpaidResult._count.id,
    overdueCount: overdueResult._count.id,
  }
}

/**
 * Get revenue chart data for 3 years
 */
async function getRevenueData(currentYear: number): Promise<RevenueChartData> {
  const years = [currentYear - 2, currentYear - 1, currentYear]
  const monthNames = [
    'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
  ]

  const data = []

  for (const year of years) {
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1)
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

      // Get invoiced amount
      const invoiced = await prisma.invoice.aggregate({
        where: {
          issueDate: { gte: startOfMonth, lte: endOfMonth },
          invoiceStatus: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      })

      // Get paid amount
      const paid = await prisma.invoice.aggregate({
        where: {
          paidDate: { gte: startOfMonth, lte: endOfMonth },
          invoiceStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      })

      data.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        year,
        monthName: monthNames[month],
        totalInvoiced: invoiced._sum.totalAmount || 0,
        totalPaid: paid._sum.totalAmount || 0,
        totalUnpaid: (invoiced._sum.totalAmount || 0) - (paid._sum.totalAmount || 0),
      })
    }
  }

  return { years, data }
}

/**
 * Get turnover tracking data for VAT limit
 */
async function getTurnoverData(year: number): Promise<TurnoverData> {
  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  const limit = settings?.annualTurnoverLimit || 2000000 // 2M CZK default
  const warningThreshold = settings?.turnoverWarningThreshold || 90

  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year + 1, 0, 0, 23, 59, 59)

  const result = await prisma.invoice.aggregate({
    where: {
      issueDate: { gte: startOfYear, lte: endOfYear },
      invoiceStatus: { not: 'CANCELLED' },
      documentType: { in: ['FAKTURA', 'DANOVY_DOKLAD', 'PRIJMOVY_DOKLAD'] },
    },
    _sum: { totalAmount: true },
  })

  const currentTurnover = result._sum.totalAmount || 0
  const percentage = Math.round((currentTurnover / limit) * 100)
  const remaining = Math.max(0, limit - currentTurnover)

  return {
    year,
    currentTurnover,
    limit,
    percentage,
    remaining,
    isWarning: percentage >= warningThreshold,
  }
}

/**
 * Get invoice aging data
 */
async function getAgingData(): Promise<AgingData> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Not yet due
  const current = await prisma.invoice.aggregate({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED'] },
      dueDate: { gte: today },
    },
    _sum: { totalAmount: true },
  })

  // 1-30 days overdue
  const days30 = new Date(today)
  days30.setDate(days30.getDate() - 30)

  const days1_30 = await prisma.invoice.aggregate({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: today, gte: days30 },
    },
    _sum: { totalAmount: true },
  })

  // 31-60 days overdue
  const days60 = new Date(today)
  days60.setDate(days60.getDate() - 60)

  const days31_60 = await prisma.invoice.aggregate({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: days30, gte: days60 },
    },
    _sum: { totalAmount: true },
  })

  // 61-90 days overdue
  const days90 = new Date(today)
  days90.setDate(days90.getDate() - 90)

  const days61_90 = await prisma.invoice.aggregate({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: days60, gte: days90 },
    },
    _sum: { totalAmount: true },
  })

  // Over 90 days
  const over90 = await prisma.invoice.aggregate({
    where: {
      invoiceStatus: { in: ['SENT', 'VIEWED', 'OVERDUE'] },
      dueDate: { lt: days90 },
    },
    _sum: { totalAmount: true },
  })

  return {
    current: current._sum.totalAmount || 0,
    days1_30: days1_30._sum.totalAmount || 0,
    days31_60: days31_60._sum.totalAmount || 0,
    days61_90: days61_90._sum.totalAmount || 0,
    over90: over90._sum.totalAmount || 0,
  }
}
