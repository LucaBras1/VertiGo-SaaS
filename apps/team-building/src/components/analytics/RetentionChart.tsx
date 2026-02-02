'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

interface RetentionData {
  period: string
  totalCustomers: number
  retainedCustomers: number
  retentionRate: number
}

interface CustomerSegments {
  active: { count: number; percentage: number }
  atRisk: { count: number; percentage: number }
  churned: { count: number; percentage: number }
  new: { count: number; percentage: number }
}

interface RetentionChartProps {
  retention: RetentionData[]
  segments: CustomerSegments
}

export function RetentionChart({ retention, segments }: RetentionChartProps) {
  const getBarColor = (rate: number) => {
    if (rate >= 70) return '#10B981' // Green
    if (rate >= 50) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const segmentData = [
    { name: 'Aktivní', value: segments.active.count, color: '#10B981' },
    { name: 'V riziku', value: segments.atRisk.count, color: '#F59E0B' },
    { name: 'Odchozí', value: segments.churned.count, color: '#EF4444' },
    { name: 'Noví', value: segments.new.count, color: '#3B82F6' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Retention by period */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Retence podle období</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retention} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="period" tick={{ fontSize: 12 }} width={80} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retence']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="retentionRate" radius={[0, 4, 4, 0]}>
                {retention.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.retentionRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600">≥70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600">50-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600">&lt;50%</span>
          </div>
        </div>
      </div>

      {/* Customer segments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmenty zákazníků</h3>
        <div className="space-y-4">
          {segmentData.map((segment) => (
            <div key={segment.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{segment.name}</span>
                <span className="text-gray-500">{segment.value}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((segment.value / (segments.active.count + segments.atRisk.count + segments.churned.count + segments.new.count)) * 100, 2)}%`,
                    backgroundColor: segment.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{segments.active.percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Aktivní zákazníci</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{segments.atRisk.percentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">V riziku odchodu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
