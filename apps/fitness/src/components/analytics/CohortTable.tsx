'use client'

import { useState, useEffect } from 'react'

interface CohortData {
  cohort: string
  totalClients: number
  retentionByMonth: number[]
}

interface CohortsResponse {
  cohorts: {
    cohorts: CohortData[]
    averageRetention: number[]
  }
}

export function CohortTable() {
  const [data, setData] = useState<CohortData[]>([])
  const [averageRetention, setAverageRetention] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/analytics/cohorts?months=12')
      if (response.ok) {
        const result: CohortsResponse = await response.json()
        setData(result.cohorts.cohorts)
        setAverageRetention(result.cohorts.averageRetention)
      }
    } catch (error) {
      console.error('Failed to fetch cohorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRetentionColor = (value: number) => {
    if (value >= 80) return 'bg-green-500 text-white'
    if (value >= 60) return 'bg-green-400 text-white'
    if (value >= 40) return 'bg-yellow-400 text-gray-900'
    if (value >= 20) return 'bg-orange-400 text-white'
    return 'bg-red-400 text-white'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Kohortova analyza</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Kohortova analyza</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Nedostatek dat pro kohortovou analyzu
        </div>
      </div>
    )
  }

  const maxMonths = Math.max(...data.map((c) => c.retentionByMonth.length))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Kohortova analyza</h3>
        <p className="text-sm text-gray-500">% klientu s aktivitou v danem mesici</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left font-medium text-gray-600">Kohorta</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Klientu</th>
              {Array.from({ length: maxMonths }).map((_, i) => (
                <th key={i} className="px-3 py-2 text-center font-medium text-gray-600">
                  M{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((cohort) => (
              <tr key={cohort.cohort} className="border-b border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-900">{cohort.cohort}</td>
                <td className="px-3 py-2 text-center text-gray-600">{cohort.totalClients}</td>
                {Array.from({ length: maxMonths }).map((_, i) => (
                  <td key={i} className="px-1 py-1 text-center">
                    {cohort.retentionByMonth[i] !== undefined ? (
                      <span
                        className={`inline-block w-12 px-2 py-1 rounded text-xs font-medium ${getRetentionColor(
                          cohort.retentionByMonth[i]
                        )}`}
                      >
                        {cohort.retentionByMonth[i].toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Average row */}
            <tr className="bg-gray-50 font-medium">
              <td className="px-3 py-2 text-gray-900">Prumer</td>
              <td className="px-3 py-2 text-center text-gray-600">-</td>
              {Array.from({ length: maxMonths }).map((_, i) => (
                <td key={i} className="px-1 py-1 text-center">
                  {averageRetention[i] !== undefined ? (
                    <span
                      className={`inline-block w-12 px-2 py-1 rounded text-xs font-medium ${getRetentionColor(
                        averageRetention[i]
                      )}`}
                    >
                      {averageRetention[i].toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="text-gray-500">Legenda:</span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-500"></span>
          80%+
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-400"></span>
          60-80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-yellow-400"></span>
          40-60%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-orange-400"></span>
          20-40%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-400"></span>
          &lt;20%
        </span>
      </div>
    </div>
  )
}
