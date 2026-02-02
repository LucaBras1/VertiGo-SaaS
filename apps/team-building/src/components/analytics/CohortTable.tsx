'use client'

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
    if (rate >= 80) return 'bg-green-100 text-green-800'
    if (rate >= 60) return 'bg-green-50 text-green-700'
    if (rate >= 40) return 'bg-yellow-50 text-yellow-700'
    if (rate >= 20) return 'bg-orange-50 text-orange-700'
    if (rate > 0) return 'bg-red-50 text-red-700'
    return 'bg-gray-50 text-gray-400'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kohortová analýza</h3>
      <p className="text-sm text-gray-500 mb-4">Měsíční retence zákazníků podle doby registrace</p>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Kohorta</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Počet</th>
              {months.slice(0, 7).map((month) => (
                <th key={month} className="text-center py-3 px-2 text-sm font-medium text-gray-500 min-w-[60px]">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, index) => (
              <tr key={cohort.cohortLabel} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{cohort.cohortLabel}</td>
                <td className="py-3 px-4 text-sm text-center text-gray-600">{cohort.cohortSize}</td>
                {months.slice(0, 7).map((month, monthIndex) => {
                  const rate = cohort.retentionByMonth[monthIndex]
                  return (
                    <td key={month} className="py-3 px-2 text-center">
                      {rate !== undefined ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRetentionColor(rate)}`}>
                          {rate.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
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
        <span className="px-2 py-1 rounded bg-green-100 text-green-800">≥80%</span>
        <span className="px-2 py-1 rounded bg-green-50 text-green-700">60-80%</span>
        <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-700">40-60%</span>
        <span className="px-2 py-1 rounded bg-orange-50 text-orange-700">20-40%</span>
        <span className="px-2 py-1 rounded bg-red-50 text-red-700">&lt;20%</span>
      </div>
    </div>
  )
}
