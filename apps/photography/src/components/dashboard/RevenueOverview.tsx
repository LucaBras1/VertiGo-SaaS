import { prisma } from '@/lib/prisma'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge, Card, CardDescription, CardHeader, CardTitle } from '@vertigo/ui'

async function getRevenueData(tenantId: string) {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Get paid invoices from the last 6 months
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: 'PAID',
      paidAt: {
        gte: sixMonthsAgo
      }
    },
    select: {
      total: true,
      paidAt: true
    }
  })

  // Group by month
  const monthlyData: { [key: string]: number } = {}
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    monthlyData[key] = 0
  }

  // Sum up revenue per month
  invoices.forEach(invoice => {
    if (invoice.paidAt) {
      const date = new Date(invoice.paidAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += invoice.total
      }
    }
  })

  // Convert to array format
  const data = Object.entries(monthlyData).map(([key, revenue]) => {
    const [year, month] = key.split('-').map(Number)
    return {
      month: monthNames[month],
      revenue: Math.round(revenue / 100) // Convert cents to dollars
    }
  })

  // Calculate growth
  const currentMonth = data[data.length - 1]?.revenue || 0
  const previousMonth = data[data.length - 2]?.revenue || 0
  const growth = previousMonth > 0
    ? ((currentMonth - previousMonth) / previousMonth) * 100
    : 0

  return { data, growth }
}

export async function RevenueOverview({ tenantId }: { tenantId: string }) {
  const { data: monthlyData, growth } = await getRevenueData(tenantId)

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)
  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0)
  const avgRevenue = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </div>
          <Badge variant={growth >= 0 ? 'success' : 'danger'}>
            {growth >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(avgRevenue).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Peak</p>
            <p className="text-2xl font-bold text-gray-900">
              ${maxRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-3">
          {monthlyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No revenue data yet</p>
            </div>
          ) : (
            monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <span className="text-gray-900 font-semibold">${data.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
