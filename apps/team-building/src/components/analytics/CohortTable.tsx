'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vertigo/ui'

interface CohortData {
  cohortLabel: string
  cohortSize: number
  retentionByMonth: number[]
}

interface CohortTableProps {
  cohorts: CohortData[]
  months: string[]
}

export function CohortTable({ cohorts, months }: CohortTableProps) {
  const getRetentionColor = (rate: number): string => {
    if (rate >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    if (rate >= 60) return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    if (rate >= 40) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    if (rate >= 20) return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    if (rate > 0) return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    return 'bg-neutral-50 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
  }

  return (
    <Card hover={false} animated={false}>
      <CardHeader>
        <CardTitle>Kohortová analýza</CardTitle>
        <CardDescription>Měsíční retence zákazníků podle doby registrace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Kohorta
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Pocet
                </th>
                {months.slice(0, 7).map((month) => (
                  <th
                    key={month}
                    className="text-center py-3 px-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 min-w-[60px]"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort, index) => (
                <tr
                  key={cohort.cohortLabel}
                  className={
                    index % 2 === 0
                      ? 'bg-neutral-50 dark:bg-neutral-800/50'
                      : 'bg-white dark:bg-neutral-900'
                  }
                >
                  <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {cohort.cohortLabel}
                  </td>
                  <td className="py-3 px-4 text-sm text-center text-neutral-600 dark:text-neutral-400">
                    {cohort.cohortSize}
                  </td>
                  {months.slice(0, 7).map((month, monthIndex) => {
                    const rate = cohort.retentionByMonth[monthIndex]
                    return (
                      <td key={month} className="py-3 px-2 text-center">
                        {rate !== undefined ? (
                          <span
                            className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getRetentionColor(rate)}`}
                          >
                            {rate.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">-</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap text-xs">
          <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
            {'\u2265'}80%
          </span>
          <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            60-80%
          </span>
          <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            40-60%
          </span>
          <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            20-40%
          </span>
          <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            &lt;20%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
