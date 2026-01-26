'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

interface StatsData {
  activeClients: {
    value: number
    change: number
    trend: 'up' | 'down'
  }
  weekSessions: {
    value: number
    change: number
    trend: 'up' | 'down'
  }
  monthlyRevenue: {
    value: number
    formatted: string
    change: number
    trend: 'up' | 'down'
  }
  avgProgress: {
    value: number
    change: number
    trend: 'up' | 'down'
  }
}

const colorClasses = {
  primary: 'bg-primary-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        } else {
          setError('Nepodařilo se načíst statistiky')
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Chyba při načítání statistik')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="w-16 h-5 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error || 'Nepodařilo se načíst statistiky'}
      </div>
    )
  }

  const statItems = [
    {
      label: 'Active Clients',
      value: stats.activeClients.value.toString(),
      change: stats.activeClients.change,
      trend: stats.activeClients.trend,
      icon: Users,
      color: 'primary' as const,
    },
    {
      label: 'This Week Sessions',
      value: stats.weekSessions.value.toString(),
      change: stats.weekSessions.change,
      trend: stats.weekSessions.trend,
      icon: Calendar,
      color: 'blue' as const,
    },
    {
      label: 'Monthly Revenue',
      value: stats.monthlyRevenue.formatted,
      change: stats.monthlyRevenue.change,
      trend: stats.monthlyRevenue.trend,
      icon: DollarSign,
      color: 'green' as const,
    },
    {
      label: 'Avg. Client Progress',
      value: `${stats.avgProgress.value}%`,
      change: stats.avgProgress.change,
      trend: stats.avgProgress.trend,
      icon: TrendingUp,
      color: 'purple' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
        const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600'

        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colorClasses[stat.color]} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${trendColor} flex items-center gap-1`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
                <TrendIcon className="w-4 h-4" />
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
