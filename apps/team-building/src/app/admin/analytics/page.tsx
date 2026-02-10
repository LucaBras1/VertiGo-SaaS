'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  DollarSign,
  Calendar,
  Repeat,
  TrendingUp,
  Target,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Table2,
} from 'lucide-react'
import { fadeIn, staggerContainer, staggerItem } from '@vertigo/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  MetricCard,
  RevenueChart,
  TrendChart,
  RetentionChart,
  CohortTable,
  IndustryDistribution,
  ObjectiveAnalysis,
} from '@/components/analytics'
import type { OverviewMetrics, TrendData } from '@/lib/analytics/metrics-aggregator'

type TabType = 'overview' | 'retention' | 'cohorts' | 'revenue'

interface RetentionData {
  retention: Array<{ period: string; totalCustomers: number; retainedCustomers: number; retentionRate: number }>
  churn: { thisMonth: number; lastMonth: number; trend: number; atRiskCustomers: number }
  ltv: { averageLTV: number; medianLTV: number }
  segments: {
    active: { count: number; percentage: number }
    atRisk: { count: number; percentage: number }
    churned: { count: number; percentage: number }
    new: { count: number; percentage: number }
  }
}

interface CohortAnalysisData {
  type: string
  cohorts: Array<{ cohortLabel: string; cohortSize: number; retentionByMonth: number[] }>
  months: string[]
}

interface RevenueData {
  breakdown: {
    byProgram: Array<{ name: string; value: number; percentage: number }>
    byIndustry: Array<{ name: string; value: number; percentage: number }>
    byMonth: Array<{ month: string; revenue: number; orderCount: number }>
  }
  programs: Array<{
    programId: string
    title: string
    bookingCount: number
    totalRevenue: number
    averageTeamSize: number
    completionRate: number
    popularObjectives: string[]
  }>
  objectives: Array<{
    objective: string
    sessionCount: number
    percentage: number
    avgTeamSize: number
    topIndustries: string[]
  }>
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [trends, setTrends] = useState<TrendData | null>(null)
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null)
  const [cohortData, setCohortData] = useState<CohortAnalysisData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'overview') {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch('/api/analytics/overview'),
          fetch('/api/analytics/trends'),
        ])
        if (overviewRes.ok) setOverview(await overviewRes.json())
        if (trendsRes.ok) setTrends(await trendsRes.json())
      } else if (activeTab === 'retention') {
        const res = await fetch('/api/analytics/retention')
        if (res.ok) setRetentionData(await res.json())
      } else if (activeTab === 'cohorts') {
        const res = await fetch('/api/analytics/cohorts')
        if (res.ok) setCohortData(await res.json())
      } else if (activeTab === 'revenue') {
        const res = await fetch('/api/analytics/revenue')
        if (res.ok) setRevenueData(await res.json())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'P\u0159ehled', icon: BarChart3 },
    { id: 'retention' as TabType, label: 'Retence', icon: Repeat },
    { id: 'cohorts' as TabType, label: 'Kohorty', icon: Table2 },
    { id: 'revenue' as TabType, label: 'Tr\u017eby', icon: PieChartIcon },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(
      value / 100
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Pokročilá analytika</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Komplexní přehled výkonnosti a trendů</p>
        </div>
      </div>

      {/* Tabs with Framer Motion sliding indicator */}
      <nav className="relative flex gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'text-neutral-900 dark:text-neutral-50'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="analytics-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-700 shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="ml-3 text-neutral-500 dark:text-neutral-400">Načítám data...</span>
          </motion.div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && overview && (
              <motion.div
                key="overview"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Metric Cards */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <MetricCard
                    title="Celkem zákazníků"
                    value={overview.customers.total}
                    subtitle={`${overview.customers.active} aktivních`}
                    icon={Users}
                    color="blue"
                  />
                  <MetricCard
                    title="Tržby tento měsíc"
                    value={overview.revenue.thisMonth}
                    change={overview.revenue.growthRate}
                    icon={DollarSign}
                    color="green"
                    format="currency"
                  />
                  <MetricCard
                    title="Sessions"
                    value={overview.sessions.total}
                    subtitle={`${overview.sessions.completionRate.toFixed(1)}% dokončeno`}
                    icon={Calendar}
                    color="purple"
                  />
                  <MetricCard
                    title="Opakované objednávky"
                    value={overview.retention.repeatRate}
                    subtitle={`${overview.retention.repeatCustomers} zákazníků`}
                    icon={Repeat}
                    color="orange"
                    format="percent"
                  />
                </motion.div>

                {/* Additional metrics row */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <MetricCard
                    title="Průměrná hodnota objednávky"
                    value={overview.revenue.averageOrderValue}
                    icon={TrendingUp}
                    color="emerald"
                    format="currency"
                  />
                  <MetricCard
                    title="Průměrná velikost týmu"
                    value={overview.sessions.averageTeamSize.toFixed(0)}
                    subtitle="účastníků na session"
                    icon={Users}
                    color="blue"
                  />
                  <MetricCard
                    title="Noví zákazníci"
                    value={overview.customers.new}
                    subtitle="tento měsíc"
                    icon={Users}
                    color="green"
                  />
                </motion.div>

                {/* Charts row */}
                {trends && (
                  <motion.div variants={staggerItem}>
                    <TrendChart
                      labels={trends.labels}
                      revenue={trends.revenue}
                      sessions={trends.sessions}
                      newCustomers={trends.newCustomers}
                    />
                  </motion.div>
                )}

                {/* Industry & Team Size */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <IndustryDistribution data={overview.customers.byIndustry} />
                  <Card hover={false} animated={false}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                        <CardTitle>Velikost týmu zákazníků</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries({
                          'Malé (1-10)': overview.customers.byTeamSize.small,
                          'Střední (11-50)': overview.customers.byTeamSize.medium,
                          'Velké (51-200)': overview.customers.byTeamSize.large,
                          'Enterprise (200+)': overview.customers.byTeamSize.enterprise,
                        }).map(([label, count]) => (
                          <div
                            key={label}
                            className="flex justify-between items-center py-2.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                          >
                            <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-50">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Retention Tab */}
            {activeTab === 'retention' && retentionData && (
              <motion.div
                key="retention"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* LTV & Churn metrics */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <MetricCard
                    title="Průměrná LTV"
                    value={retentionData.ltv.averageLTV}
                    icon={DollarSign}
                    color="green"
                    format="currency"
                  />
                  <MetricCard
                    title="Mediánová LTV"
                    value={retentionData.ltv.medianLTV}
                    icon={DollarSign}
                    color="emerald"
                    format="currency"
                  />
                  <MetricCard
                    title="Odchod tento měsíc"
                    value={retentionData.churn.thisMonth}
                    change={retentionData.churn.trend}
                    icon={TrendingUp}
                    color={retentionData.churn.trend >= 0 ? 'green' : 'red'}
                  />
                  <MetricCard
                    title="V riziku odchodu"
                    value={retentionData.churn.atRiskCustomers}
                    subtitle="zákazníků"
                    icon={Users}
                    color="orange"
                  />
                </motion.div>

                <RetentionChart retention={retentionData.retention} segments={retentionData.segments} />
              </motion.div>
            )}

            {/* Cohorts Tab */}
            {activeTab === 'cohorts' && cohortData && (
              <motion.div
                key="cohorts"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <CohortTable cohorts={cohortData.cohorts} months={cohortData.months} />
              </motion.div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && revenueData && (
              <motion.div
                key="revenue"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RevenueChart data={revenueData.breakdown.byProgram} title="Tržby podle programu" />
                  <RevenueChart data={revenueData.breakdown.byIndustry} title="Tržby podle odvětví" />
                </div>

                <ObjectiveAnalysis data={revenueData.objectives} />

                {/* Program Performance Table */}
                <Card hover={false} animated={false}>
                  <CardHeader>
                    <CardTitle>Výkonnost programů</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Program
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Bookings
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Tržby
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Prům. tým
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Dokončeno
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueData.programs.slice(0, 10).map((program, index) => (
                            <tr
                              key={program.programId}
                              className={
                                index % 2 === 0
                                  ? 'bg-neutral-50 dark:bg-neutral-800/50'
                                  : 'bg-white dark:bg-neutral-900'
                              }
                            >
                              <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {program.title}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-neutral-600 dark:text-neutral-400">
                                {program.bookingCount}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-neutral-600 dark:text-neutral-400">
                                {formatCurrency(program.totalRevenue)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-neutral-600 dark:text-neutral-400">
                                {program.averageTeamSize.toFixed(0)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right">
                                <span
                                  className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                    program.completionRate >= 80
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                      : program.completionRate >= 60
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                  }`}
                                >
                                  {program.completionRate.toFixed(0)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
