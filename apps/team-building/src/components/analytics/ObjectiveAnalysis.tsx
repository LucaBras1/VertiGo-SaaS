'use client'

import { Target } from 'lucide-react'
import { chartTheme } from '@vertigo/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface ObjectiveData {
  objective: string
  sessionCount: number
  percentage: number
  avgTeamSize: number
  topIndustries: string[]
}

interface ObjectiveAnalysisProps {
  data: ObjectiveData[]
}

const objectiveColorMap: Record<string, string> = {
  Komunikace: chartTheme.colors.secondary,
  'Budování důvěry': chartTheme.colors.success,
  Leadership: chartTheme.colors.series[5],
  'Řešení problémů': chartTheme.colors.warning,
  Kreativita: chartTheme.colors.series[4],
  Spolupráce: '#0EA5E9',
  'Řešení konfliktů': chartTheme.colors.error,
  Motivace: chartTheme.colors.warning,
}

export function ObjectiveAnalysis({ data }: ObjectiveAnalysisProps) {
  const maxCount = Math.max(...data.map((d) => d.sessionCount), 1)

  return (
    <Card hover={false} animated={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <CardTitle>Popularita cílů team buildingu</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 8).map((item, index) => {
            const widthPercent = (item.sessionCount / maxCount) * 100
            const barColor =
              objectiveColorMap[item.objective] ||
              chartTheme.colors.series[index % chartTheme.colors.series.length]
            return (
              <div key={item.objective}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.objective}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">{item.sessionCount} sessions</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(widthPercent, 3)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Prům. tým: {item.avgTeamSize.toFixed(0)} lidí</span>
                  {item.topIndustries.length > 0 && (
                    <span>Top odvětví: {item.topIndustries.slice(0, 2).join(', ')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {data.length === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
            Žádná data k zobrazení
          </p>
        )}
      </CardContent>
    </Card>
  )
}
