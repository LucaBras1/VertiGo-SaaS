'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, AlertTriangle, UserX, UserPlus } from 'lucide-react'

interface Segments {
  active: { count: number; percentage: number }
  atRisk: { count: number; percentage: number }
  churned: { count: number; percentage: number }
  new: { count: number; percentage: number }
}

interface TopClient {
  id: string
  name: string
  email: string
  totalRevenue: number
  sessionsCompleted: number
  memberSince: string
}

interface SegmentsResponse {
  segments: Segments
  topClients: TopClient[]
}

export function ClientSegments() {
  const [segments, setSegments] = useState<Segments | null>(null)
  const [topClients, setTopClients] = useState<TopClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/cohorts')
      if (response.ok) {
        const result: SegmentsResponse = await response.json()
        setSegments(result.segments)
        setTopClients(result.topClients)
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!segments) {
    return null
  }

  const total =
    segments.active.count + segments.atRisk.count + segments.churned.count + segments.new.count

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Segments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Segmentace klientu</h3>

        <div className="space-y-4">
          {/* Active */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">Aktivni</span>
                <span className="text-sm text-gray-600">
                  {segments.active.count} ({segments.active.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${segments.active.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* New */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">Novi (30 dni)</span>
                <span className="text-sm text-gray-600">
                  {segments.new.count} ({segments.new.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${segments.new.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* At Risk */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">V ohrozeni</span>
                <span className="text-sm text-gray-600">
                  {segments.atRisk.count} ({segments.atRisk.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${segments.atRisk.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Churned */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">Odesli</span>
                <span className="text-sm text-gray-600">
                  {segments.churned.count} ({segments.churned.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${segments.churned.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Celkem: {total} klientu
        </p>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Top klienti (dle LTV)</h3>

        {topClients.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Zadni klienti
          </div>
        ) : (
          <div className="space-y-3">
            {topClients.slice(0, 5).map((client, index) => (
              <div
                key={client.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{client.name}</p>
                  <p className="text-xs text-gray-500">
                    {client.sessionsCompleted} lekci
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(client.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-400">
                    od {new Date(client.memberSince).toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
