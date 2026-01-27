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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon } from 'lucide-react'

interface MonthlyData {
  month: number
  revenue: number
  expenses: number
  profit: number
}

interface RevenueBreakdown {
  name: string
  value: number
  color: string
}

interface ExpenseCategory {
  categoryName: string
  amount: number
}

interface ProfitLossChartProps {
  monthlyTrend: MonthlyData[]
  revenueBreakdown: RevenueBreakdown[]
  expensesByCategory: ExpenseCategory[]
  profitLoss: {
    revenue: {
      sessions: number
      classes: number
      packages: number
      other: number
      total: number
    }
    expenses: {
      total: number
    }
    grossProfit: number
    taxes: {
      estimatedIncomeTax: number
      estimatedVat: number
      estimatedSocialInsurance: number
      estimatedHealthInsurance: number
      total: number
    }
    netProfit: number
    profitMargin: number
  }
}

const monthNames = [
  'Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn',
  'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro',
]

const EXPENSE_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
]

export function ProfitLossChart({
  monthlyTrend,
  revenueBreakdown,
  expensesByCategory,
  profitLoss,
}: ProfitLossChartProps) {
  const chartData = monthlyTrend.map((item) => ({
    ...item,
    name: monthNames[item.month - 1],
  }))

  const totalRevenue = profitLoss.revenue.total
  const totalExpenses = profitLoss.expenses.total
  const grossProfit = profitLoss.grossProfit
  const netProfit = profitLoss.netProfit

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Příjmy</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Výdaje</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Hrubý zisk</span>
          </div>
          <p className={`text-xl font-bold ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(grossProfit)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <PieChartIcon className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Čistý zisk</span>
          </div>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {profitLoss.profitMargin.toFixed(1)}% marže
          </p>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Měsíční vývoj
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Příjmy"
                stroke="#10B981"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Výdaje"
                stroke="#EF4444"
                fill="url(#colorExpenses)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Zisk"
                stroke="#3B82F6"
                fill="url(#colorProfit)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Struktura příjmů
          </h3>
          {revenueBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Žádné příjmy v tomto období
            </div>
          )}
          <div className="mt-4 space-y-2">
            {revenueBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses by Category Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Výdaje podle kategorií
          </h3>
          {expensesByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expensesByCategory}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    type="number"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    stroke="#6B7280"
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="amount" name="Částka" radius={[0, 4, 4, 0]}>
                    {expensesByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Žádné výdaje v tomto období
            </div>
          )}
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Odhadované daně a pojištění
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Daň z příjmu</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(profitLoss.taxes.estimatedIncomeTax)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">DPH</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(profitLoss.taxes.estimatedVat)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Sociální pojištění</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(profitLoss.taxes.estimatedSocialInsurance)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Zdravotní pojištění</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(profitLoss.taxes.estimatedHealthInsurance)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="font-medium text-gray-700">Celkem daně a pojištění</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(profitLoss.taxes.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
