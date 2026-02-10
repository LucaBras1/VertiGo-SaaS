'use client'

import { motion } from 'framer-motion'
import { Users, Activity, Calendar, TrendingUp } from 'lucide-react'
import { staggerContainer } from '@vertigo/ui'
import { StatCard } from './StatCard'
import { QuickActions } from './QuickActions'
import { UpcomingSessions } from './UpcomingSessions'
import { AIFeaturesCard } from './AIFeaturesCard'

interface DashboardStats {
  totalPrograms: number
  programsThisMonth: number
  totalActivities: number
  activitiesThisWeek: number
  upcomingSessions: number
  currentRevenue: number
  revenueChange: number
}

interface SessionData {
  id: string
  companyName: string | null
  teamName: string | null
  date: Date | string
  status: string
  teamSize: number | null
  program: { title: string } | null
}

interface DashboardClientProps {
  stats: DashboardStats
  sessions: SessionData[]
}

export function DashboardClient({ stats, sessions }: DashboardClientProps) {
  const statCards = [
    {
      name: 'Total Programs',
      value: stats.totalPrograms.toString(),
      change: stats.programsThisMonth > 0 ? `+${stats.programsThisMonth} this month` : 'No new this month',
      trend: stats.programsThisMonth > 0 ? 'up' as const : 'neutral' as const,
      icon: Users,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100 dark:bg-sky-900/30',
    },
    {
      name: 'Active Activities',
      value: stats.totalActivities.toString(),
      change: stats.activitiesThisWeek > 0 ? `+${stats.activitiesThisWeek} this week` : 'No new this week',
      trend: stats.activitiesThisWeek > 0 ? 'up' as const : 'neutral' as const,
      icon: Activity,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      name: 'Upcoming Sessions',
      value: stats.upcomingSessions.toString(),
      change: 'Next 30 days',
      trend: 'neutral' as const,
      icon: Calendar,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    },
    {
      name: 'Revenue (This Month)',
      value: `${stats.currentRevenue.toLocaleString('cs-CZ')} K\u010d`,
      change: stats.revenueChange !== 0
        ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% from last month`
        : 'Same as last month',
      trend: stats.revenueChange > 0 ? 'up' as const : stats.revenueChange < 0 ? 'down' as const : 'neutral' as const,
      icon: TrendingUp,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Upcoming Sessions */}
      <UpcomingSessions sessions={sessions} />

      {/* AI Features */}
      <AIFeaturesCard />
    </div>
  )
}
