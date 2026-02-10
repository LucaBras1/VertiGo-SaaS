'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { chartTheme } from '@/lib/chart-theme'

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
    if (rate >= 70) return chartTheme.colors.success
    if (rate >= 50) return chartTheme.colors.warning
    return chartTheme.colors.error
  }

  const segmentData = [
    { name: 'Aktivní', value: segments.active.count, color: chartTheme.colors.success },
    { name: 'V riziku', value: segments.atRisk.count, color: chartTheme.colors.warning },
    { name: 'Odchozí', value: segments.churned.count, color: chartTheme.colors.error },
    { name: 'Noví', value: segments.new.count, color: chartTheme.colors.secondary },
  ]

  const totalSegments = segments.active.count + segments.atRisk.count + segments.churned.count + segments.new.count

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Retention by period */}
      <Card hover={false} animated={false}>
        <CardHeader>
          <CardTitle>Retence podle období</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retention} layout="vertical">
                <CartesianGrid
                  strokeDasharray={chartTheme.grid.strokeDasharray}
                  stroke={chartTheme.grid.stroke}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={chartTheme.axis.tick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="period"
                  tick={chartTheme.axis.tick}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retence']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: `1px solid ${chartTheme.tooltip.border}`,
                    backgroundColor: chartTheme.tooltip.bg,
                    color: chartTheme.tooltip.text,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="retentionRate" radius={[0, 6, 6, 0]}>
                  {retention.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.retentionRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartTheme.colors.success }} />
              <span className="text-neutral-600 dark:text-neutral-400">{'\u2265'}70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartTheme.colors.warning }} />
              <span className="text-neutral-600 dark:text-neutral-400">50-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartTheme.colors.error }} />
              <span className="text-neutral-600 dark:text-neutral-400">&lt;50%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer segments */}
      <Card hover={false} animated={false}>
        <CardHeader>
          <CardTitle>Segmenty zákazníků</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segmentData.map((segment) => (
              <div key={segment.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{segment.name}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">{segment.value}</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max((segment.value / totalSegments) * 100, 2)}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: chartTheme.colors.success }}>
                  {segments.active.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Aktivní zákazníci</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: chartTheme.colors.warning }}>
                  {segments.atRisk.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">V riziku odchodu</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
