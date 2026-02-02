/**
 * Admin Dashboard Home
 * Displays real data from database
 */

// Force dynamic rendering - database queries at runtime
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import {
  Users,
  Activity,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { prisma } from '@/lib/db'

// Revalidate every 60 seconds
export const revalidate = 60

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Fetch all stats in parallel
  const [
    totalPrograms,
    programsThisMonth,
    totalActivities,
    activitiesThisWeek,
    upcomingSessions,
    revenueThisMonth,
    revenueLastMonth,
  ] = await Promise.all([
    // Total programs
    prisma.program.count({ where: { status: 'active' } }),
    // Programs created this month
    prisma.program.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    }),
    // Total active activities
    prisma.activity.count({ where: { status: 'active' } }),
    // Activities created this week
    prisma.activity.count({
      where: {
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    // Upcoming sessions in next 30 days
    prisma.session.count({
      where: {
        date: { gte: now, lte: thirtyDaysFromNow },
        status: { in: ['confirmed', 'tentative'] },
      },
    }),
    // Revenue this month (from paid invoices)
    prisma.invoice.aggregate({
      where: {
        status: 'paid',
        paidDate: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    // Revenue last month
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
    currentRevenue: currentRevenue / 100, // Convert from hellers to CZK
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

  const statCards = [
    {
      name: 'Total Programs',
      value: stats.totalPrograms.toString(),
      change: stats.programsThisMonth > 0 ? `+${stats.programsThisMonth} this month` : 'No new this month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Activities',
      value: stats.totalActivities.toString(),
      change: stats.activitiesThisWeek > 0 ? `+${stats.activitiesThisWeek} this week` : 'No new this week',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      name: 'Upcoming Sessions',
      value: stats.upcomingSessions.toString(),
      change: 'Next 30 days',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Revenue (This Month)',
      value: `${stats.currentRevenue.toLocaleString('cs-CZ')} Kč`,
      change: stats.revenueChange !== 0
        ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% from last month`
        : 'Same as last month',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'tentative':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/programs/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-blue-50 transition-all text-center group"
          >
            <Users className="w-8 h-8 text-gray-400 group-hover:text-brand-primary mx-auto mb-2" />
            <p className="font-semibold text-gray-700 group-hover:text-brand-primary">
              Create Program
            </p>
          </Link>
          <Link
            href="/admin/activities/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-blue-50 transition-all text-center group"
          >
            <Activity className="w-8 h-8 text-gray-400 group-hover:text-brand-primary mx-auto mb-2" />
            <p className="font-semibold text-gray-700 group-hover:text-brand-primary">
              Add Activity
            </p>
          </Link>
          <Link
            href="/admin/sessions/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-primary hover:bg-blue-50 transition-all text-center group"
          >
            <Calendar className="w-8 h-8 text-gray-400 group-hover:text-brand-primary mx-auto mb-2" />
            <p className="font-semibold text-gray-700 group-hover:text-brand-primary">
              Schedule Session
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Link href="/admin/sessions" className="text-brand-primary hover:underline text-sm font-semibold">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming sessions in the next 30 days</p>
          ) : (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(session.status)}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {session.companyName || session.teamName || 'Unnamed Session'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {session.program && ` • ${session.program.title}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{session.teamSize || '?'} participants</p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      session.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Features */}
      <div className="card bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-brand-primary">
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Features</h2>
        <p className="text-gray-700 mb-4">
          Use our advanced AI to optimize your team building programs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/ai/team-analysis"
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-brand-primary mb-1">Team Dynamics Analysis</h3>
            <p className="text-sm text-gray-600">
              Get AI recommendations for team composition and activities
            </p>
          </Link>
          <Link
            href="/admin/ai/objective-matcher"
            className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-brand-primary mb-1">Objective Matcher</h3>
            <p className="text-sm text-gray-600">
              Match corporate goals to the perfect activities
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
