import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Calendar, Package, Images, DollarSign } from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/Card'
import { UpcomingShoots } from '@/components/dashboard/UpcomingShoots'
import { RecentClients } from '@/components/dashboard/RecentClients'
import { GalleryStatus } from '@/components/dashboard/GalleryStatus'
import { RevenueOverview } from '@/components/dashboard/RevenueOverview'
import { prisma } from '@/lib/prisma'

async function getDashboardStats(tenantId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    activePackages,
    upcomingShoots,
    processingGalleries,
    readyGalleries,
    monthlyRevenue,
    lastMonthRevenue
  ] = await Promise.all([
    // Active packages (INQUIRY, QUOTE_SENT, CONFIRMED)
    prisma.package.count({
      where: {
        tenantId,
        status: { in: ['INQUIRY', 'QUOTE_SENT', 'CONFIRMED'] }
      }
    }),
    // Upcoming shoots
    prisma.shoot.count({
      where: {
        tenantId,
        date: { gte: now }
      }
    }),
    // Processing galleries
    prisma.gallery.count({
      where: {
        shoot: { tenantId },
        status: 'PROCESSING'
      }
    }),
    // Ready galleries
    prisma.gallery.count({
      where: {
        shoot: { tenantId },
        status: 'READY'
      }
    }),
    // Revenue this month (from paid invoices)
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: 'PAID',
        paidAt: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    // Revenue last month
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: 'PAID',
        paidAt: {
          gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          lt: startOfMonth
        }
      },
      _sum: { total: true }
    })
  ])

  const currentRevenue = monthlyRevenue._sum.total || 0
  const previousRevenue = lastMonthRevenue._sum.total || 0
  const revenueChange = previousRevenue > 0
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : 0

  return {
    activePackages,
    upcomingShoots,
    processingGalleries,
    readyGalleries,
    monthlyRevenue: currentRevenue,
    revenueChange
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount / 100)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const stats = await getDashboardStats(session.user.tenantId)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your photography business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Packages"
          value={stats.activePackages.toString()}
          change="In progress"
          icon={<Package className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Upcoming Shoots"
          value={stats.upcomingShoots.toString()}
          change="Scheduled"
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Galleries Processing"
          value={stats.processingGalleries.toString()}
          change={`${stats.readyGalleries} ready to deliver`}
          icon={<Images className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Revenue (MTD)"
          value={formatCurrency(stats.monthlyRevenue)}
          change={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}% vs last month`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingShoots tenantId={session.user.tenantId} />
        <GalleryStatus tenantId={session.user.tenantId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueOverview tenantId={session.user.tenantId} />
        </div>
        <RecentClients tenantId={session.user.tenantId} />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
  color
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: 'amber' | 'blue' | 'green' | 'purple'
}) {
  const colorStyles = {
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{change}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
