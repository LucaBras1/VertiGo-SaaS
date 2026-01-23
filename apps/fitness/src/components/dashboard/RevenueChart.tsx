'use client'

import { TrendingUp, DollarSign } from 'lucide-react'

export function RevenueChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const revenue = [5200, 6100, 5800, 7200, 7900, 8450]
  const maxRevenue = Math.max(...revenue)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-600">Last 6 months</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <TrendingUp className="w-4 h-4" />
            +23% vs last period
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Simple bar chart */}
        <div className="flex items-end justify-between gap-4 h-48">
          {months.map((month, index) => {
            const heightPercent = (revenue[index] / maxRevenue) * 100
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full">
                  <div className="absolute -top-8 left-0 right-0 text-center text-xs font-medium text-gray-700">
                    ${(revenue[index] / 1000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">{month}</span>
              </div>
            )
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-600 mb-1">Average</p>
            <p className="text-lg font-semibold text-gray-900">$6,775</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Best Month</p>
            <p className="text-lg font-semibold text-gray-900">$8,450</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Growth</p>
            <p className="text-lg font-semibold text-green-600">+62%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
