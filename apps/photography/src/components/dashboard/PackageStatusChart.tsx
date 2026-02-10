import { Badge, Card, CardDescription, CardHeader, CardTitle } from '@vertigo/ui'
'use client'

interface PackageStatusChartProps {
  data: {
    INQUIRY: number
    QUOTE_SENT: number
    CONFIRMED: number
    IN_PRODUCTION: number
    COMPLETED: number
    CANCELLED: number
  }
}

const statusConfig = {
  INQUIRY: { label: 'Poptávka', color: 'bg-gray-500', textColor: 'text-gray-700' },
  QUOTE_SENT: { label: 'Nabídka odeslána', color: 'bg-blue-500', textColor: 'text-blue-700' },
  CONFIRMED: { label: 'Potvrzeno', color: 'bg-amber-500', textColor: 'text-amber-700' },
  IN_PRODUCTION: { label: 'Ve výrobě', color: 'bg-purple-500', textColor: 'text-purple-700' },
  COMPLETED: { label: 'Dokončeno', color: 'bg-green-500', textColor: 'text-green-700' },
  CANCELLED: { label: 'Zrušeno', color: 'bg-red-500', textColor: 'text-red-700' }
}

export function PackageStatusChart({ data }: PackageStatusChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Package Status</CardTitle>
          <CardDescription>Distribution of packages by status</CardDescription>
        </CardHeader>
        <div className="flex items-center justify-center h-48 text-gray-500">
          No packages yet
        </div>
      </Card>
    )
  }

  // Calculate percentages and create segments
  const segments = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      status: status as keyof typeof statusConfig,
      count,
      percentage: (count / total) * 100
    }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Package Status</CardTitle>
            <CardDescription>Distribution of {total} packages</CardDescription>
          </div>
          <Badge variant="secondary">{total} total</Badge>
        </div>
      </CardHeader>

      <div className="space-y-6">
        {/* Donut Chart Visual */}
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {segments.reduce((acc, segment, index) => {
                const offset = acc.offset
                const circumference = 2 * Math.PI * 40
                const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`
                const strokeDashoffset = -offset * circumference / 100

                acc.elements.push(
                  <circle
                    key={segment.status}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    strokeWidth="12"
                    className={statusConfig[segment.status].color.replace('bg-', 'stroke-')}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                )

                acc.offset += segment.percentage
                return acc
              }, { elements: [] as JSX.Element[], offset: 0 }).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900">{total}</span>
                <span className="block text-xs text-gray-500">packages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {segments.map(({ status, count, percentage }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig[status].color}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {statusConfig[status].label}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
