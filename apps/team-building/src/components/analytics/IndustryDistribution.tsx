'use client'

import { Building2 } from 'lucide-react'
import { chartTheme } from '@vertigo/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

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

const industryColorMap: Record<string, string> = {
  TECHNOLOGY: chartTheme.colors.primary,
  FINANCE: chartTheme.colors.success,
  HEALTHCARE: chartTheme.colors.error,
  EDUCATION: chartTheme.colors.warning,
  MANUFACTURING: '#64748B',
  RETAIL: '#8B5CF6',
  HOSPITALITY: '#EC4899',
  CONSULTING: '#6366F1',
  GOVERNMENT: '#0EA5E9',
  NONPROFIT: '#22C55E',
  OTHER: '#94A3B8',
}

export function IndustryDistribution({ data }: IndustryDistributionProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0)
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <Card hover={false} animated={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <CardTitle>Zákazníci podle odvětví</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map(([industry, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0
            const barColor = industryColorMap[industry] || '#94A3B8'
            return (
              <div key={industry}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {industryLabels[industry] || industry}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        {total === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
            Žádná data k zobrazení
          </p>
        )}
      </CardContent>
    </Card>
  )
}
