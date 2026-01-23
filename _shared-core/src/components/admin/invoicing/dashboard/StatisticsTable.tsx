'use client'

/**
 * Statistics Table Component
 *
 * Displays monthly breakdown of invoicing statistics
 */

import { RevenueChartData, formatAmount } from '@/types/invoicing'

interface StatisticsTableProps {
  data: RevenueChartData
  year: number
}

const monthNames = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

export function StatisticsTable({ data, year }: StatisticsTableProps) {
  // Filter data for selected year
  const yearData = data.data.filter(d => d.year === year)

  // Calculate totals
  const totals = yearData.reduce(
    (acc, d) => ({
      invoiced: acc.invoiced + d.totalInvoiced,
      paid: acc.paid + d.totalPaid,
      unpaid: acc.unpaid + d.totalUnpaid,
    }),
    { invoiced: 0, paid: 0, unpaid: 0 }
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Měsíc
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Fakturováno
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Uhrazeno
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
              Neuhrazeno
            </th>
          </tr>
        </thead>
        <tbody>
          {yearData.map((row, index) => (
            <tr
              key={row.month}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="py-3 px-4 text-gray-900 dark:text-white">
                {monthNames[index] || row.monthName}
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                {formatAmount(row.totalInvoiced)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-green-600 dark:text-green-400">
                {formatAmount(row.totalPaid)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-red-600 dark:text-red-400">
                {row.totalUnpaid > 0 ? formatAmount(row.totalUnpaid) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
            <td className="py-3 px-4 text-gray-900 dark:text-white">
              Celkem {year}
            </td>
            <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
              {formatAmount(totals.invoiced)}
            </td>
            <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
              {formatAmount(totals.paid)}
            </td>
            <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
              {totals.unpaid > 0 ? formatAmount(totals.unpaid) : '-'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
