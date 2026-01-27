'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Award,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react'
import { MetricCard } from '@/components/analytics/MetricCard'
import { RevenueBreakdown } from '@/components/analytics/RevenueBreakdown'
import { RetentionChart } from '@/components/analytics/RetentionChart'
import { TrendChart } from '@/components/analytics/TrendChart'
import { CohortTable } from '@/components/analytics/CohortTable'
import { ClientSegments } from '@/components/analytics/ClientSegments'

interface OverviewMetrics {
  clients: {
    total: number
    active: number
    new: number
    churnedThisMonth: number
    growthRate: number
  }
  revenue: {
    thisMonth: number
    lastMonth: number
    growthRate: number
    averagePerClient: number
  }
  sessions: {
    thisMonth: number
    lastMonth: number
    completionRate: number
    averagePerClient: number
  }
  packages: {
    activeSubscriptions: number
    totalCreditsIssued: number
    creditsUsed: number
    utilizationRate: number
  }
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'retention' | 'cohorts'>('overview')

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/analytics/overview')
      if (response.ok) {
        const data = await response.json()
        setOverview(data)
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytika</h1>
          <p className="text-sm text-gray-500 mt-1">
            Prehled vykonnosti vaseho studia
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchOverview()
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Obnovit
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Prehled
          </button>
          <button
            onClick={() => setActiveTab('retention')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'retention'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Retence
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cohorts'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Kohorty
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Klienti"
              value={overview.clients.active}
              subtitle={`z ${overview.clients.total} celkem`}
              change={overview.clients.growthRate}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Prijmy tento mesic"
              value={formatCurrency(overview.revenue.thisMonth)}
              subtitle={`Prumer ${formatCurrency(overview.revenue.averagePerClient)}/klient`}
              change={overview.revenue.growthRate}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Lekce tento mesic"
              value={overview.sessions.thisMonth}
              subtitle={`${overview.sessions.completionRate.toFixed(0)}% dokonceno`}
              change={
                overview.sessions.lastMonth > 0
                  ? ((overview.sessions.thisMonth - overview.sessions.lastMonth) /
                      overview.sessions.lastMonth) *
                    100
                  : 0
              }
              icon={Calendar}
              color="purple"
            />
            <MetricCard
              title="Aktivni predplatne"
              value={overview.packages.activeSubscriptions}
              subtitle={`${overview.packages.utilizationRate.toFixed(0)}% vyuziti kreditu`}
              icon={Award}
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueBreakdown />
            <TrendChart />
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Novi klienti</h3>
                <span className="text-2xl font-bold text-blue-600">{overview.clients.new}</span>
              </div>
              <p className="text-sm text-gray-500">Tento mesic</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Odchod klientu</h3>
                <span className="text-2xl font-bold text-red-600">
                  {overview.clients.churnedThisMonth}
                </span>
              </div>
              <p className="text-sm text-gray-500">Tento mesic</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Prumerne lekci/klient</h3>
                <span className="text-2xl font-bold text-purple-600">
                  {overview.sessions.averagePerClient.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Tento mesic</p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'retention' && <RetentionChart />}

      {activeTab === 'cohorts' && (
        <div className="space-y-6">
          <ClientSegments />
          <CohortTable />
        </div>
      )}
    </div>
  )
}
