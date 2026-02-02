/**
 * Revenue Analyzer
 * Revenue breakdown and analysis for TeamForge
 */

import { prisma } from '@/lib/db'

export interface RevenueBreakdown {
  byProgram: Array<{ name: string; value: number; percentage: number }>
  byIndustry: Array<{ name: string; value: number; percentage: number }>
  byMonth: Array<{ month: string; revenue: number; orderCount: number }>
}

/**
 * Get comprehensive revenue breakdown
 */
export async function getRevenueBreakdown(): Promise<RevenueBreakdown> {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Get all paid invoices for revenue by month
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      status: 'paid',
      paidDate: { gte: startOfYear },
    },
    select: {
      totalAmount: true,
      paidDate: true,
    },
  })

  // Revenue by month
  const revenueByMonth: Record<string, { revenue: number; orderCount: number }> = {}
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(now.getFullYear(), i, 1)
    const monthKey = monthDate.toLocaleDateString('cs-CZ', { month: 'short' })
    revenueByMonth[monthKey] = { revenue: 0, orderCount: 0 }
  }

  paidInvoices.forEach((invoice) => {
    if (invoice.paidDate) {
      const monthKey = invoice.paidDate.toLocaleDateString('cs-CZ', { month: 'short' })
      if (revenueByMonth[monthKey]) {
        revenueByMonth[monthKey].revenue += invoice.totalAmount
        revenueByMonth[monthKey].orderCount++
      }
    }
  })

  const byMonth = Object.entries(revenueByMonth).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    orderCount: data.orderCount,
  }))

  // Get orders with program details
  const ordersWithDetails = await prisma.order.findMany({
    where: {
      status: { in: ['confirmed', 'completed'] },
    },
    select: {
      customer: {
        select: { industryType: true },
      },
      items: {
        select: {
          price: true,
          program: { select: { title: true } },
        },
      },
    },
  })

  // Revenue by program
  const programRevenue: Record<string, number> = {}
  ordersWithDetails.forEach((order) => {
    order.items.forEach((item) => {
      const programName = item.program?.title || 'Ostatní'
      programRevenue[programName] = (programRevenue[programName] || 0) + item.price
    })
  })

  const totalProgramRevenue = Object.values(programRevenue).reduce((sum, val) => sum + val, 0)
  const byProgram = Object.entries(programRevenue)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalProgramRevenue > 0 ? (value / totalProgramRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  // Revenue by industry
  const industryRevenue: Record<string, number> = {}
  ordersWithDetails.forEach((order) => {
    const industry = order.customer?.industryType || 'Neuvedeno'
    const orderTotal = order.items.reduce((sum, item) => sum + item.price, 0)
    industryRevenue[industry] = (industryRevenue[industry] || 0) + orderTotal
  })

  const totalIndustryRevenue = Object.values(industryRevenue).reduce((sum, val) => sum + val, 0)
  const byIndustry = Object.entries(industryRevenue)
    .map(([name, value]) => ({
      name: formatIndustryName(name),
      value,
      percentage: totalIndustryRevenue > 0 ? (value / totalIndustryRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  return { byProgram, byIndustry, byMonth }
}

/**
 * Get program performance metrics
 */
export interface ProgramPerformance {
  programId: string
  title: string
  bookingCount: number
  totalRevenue: number
  averageTeamSize: number
  completionRate: number
  popularObjectives: string[]
}

export async function getProgramPerformance(): Promise<ProgramPerformance[]> {
  const programs = await prisma.program.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      sessions: {
        select: {
          id: true,
          teamSize: true,
          status: true,
          objectives: true,
        },
      },
      orderItems: {
        select: {
          price: true,
        },
      },
    },
  })

  return programs.map((program) => {
    const bookingCount = program.sessions.length
    const totalRevenue = program.orderItems.reduce((sum, item) => sum + item.price, 0)

    const sessionsWithTeamSize = program.sessions.filter((s) => s.teamSize)
    const averageTeamSize =
      sessionsWithTeamSize.length > 0
        ? sessionsWithTeamSize.reduce((sum, s) => sum + (s.teamSize || 0), 0) / sessionsWithTeamSize.length
        : 0

    const completedSessions = program.sessions.filter((s) => s.status === 'completed').length
    const completionRate = bookingCount > 0 ? (completedSessions / bookingCount) * 100 : 0

    // Count objectives
    const objectiveCounts: Record<string, number> = {}
    program.sessions.forEach((s) => {
      if (s.objectives && Array.isArray(s.objectives)) {
        ;(s.objectives as string[]).forEach((obj) => {
          objectiveCounts[obj] = (objectiveCounts[obj] || 0) + 1
        })
      }
    })

    const popularObjectives = Object.entries(objectiveCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([obj]) => obj)

    return {
      programId: program.id,
      title: program.title,
      bookingCount,
      totalRevenue,
      averageTeamSize,
      completionRate,
      popularObjectives,
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

/**
 * Get objective popularity analysis
 */
export interface ObjectiveAnalysis {
  objective: string
  sessionCount: number
  percentage: number
  avgTeamSize: number
  topIndustries: string[]
}

export async function getObjectiveAnalysis(): Promise<ObjectiveAnalysis[]> {
  const sessions = await prisma.session.findMany({
    select: {
      teamSize: true,
      objectives: true,
      industryType: true,
    },
  })

  const objectiveData: Record<
    string,
    {
      count: number
      teamSizes: number[]
      industries: Record<string, number>
    }
  > = {}

  sessions.forEach((session) => {
    if (session.objectives && Array.isArray(session.objectives)) {
      ;(session.objectives as string[]).forEach((obj) => {
        if (!objectiveData[obj]) {
          objectiveData[obj] = { count: 0, teamSizes: [], industries: {} }
        }
        objectiveData[obj].count++
        if (session.teamSize) {
          objectiveData[obj].teamSizes.push(session.teamSize)
        }
        if (session.industryType) {
          objectiveData[obj].industries[session.industryType] =
            (objectiveData[obj].industries[session.industryType] || 0) + 1
        }
      })
    }
  })

  const totalSessions = sessions.length

  return Object.entries(objectiveData)
    .map(([objective, data]) => ({
      objective: formatObjectiveName(objective),
      sessionCount: data.count,
      percentage: totalSessions > 0 ? (data.count / totalSessions) * 100 : 0,
      avgTeamSize: data.teamSizes.length > 0 ? data.teamSizes.reduce((a, b) => a + b, 0) / data.teamSizes.length : 0,
      topIndustries: Object.entries(data.industries)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([ind]) => formatIndustryName(ind)),
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount)
}

// Helper functions for formatting enum values
function formatIndustryName(industry: string): string {
  const names: Record<string, string> = {
    TECHNOLOGY: 'Technologie',
    FINANCE: 'Finance',
    HEALTHCARE: 'Zdravotnictví',
    EDUCATION: 'Vzdělávání',
    MANUFACTURING: 'Výroba',
    RETAIL: 'Retail',
    HOSPITALITY: 'Hotelnictví',
    CONSULTING: 'Consulting',
    GOVERNMENT: 'Veřejný sektor',
    NONPROFIT: 'Neziskový sektor',
    OTHER: 'Ostatní',
    Neuvedeno: 'Neuvedeno',
  }
  return names[industry] || industry
}

function formatObjectiveName(objective: string): string {
  const names: Record<string, string> = {
    COMMUNICATION: 'Komunikace',
    TRUST: 'Budování důvěry',
    LEADERSHIP: 'Leadership',
    PROBLEM_SOLVING: 'Řešení problémů',
    CREATIVITY: 'Kreativita',
    COLLABORATION: 'Spolupráce',
    CONFLICT: 'Řešení konfliktů',
    MOTIVATION: 'Motivace',
  }
  return names[objective] || objective
}
