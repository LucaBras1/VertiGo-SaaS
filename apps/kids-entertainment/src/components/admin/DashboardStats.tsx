/**
 * Dashboard Stats Component
 * Displays key metrics in card format
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down'
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card variant="hover" className="border-2 border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {change && (
              <p
                className={`text-sm mt-2 flex items-center ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 mr-1 ${
                    trend === 'down' ? 'rotate-180' : ''
                  }`}
                />
                {change}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-partypal-pink-100 to-sky-100 rounded-xl flex items-center justify-center text-partypal-pink-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardStats({
  stats,
}: {
  stats: {
    partiesThisMonth: number
    revenue: number
    customers: number
    upcomingParties: number
  }
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Oslavy tento měsíc"
        value={stats.partiesThisMonth}
        change="+12% oproti minulému měsíci"
        icon={<Calendar className="w-6 h-6" />}
        trend="up"
      />
      <StatCard
        title="Tržby"
        value={`${stats.revenue.toLocaleString('cs-CZ')} Kč`}
        change="+8% oproti minulému měsíci"
        icon={<DollarSign className="w-6 h-6" />}
        trend="up"
      />
      <StatCard
        title="Zákazníci"
        value={stats.customers}
        change="+5 nových tento měsíc"
        icon={<Users className="w-6 h-6" />}
        trend="up"
      />
      <StatCard
        title="Nadcházející oslavy"
        value={stats.upcomingParties}
        icon={<Calendar className="w-6 h-6" />}
      />
    </div>
  )
}
