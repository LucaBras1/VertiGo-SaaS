'use client'

import { Target } from 'lucide-react'

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

const objectiveColors: Record<string, string> = {
  Komunikace: 'bg-blue-500',
  'Budování důvěry': 'bg-green-500',
  Leadership: 'bg-purple-500',
  'Řešení problémů': 'bg-orange-500',
  Kreativita: 'bg-pink-500',
  Spolupráce: 'bg-cyan-500',
  'Řešení konfliktů': 'bg-red-500',
  Motivace: 'bg-yellow-500',
}

export function ObjectiveAnalysis({ data }: ObjectiveAnalysisProps) {
  const maxCount = Math.max(...data.map((d) => d.sessionCount), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Popularita cílů team buildingu</h3>
      </div>
      <div className="space-y-4">
        {data.slice(0, 8).map((item) => {
          const widthPercent = (item.sessionCount / maxCount) * 100
          return (
            <div key={item.objective}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{item.objective}</span>
                <span className="text-gray-500">{item.sessionCount} sessions</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${objectiveColors[item.objective] || 'bg-gray-400'}`}
                  style={{ width: `${Math.max(widthPercent, 3)}%` }}
                />
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span>Prům. tým: {item.avgTeamSize.toFixed(0)} lidí</span>
                {item.topIndustries.length > 0 && (
                  <span>Top odvětví: {item.topIndustries.slice(0, 2).join(', ')}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {data.length === 0 && <p className="text-center text-gray-500 py-4">Žádná data k zobrazení</p>}
    </div>
  )
}
