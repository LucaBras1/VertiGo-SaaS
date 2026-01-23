'use client'

import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: 'Active Clients',
    value: '48',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'primary',
  },
  {
    label: 'This Week Sessions',
    value: '32',
    change: '+8%',
    trend: 'up',
    icon: Calendar,
    color: 'blue',
  },
  {
    label: 'Monthly Revenue',
    value: '$8,450',
    change: '+23%',
    trend: 'up',
    icon: DollarSign,
    color: 'green',
  },
  {
    label: 'Avg. Client Progress',
    value: '87%',
    change: '+5%',
    trend: 'up',
    icon: TrendingUp,
    color: 'purple',
  },
]

const colorClasses = {
  primary: 'bg-primary-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                {stat.change}
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
