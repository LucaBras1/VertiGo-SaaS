'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { chartTheme } from '@/lib/chart-theme'

interface TrendChartProps {
  labels: string[]
  revenue: number[]
  sessions: number[]
  newCustomers: number[]
}

export function TrendChart({ labels, revenue, sessions, newCustomers }: TrendChartProps) {
  const data = labels.map((label, index) => ({
    name: label,
    revenue: revenue[index] / 100,
    sessions: sessions[index],
    newCustomers: newCustomers[index],
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value)
  }

  return (
    <Card hover={false} animated={false}>
      <CardHeader>
        <CardTitle>Trendy v čase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.colors.success} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartTheme.colors.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.colors.secondary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartTheme.colors.secondary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientCustomers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartTheme.colors.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartTheme.colors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray={chartTheme.grid.strokeDasharray}
                stroke={chartTheme.grid.stroke}
                className="dark:hidden"
              />
              <CartesianGrid
                strokeDasharray={chartTheme.gridDark.strokeDasharray}
                stroke={chartTheme.gridDark.stroke}
                className="hidden dark:block"
              />
              <XAxis
                dataKey="name"
                tick={chartTheme.axis.tick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatCurrency}
                tick={chartTheme.axis.tick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={chartTheme.axis.tick}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [formatCurrency(value), 'Tržby']
                  if (name === 'sessions') return [value, 'Sessions']
                  return [value, 'Noví zákazníci']
                }}
                contentStyle={{
                  borderRadius: '10px',
                  border: `1px solid ${chartTheme.tooltip.border}`,
                  backgroundColor: chartTheme.tooltip.bg,
                  color: chartTheme.tooltip.text,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'revenue') return 'Tržby'
                  if (value === 'sessions') return 'Sessions'
                  return 'Noví zákazníci'
                }}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke={chartTheme.colors.success}
                strokeWidth={2.5}
                dot={false}
                fill="url(#gradientRevenue)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="sessions"
                stroke={chartTheme.colors.secondary}
                strokeWidth={2.5}
                dot={false}
                fill="url(#gradientSessions)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="newCustomers"
                stroke={chartTheme.colors.primary}
                strokeWidth={2.5}
                dot={false}
                fill="url(#gradientCustomers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
