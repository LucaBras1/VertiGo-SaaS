import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

interface PackageStatusCount {
  status: string
  _count: number
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Execute all queries in parallel
    const [
      // Package statistics by status
      packagesByStatus,
      // Total packages this year
      totalPackagesThisYear,
      // Completed packages this year
      completedPackagesThisYear,
      // Upcoming shoots (next 30 days)
      upcomingShoots,
      // Galleries needing attention
      galleriesProcessing,
      galleriesReady,
      // Revenue statistics
      monthlyRevenue,
      yearlyRevenue,
      // Average package value
      avgPackageValue,
      // Recent activity
      recentPackages,
      recentShoots,
      // Deadline tracking
      upcomingDeadlines
    ] = await Promise.all([
      // Package status distribution
      prisma.package.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true
      }),

      // Total packages this year
      prisma.package.count({
        where: {
          tenantId,
          createdAt: { gte: startOfYear }
        }
      }),

      // Completed packages this year
      prisma.package.count({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: { gte: startOfYear }
        }
      }),

      // Upcoming shoots in next 30 days
      prisma.shoot.findMany({
        where: {
          tenantId,
          date: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          package: {
            include: { client: true }
          }
        },
        orderBy: { date: 'asc' },
        take: 10
      }),

      // Galleries in processing
      prisma.gallery.count({
        where: {
          shoot: { tenantId },
          status: 'PROCESSING'
        }
      }),

      // Galleries ready for delivery
      prisma.gallery.count({
        where: {
          shoot: { tenantId },
          status: 'READY'
        }
      }),

      // Monthly revenue (paid invoices this month)
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: { gte: startOfMonth }
        },
        _sum: { total: true }
      }),

      // Yearly revenue
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: { gte: startOfYear }
        },
        _sum: { total: true }
      }),

      // Average package value (completed packages)
      prisma.package.aggregate({
        where: {
          tenantId,
          status: 'COMPLETED',
          totalPrice: { not: null }
        },
        _avg: { totalPrice: true }
      }),

      // Recent packages (last 5)
      prisma.package.findMany({
        where: { tenantId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent/upcoming shoots (next 5)
      prisma.shoot.findMany({
        where: {
          tenantId,
          date: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: {
          package: { include: { client: true } }
        },
        orderBy: { date: 'asc' },
        take: 5
      }),

      // Upcoming deadlines (galleries with deadlines)
      prisma.gallery.findMany({
        where: {
          shoot: { tenantId },
          status: { in: ['PROCESSING', 'READY'] }
        },
        include: {
          shoot: {
            include: {
              package: { include: { client: true } }
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 5
      })
    ])

    // Calculate conversion rate (inquiry -> confirmed/completed)
    const statusCounts = packagesByStatus as PackageStatusCount[]
    const totalInquiries = statusCounts.find(s => s.status === 'INQUIRY')?._count || 0
    const confirmedOrCompleted = statusCounts
      .filter(s => ['CONFIRMED', 'COMPLETED'].includes(s.status))
      .reduce((sum, s) => sum + s._count, 0)
    const totalPackages = statusCounts.reduce((sum, s) => sum + s._count, 0)
    const conversionRate = totalPackages > 0
      ? Math.round((confirmedOrCompleted / totalPackages) * 100)
      : 0

    // Format package status for chart
    const packageStatusChart = {
      INQUIRY: statusCounts.find(s => s.status === 'INQUIRY')?._count || 0,
      QUOTE_SENT: statusCounts.find(s => s.status === 'QUOTE_SENT')?._count || 0,
      CONFIRMED: statusCounts.find(s => s.status === 'CONFIRMED')?._count || 0,
      IN_PRODUCTION: statusCounts.find(s => s.status === 'IN_PRODUCTION')?._count || 0,
      COMPLETED: statusCounts.find(s => s.status === 'COMPLETED')?._count || 0,
      CANCELLED: statusCounts.find(s => s.status === 'CANCELLED')?._count || 0
    }

    // Calculate production timeline for upcoming galleries
    const productionTimeline = upcomingDeadlines.map(gallery => ({
      id: gallery.id,
      title: gallery.shoot.package?.title || 'Untitled',
      clientName: gallery.shoot.package?.client?.name || 'Unknown',
      status: gallery.status,
      shootDate: gallery.shoot.date,
      createdAt: gallery.createdAt,
      // Estimate delivery date based on package delivery days
      estimatedDelivery: gallery.shoot.package?.deliveryDays
        ? new Date(gallery.shoot.date.getTime() + (gallery.shoot.package.deliveryDays * 24 * 60 * 60 * 1000))
        : null
    }))

    return NextResponse.json({
      // Summary metrics
      summary: {
        activePackages: packageStatusChart.INQUIRY + packageStatusChart.QUOTE_SENT + packageStatusChart.CONFIRMED,
        inProduction: packageStatusChart.IN_PRODUCTION,
        completedThisYear: completedPackagesThisYear,
        upcomingShootsCount: upcomingShoots.length,
        galleriesProcessing,
        galleriesReady,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        yearlyRevenue: yearlyRevenue._sum.total || 0,
        avgPackageValue: Math.round(avgPackageValue._avg.totalPrice || 0),
        conversionRate
      },

      // Chart data
      charts: {
        packageStatus: packageStatusChart,
        statusLabels: {
          INQUIRY: 'Poptávka',
          QUOTE_SENT: 'Nabídka odeslána',
          CONFIRMED: 'Potvrzeno',
          IN_PRODUCTION: 'Ve výrobě',
          COMPLETED: 'Dokončeno',
          CANCELLED: 'Zrušeno'
        }
      },

      // Lists
      upcomingShoots: upcomingShoots.map(shoot => ({
        id: shoot.id,
        date: shoot.date,
        location: shoot.locations?.[0] || null,
        packageTitle: shoot.package?.title || 'Untitled',
        clientName: shoot.package?.client?.name || 'Unknown',
        eventType: shoot.package?.eventType
      })),

      recentPackages: recentPackages.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        status: pkg.status,
        clientName: pkg.client?.name || 'Unknown',
        eventType: pkg.eventType,
        eventDate: pkg.eventDate,
        totalPrice: pkg.totalPrice,
        createdAt: pkg.createdAt
      })),

      productionTimeline,

      // Business metrics
      metrics: {
        totalPackagesThisYear,
        completedPackagesThisYear,
        conversionRate,
        avgPackageValue: avgPackageValue._avg.totalPrice || 0
      }
    })
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
