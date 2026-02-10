/**
 * Admin Dashboard Home
 * Displays real data from database
 */

// Force dynamic rendering - database queries at runtime
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { DashboardClient } from '@/components/admin/dashboard/DashboardClient'

// Revalidate every 60 seconds
export const revalidate = 60

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [
    totalPrograms,
    programsThisMonth,
    totalActivities,
    activitiesThisWeek,
    upcomingSessions,
    revenueThisMonth,
    revenueLastMonth,
  ] = await Promise.all([
    prisma.program.count({ where: { status: 'active' } }),
    prisma.program.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.activity.count({ where: { status: 'active' } }),
    prisma.activity.count({
      where: {
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.session.count({
      where: {
        date: { gte: now, lte: thirtyDaysFromNow },
        status: { in: ['confirmed', 'tentative'] },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidDate: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),
  ])

  const currentRevenue = revenueThisMonth._sum.totalAmount || 0
  const lastMonthRevenue = revenueLastMonth._sum.totalAmount || 0
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  return {
    totalPrograms,
    programsThisMonth,
    totalActivities,
    activitiesThisWeek,
    upcomingSessions,
    currentRevenue: currentRevenue / 100,
    revenueChange,
  }
}

async function getUpcomingSessions() {
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return prisma.session.findMany({
    where: {
      date: { gte: now, lte: thirtyDaysFromNow },
      status: { in: ['confirmed', 'tentative'] },
    },
    orderBy: { date: 'asc' },
    take: 5,
    include: {
      program: {
        select: { title: true },
      },
    },
  })
}

export default async function AdminDashboard() {
  const [stats, upcomingSessions] = await Promise.all([
    getDashboardStats(),
    getUpcomingSessions(),
  ])

  return (
    <DashboardClient
      stats={stats}
      sessions={upcomingSessions.map(s => ({
        ...s,
        date: s.date.toISOString(),
      }))}
    />
  )
}
