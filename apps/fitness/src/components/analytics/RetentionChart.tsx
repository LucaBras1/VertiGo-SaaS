'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface RetentionData {
  retention: {
    oneMonth: { period: string; totalClients: number; retainedClients: number; retentionRate: number }
    threeMonths: { period: string; totalClients: number; retainedClients: number; retentionRate: number }
    sixMonths: { period: string; totalClients: number; retainedClients: number; retentionRate: number }
    oneYear: { period: string; totalClients: number; retainedClients: number; retentionRate: number }
    byMonth: { period: string; retentionRate: number }[]
  }
  ltv: {
    averageLTV: number
    medianLTV: number
    highestLTV: number
    lowestLTV: number
  }
  churn: {
    totalAtStart: number
    totalAtEnd: number
    churned: number
    churnRate: number
  }
}

export function RetentionChart() {
  const [data, setData] = useState<RetentionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/retention')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch retention:', error)
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
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Zadna data
        </div>
      </div>
    )
  }

  const retentionPeriods = [
    { label: '1 mesic', value: data.retention.oneMonth.retentionRate },
    { label: '3 mesice', value: data.retention.threeMonths.retentionRate },
    { label: '6 mesicu', value: data.retention.sixMonths.retentionRate },
    { label: '1 rok', value: data.retention.oneYear.retentionRate },
  ]

  const monthlyData = data.retention.byMonth.map((item) => ({
    name: item.period,
    retence: item.retentionRate,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">1-mesicni retence</span>
            <span
              className={`text-lg font-bold ${
                data.retention.oneMonth.retentionRate >= 70
                  ? 'text-green-600'
                  : data.retention.oneMonth.retentionRate >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {data.retention.oneMonth.retentionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {data.retention.oneMonth.retainedClients} z {data.retention.oneMonth.totalClients}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">3-mesicni retence</span>
            <span
              className={`text-lg font-bold ${
                data.retention.threeMonths.retentionRate >= 60
                  ? 'text-green-600'
                  : data.retention.threeMonths.retentionRate >= 40
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {data.retention.threeMonths.retentionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {data.retention.threeMonths.retainedClients} z {data.retention.threeMonths.totalClients}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Churn rate</span>
            <span
              className={`text-lg font-bold ${
                data.churn.churnRate <= 5
                  ? 'text-green-600'
                  : data.churn.churnRate <= 10
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {data.churn.churnRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400">{data.churn.churned} klientu tento mesic</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Prumerne LTV</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(data.ltv.averageLTV)}
            </span>
          </div>
          <p className="text-xs text-gray-400">Median: {formatCurrency(data.ltv.medianLTV)}</p>
        </div>
      </div>

      {/* Retention by Period Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Retence podle obdobi</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionPeriods} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={80} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retence']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {retentionPeriods.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.value >= 70
                        ? '#10B981'
                        : entry.value >= 50
                        ? '#F59E0B'
                        : '#EF4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Retention Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Mesicni vyvoj retence</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retence']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="retence" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LTV Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Lifetime Value (LTV)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.ltv.averageLTV)}
            </p>
            <p className="text-sm text-gray-500">Prumer</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.ltv.medianLTV)}
            </p>
            <p className="text-sm text-gray-500">Median</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.ltv.highestLTV)}
            </p>
            <p className="text-sm text-gray-500">Maximum</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {formatCurrency(data.ltv.lowestLTV)}
            </p>
            <p className="text-sm text-gray-500">Minimum</p>
          </div>
        </div>
      </div>
    </div>
  )
}
