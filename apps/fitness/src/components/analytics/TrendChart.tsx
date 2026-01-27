'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface TrendData {
  labels: string[]
  revenue: number[]
  sessions: number[]
  newClients: number[]
}

type Period = 'daily' | 'weekly' | 'monthly'

export function TrendChart() {
  const [data, setData] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('monthly')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/trends?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.trends)
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Trendy</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Trendy</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Zadna data
        </div>
      </div>
    )
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    prijmy: data.revenue[index],
    lekce: data.sessions[index],
    klienti: data.newClients[index],
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Trendy</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Den
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tyden
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              period === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mesic
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'prijmy') {
                  return [
                    new Intl.NumberFormat('cs-CZ', {
                      style: 'currency',
                      currency: 'CZK',
                      minimumFractionDigits: 0,
                    }).format(value),
                    'Prijmy',
                  ]
                }
                return [value, name === 'lekce' ? 'Lekce' : 'Novi klienti']
              }}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  prijmy: 'Prijmy',
                  lekce: 'Lekce',
                  klienti: 'Novi klienti',
                }
                return <span className="text-sm">{labels[value] || value}</span>
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="prijmy"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lekce"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="klienti"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
