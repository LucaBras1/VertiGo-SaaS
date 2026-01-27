'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface RevenueData {
  current: {
    sessions: number
    packages: number
    subscriptions: number
    other: number
    total: number
  }
  growth: {
    total: number
  }
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']

export function RevenueBreakdown() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/revenue')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch revenue:', error)
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rozklad prijmu</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rozklad prijmu</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Zadna data
        </div>
      </div>
    )
  }

  const chartData = [
    { name: 'Lekce', value: data.current.sessions, color: COLORS[0] },
    { name: 'Balicky', value: data.current.packages, color: COLORS[1] },
    { name: 'Predplatne', value: data.current.subscriptions, color: COLORS[2] },
    { name: 'Ostatni', value: data.current.other, color: COLORS[3] },
  ].filter((item) => item.value > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Rozklad prijmu</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.current.total)}</p>
          <p
            className={`text-sm ${
              data.growth.total >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {data.growth.total >= 0 ? '+' : ''}
            {data.growth.total.toFixed(1)}% oproti minulemu obdobi
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Legend
                formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Zadne prijmy v tomto obdobi
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.name}:</span>
            <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
