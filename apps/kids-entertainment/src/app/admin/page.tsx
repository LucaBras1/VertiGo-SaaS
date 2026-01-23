/**
 * Admin Dashboard Homepage
 * Main dashboard with stats and overview
 */

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import DashboardStats from '@/components/admin/DashboardStats'
import UpcomingParties from '@/components/admin/UpcomingParties'
import RecentOrders from '@/components/admin/RecentOrders'

async function getDashboardData() {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get stats
  const [
    partiesThisMonth,
    totalCustomers,
    upcomingParties,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.party.count({
      where: {
        date: {
          gte: firstDayOfMonth,
        },
      },
    }),
    prisma.customer.count(),
    prisma.party.findMany({
      where: {
        date: {
          gte: now,
        },
        status: {
          in: ['inquiry', 'confirmed'],
        },
      },
      include: {
        package: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    }),
    prisma.order.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    prisma.orderItem.aggregate({
      where: {
        order: {
          createdAt: {
            gte: firstDayOfMonth,
          },
          status: {
            not: 'cancelled',
          },
        },
      },
      _sum: {
        price: true,
      },
    }),
  ])

  return {
    stats: {
      partiesThisMonth,
      revenue: monthlyRevenue._sum.price || 0,
      customers: totalCustomers,
      upcomingParties: upcomingParties.length,
    },
    upcomingParties,
    recentOrders,
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Přehled vašeho PartyPal podnikání
        </p>
      </div>

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingParties parties={data.upcomingParties} />
        <RecentOrders orders={data.recentOrders} />
      </div>
    </div>
  )
}
