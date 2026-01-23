'use client'

/**
 * Revenue Chart Component
 *
 * Displays revenue data with multiple visualization modes
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { RevenueChartData, formatAmount } from '@/types/invoicing'

interface RevenueChartProps {
  data: RevenueChartData
  mode: 'period' | 'sum' | 'comparison' | 'timeline'
  selectedYear: number
}

const COLORS = {
  2024: '#3b82f6', // Blue
  2025: '#10b981', // Green
  2026: '#f59e0b', // Amber
  invoiced: '#3b82f6',
  paid: '#10b981',
  unpaid: '#ef4444',
}

const monthLabels = [
  'Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn',
  'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'
]

export function RevenueChart({ data, mode, selectedYear }: RevenueChartProps) {
  // Transform data based on mode
  const chartData = getChartData(data, mode, selectedYear)

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => formatAmount(value)

  switch (mode) {
    case 'period':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelStyle={{ color: '#1f2937' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="totalInvoiced"
              name="Fakturováno"
              fill={COLORS.invoiced}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalPaid"
              name="Uhrazeno"
              fill={COLORS.paid}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'sum':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelStyle={{ color: '#1f2937' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="cumulativeInvoiced"
              name="Kumulativně fakturováno"
              stroke={COLORS.invoiced}
              fill={COLORS.invoiced}
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="cumulativePaid"
              name="Kumulativně uhrazeno"
              stroke={COLORS.paid}
              fill={COLORS.paid}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'comparison':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelStyle={{ color: '#1f2937' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {data.years.map((year, index) => (
              <Bar
                key={year}
                dataKey={`year${year}`}
                name={year.toString()}
                fill={Object.values(COLORS)[index]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )

    case 'timeline':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelStyle={{ color: '#1f2937' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {data.years.map((year, index) => (
              <Line
                key={year}
                type="monotone"
                dataKey={`year${year}`}
                name={year.toString()}
                stroke={Object.values(COLORS)[index]}
                strokeWidth={2}
                dot={{ fill: Object.values(COLORS)[index], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )

    default:
      return null
  }
}

function getChartData(
  data: RevenueChartData,
  mode: 'period' | 'sum' | 'comparison' | 'timeline',
  selectedYear: number
) {
  switch (mode) {
    case 'period': {
      // Filter data for selected year
      const yearData = data.data.filter(d => d.year === selectedYear)
      return yearData.map((d, index) => ({
        month: monthLabels[index] || d.monthName,
        totalInvoiced: d.totalInvoiced,
        totalPaid: d.totalPaid,
        totalUnpaid: d.totalUnpaid,
      }))
    }

    case 'sum': {
      // Cumulative sum for selected year
      const yearData = data.data.filter(d => d.year === selectedYear)
      let cumulativeInvoiced = 0
      let cumulativePaid = 0

      return yearData.map((d, index) => {
        cumulativeInvoiced += d.totalInvoiced
        cumulativePaid += d.totalPaid

        return {
          month: monthLabels[index] || d.monthName,
          cumulativeInvoiced,
          cumulativePaid,
        }
      })
    }

    case 'comparison':
    case 'timeline': {
      // Group by month, show all years
      const monthlyData: Record<string, Record<string, number>> = {}

      for (let i = 0; i < 12; i++) {
        monthlyData[monthLabels[i]] = {}
        data.years.forEach(year => {
          monthlyData[monthLabels[i]][`year${year}`] = 0
        })
      }

      data.data.forEach(d => {
        const monthIndex = parseInt(d.month.split('-')[1]) - 1
        const monthLabel = monthLabels[monthIndex]
        if (monthLabel) {
          monthlyData[monthLabel][`year${d.year}`] = d.totalInvoiced
        }
      })

      return Object.entries(monthlyData).map(([month, values]) => ({
        month,
        ...values,
      }))
    }

    default:
      return []
  }
}
