'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, TrendingDown, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface AtRiskClient {
  id: string
  name: string
  email: string
  avatar: string | null
  riskScore: number
  riskLevel: 'critical' | 'high' | 'medium'
  daysSinceLastSession: number
  topRiskFactors: string[]
  suggestedAction: string
  urgency: string
}

interface AtRiskData {
  clients: AtRiskClient[]
  totalAtRisk: number
  summary: {
    critical: number
    high: number
    medium: number
  }
}

const riskColors = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
  },
}

export function AtRiskClients() {
  const [data, setData] = useState<AtRiskData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/at-risk')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching at-risk clients:', err)
      setError('Nepodařilo se načíst data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatLastSession = (days: number) => {
    if (days === 0) return 'Dnes'
    if (days === 1) return 'Včera'
    if (days < 7) return `Před ${days} dny`
    if (days < 30) return `Před ${Math.floor(days / 7)} týdny`
    return `Před ${Math.floor(days / 30)} měsíci`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ohrožení klienti</h2>
              <p className="text-sm text-gray-600">
                {data ? `${data.totalAtRisk} klientů vyžaduje pozornost` : 'Načítání...'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Obnovit"
          >
            <RefreshCw className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {data && data.totalAtRisk > 0 && (
          <div className="flex gap-3 mt-3">
            {data.summary.critical > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                {data.summary.critical} kritických
              </span>
            )}
            {data.summary.high > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                {data.summary.high} vysokých
              </span>
            )}
            {data.summary.medium > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                {data.summary.medium} středních
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Zkusit znovu
            </button>
          </div>
        ) : !data || data.clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium text-green-700">Skvělé!</p>
            <p className="text-sm">Žádní ohrožení klienti</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.clients.slice(0, 5).map((client) => {
              const colors = riskColors[client.riskLevel]
              return (
                <div
                  key={client.id}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {client.name}
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatLastSession(client.daysSinceLastSession)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                        {client.riskLevel === 'critical'
                          ? 'KRITICKÝ'
                          : client.riskLevel === 'high'
                          ? 'VYSOKÝ'
                          : 'STŘEDNÍ'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {client.riskScore}% riziko
                      </span>
                    </div>
                  </div>

                  {client.topRiskFactors.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                      <TrendingDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{client.topRiskFactors[0]}</span>
                    </div>
                  )}

                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className={`block w-full text-center text-sm font-medium py-2 rounded-lg transition-colors ${colors.text} bg-white hover:bg-gray-50 border ${colors.border}`}
                  >
                    {client.suggestedAction}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {data && data.totalAtRisk > 5 && (
          <Link
            href="/dashboard/clients?filter=at-risk"
            className="block w-full mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 py-2 text-center"
          >
            Zobrazit všech {data.totalAtRisk} ohrožených klientů
          </Link>
        )}
      </div>
    </div>
  )
}
