'use client'

import { Building2 } from 'lucide-react'

interface IndustryDistributionProps {
  data: Record<string, number>
}

const industryLabels: Record<string, string> = {
  TECHNOLOGY: 'Technologie',
  FINANCE: 'Finance',
  HEALTHCARE: 'Zdravotnictví',
  EDUCATION: 'Vzdělávání',
  MANUFACTURING: 'Výroba',
  RETAIL: 'Retail',
  HOSPITALITY: 'Hotelnictví',
  CONSULTING: 'Consulting',
  GOVERNMENT: 'Veřejný sektor',
  NONPROFIT: 'Neziskový sektor',
  OTHER: 'Ostatní',
}

const industryColors: Record<string, string> = {
  TECHNOLOGY: 'bg-blue-500',
  FINANCE: 'bg-green-500',
  HEALTHCARE: 'bg-red-500',
  EDUCATION: 'bg-yellow-500',
  MANUFACTURING: 'bg-gray-500',
  RETAIL: 'bg-purple-500',
  HOSPITALITY: 'bg-pink-500',
  CONSULTING: 'bg-indigo-500',
  GOVERNMENT: 'bg-cyan-500',
  NONPROFIT: 'bg-emerald-500',
  OTHER: 'bg-slate-400',
}

export function IndustryDistribution({ data }: IndustryDistributionProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0)
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Zákazníci podle odvětví</h3>
      </div>
      <div className="space-y-3">
        {sorted.map(([industry, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={industry}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{industryLabels[industry] || industry}</span>
                <span className="text-gray-500">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${industryColors[industry] || 'bg-gray-400'}`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {total === 0 && <p className="text-center text-gray-500 py-4">Žádná data k zobrazení</p>}
    </div>
  )
}
