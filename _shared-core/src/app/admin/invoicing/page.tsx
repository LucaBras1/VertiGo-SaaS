'use client'

/**
 * Invoicing Dashboard Page (PŘEHLEDY)
 *
 * Main dashboard with revenue charts, statistics, and quick actions
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  ArrowRight,
  Wallet,
  Receipt,
  Users,
} from 'lucide-react'
import { RevenueChart } from '@/components/admin/invoicing/dashboard/RevenueChart'
import { StatisticsTable } from '@/components/admin/invoicing/dashboard/StatisticsTable'
import { TurnoverTracker } from '@/components/admin/invoicing/dashboard/TurnoverTracker'
import { QuickStatsCards } from '@/components/admin/invoicing/dashboard/QuickStatsCards'
import { AIInsightsPanel } from '@/components/admin/invoicing/ai'
import {
  DashboardStats,
  RevenueChartData,
  TurnoverData,
  formatAmount,
} from '@/types/invoicing'

type ChartMode = 'period' | 'sum' | 'comparison' | 'timeline'

export default function InvoicingDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueChartData | null>(null)
  const [turnoverData, setTurnoverData] = useState<TurnoverData | null>(null)
  const [chartMode, setChartMode] = useState<ChartMode>('period')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [selectedYear])

  async function fetchDashboardData() {
    setLoading(true)
    setError(null)

    try {
      const [statsRes, revenueRes, turnoverRes] = await Promise.all([
        fetch('/api/admin/invoicing/dashboard?type=stats'),
        fetch(`/api/admin/invoicing/dashboard?type=revenue&year=${selectedYear}`),
        fetch(`/api/admin/invoicing/dashboard?type=turnover&year=${selectedYear}`),
      ])

      if (!statsRes.ok || !revenueRes.ok || !turnoverRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [statsData, revenueDataRes, turnoverDataRes] = await Promise.all([
        statsRes.json(),
        revenueRes.json(),
        turnoverRes.json(),
      ])

      setStats(statsData)
      setRevenueData(revenueDataRes)
      setTurnoverData(turnoverDataRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Přehledy fakturace
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vyfakturuj 2.0AI - Kompletní přehled vašich financí
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>

          <Link
            href="/admin/invoicing/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nová faktura
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      {stats && <QuickStatsCards stats={stats} loading={loading} />}

      {/* Status Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* All Paid Widget */}
        <div className={`p-4 rounded-lg border ${
          stats && stats.unpaidCount === 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-3">
            {stats && stats.unpaidCount === 0 ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {stats && stats.unpaidCount === 0
                  ? 'Všechny doklady máte uhrazeny'
                  : `${stats?.unpaidCount || 0} neuhrazených faktur`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats && stats.unpaidCount > 0
                  ? `Celkem ${formatAmount(stats.totalUnpaid)}`
                  : 'Výborně!'}
              </p>
            </div>
          </div>
        </div>

        {/* Overdue Widget */}
        <div className={`p-4 rounded-lg border ${
          stats && stats.overdueCount === 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {stats && stats.overdueCount === 0 ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {stats && stats.overdueCount === 0
                  ? 'Žádné faktury po splatnosti'
                  : `${stats?.overdueCount || 0} faktur po splatnosti`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats && stats.overdueCount > 0
                  ? `Celkem ${formatAmount(stats.totalOverdue)}`
                  : 'Nemáte žádné nedoplatky'}
              </p>
            </div>
          </div>
        </div>

        {/* Turnover Tracker Widget */}
        {turnoverData && (
          <TurnoverTracker data={turnoverData} />
        )}
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Přehled příjmů
          </h2>

          {/* Chart Mode Selector */}
          <div className="flex items-center gap-2">
            {[
              { id: 'period', label: 'Po období' },
              { id: 'sum', label: 'Součet' },
              { id: 'comparison', label: 'Porovnání' },
              { id: 'timeline', label: 'Timeline' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setChartMode(mode.id as ChartMode)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  chartMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Rok:</span>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedYear === year
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Chart */}
        {revenueData && (
          <RevenueChart
            data={revenueData}
            mode={chartMode}
            selectedYear={selectedYear}
          />
        )}
      </div>

      {/* Statistics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Statistiky {selectedYear}
        </h2>

        {revenueData && (
          <StatisticsTable
            data={revenueData}
            year={selectedYear}
          />
        )}
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/invoicing/invoices"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Faktury</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats?.invoiceCount || 0} dokladů
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link
          href="/admin/invoicing/expenses"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Náklady</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Správa nákladů</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
        </Link>

        <Link
          href="/admin/customers"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Adresář</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kontakty</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </Link>

        <Link
          href="/admin/invoicing/settings"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Nastavení</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurace</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
