'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  DollarSign,
  Calendar,
  Repeat,
  TrendingUp,
  Building2,
  Target,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Table2,
} from 'lucide-react'
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
    { id: 'overview' as TabType, label: 'Přehled', icon: BarChart3 },
    { id: 'retention' as TabType, label: 'Retence', icon: Repeat },
    { id: 'cohorts' as TabType, label: 'Kohorty', icon: Table2 },
    { id: 'revenue' as TabType, label: 'Tržby', icon: PieChartIcon },
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
          <h1 className="text-2xl font-bold text-gray-900">Pokročilá analytika</h1>
          <p className="text-gray-500 mt-1">Komplexní přehled výkonnosti a trendů</p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex gap-2 border-b border-gray-200 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-white border border-gray-200 border-b-white -mb-px text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Načítám data...</span>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>

              {/* Additional metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              {/* Charts row */}
              {trends && (
                <TrendChart
                  labels={trends.labels}
                  revenue={trends.revenue}
                  sessions={trends.sessions}
                  newCustomers={trends.newCustomers}
                />
              )}

              {/* Industry & Objectives */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IndustryDistribution data={overview.customers.byIndustry} />
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Velikost týmu zákazníků</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries({
                      'Malé (1-10)': overview.customers.byTeamSize.small,
                      'Střední (11-50)': overview.customers.byTeamSize.medium,
                      'Velké (51-200)': overview.customers.byTeamSize.large,
                      'Enterprise (200+)': overview.customers.byTeamSize.enterprise,
                    }).map(([label, count]) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retention Tab */}
          {activeTab === 'retention' && retentionData && (
            <div className="space-y-6">
              {/* LTV & Churn metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              </div>

              <RetentionChart retention={retentionData.retention} segments={retentionData.segments} />
            </div>
          )}

          {/* Cohorts Tab */}
          {activeTab === 'cohorts' && cohortData && (
            <div className="space-y-6">
              <CohortTable cohorts={cohortData.cohorts} months={cohortData.months} />
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && revenueData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueData.breakdown.byProgram} title="Tržby podle programu" />
                <RevenueChart data={revenueData.breakdown.byIndustry} title="Tržby podle odvětví" />
              </div>

              <ObjectiveAnalysis data={revenueData.objectives} />

              {/* Program Performance Table */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Výkonnost programů</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Program</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Bookings</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Tržby</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Prům. tým</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Dokončeno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.programs.slice(0, 10).map((program, index) => (
                        <tr key={program.programId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{program.title}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">{program.bookingCount}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {formatCurrency(program.totalRevenue)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {program.averageTeamSize.toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                program.completionRate >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : program.completionRate >= 60
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
