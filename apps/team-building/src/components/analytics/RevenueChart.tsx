'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { chartTheme } from '@/lib/chart-theme'

interface RevenueChartProps {
  data: Array<{ name: string; value: number; percentage: number }>
  title: string
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(
      value / 100
    )
  }

  // Take top 7 and group rest as "Ostatní"
  const processedData = data.length > 7
    ? [
        ...data.slice(0, 7),
        {
          name: 'Ostatni',
          value: data.slice(7).reduce((sum, item) => sum + item.value, 0),
          percentage: data.slice(7).reduce((sum, item) => sum + item.percentage, 0),
        },
      ]
    : data

  const COLORS = [
    ...chartTheme.colors.series,
    '#14B8A6',
    '#F97316',
  ]

  return (
    <Card hover={false} animated={false}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                labelLine={false}
                strokeWidth={0}
              >
                {processedData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '10px',
                  border: `1px solid ${chartTheme.tooltip.border}`,
                  backgroundColor: chartTheme.tooltip.bg,
                  color: chartTheme.tooltip.text,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
