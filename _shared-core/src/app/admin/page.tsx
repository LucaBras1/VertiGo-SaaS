/**
 * Admin Dashboard Page
 *
 * Comprehensive dashboard with:
 * - Content statistics (performances, posts, etc.)
 * - Order & customer stats
 * - Upcoming events calendar
 * - Quick actions
 * - Recent activity
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Theater,
  Newspaper,
  Calendar,
  ShoppingCart,
  Users,
  FileText,
  Plus,
  Download,
  TrendingUp,
  Clock
} from 'lucide-react'

async function getDashboardStats() {
  try {
    // Fetch all stats in parallel
    const [
      totalOrders,
      newOrders,
      ordersWithPricing,
      totalCustomers,
      totalPerformances,
      draftPerformances,
      totalPosts,
      draftPosts,
      upcomingEvents,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'new' } }),
      prisma.order.findMany({
        select: {
          pricing: true
        }
      }),
      prisma.customer.count(),
      prisma.performance.count(),
      prisma.performance.count({ where: { status: 'draft' } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.event.findMany({
        where: {
          date: {
            gte: new Date()
          }
        },
        include: {
          performance: { select: { title: true } },
          game: { select: { title: true } }
        },
        orderBy: { date: 'asc' },
        take: 5
      }),
      prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          pricing: true,
          customerId: true,
          eventName: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    // Calculate total revenue from pricing JSON field
    const totalRevenue = ordersWithPricing.reduce((sum, order) => {
      if (order.pricing && typeof order.pricing === 'object') {
        const pricing = order.pricing as any
        return sum + (pricing.totalPrice || 0)
      }
      return sum
    }, 0)

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      orders: {
        total: totalOrders,
        new: newOrders,
        totalRevenue,
        avgOrderValue
      },
      customers: {
        total: totalCustomers
      },
      content: {
        performances: {
          total: totalPerformances,
          draft: draftPerformances,
          published: totalPerformances - draftPerformances
        },
        posts: {
          total: totalPosts,
          draft: draftPosts,
          published: totalPosts - draftPosts
        }
      },
      upcomingEvents,
      recentOrders
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  if (!stats) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Nepodařilo se načíst statistiky. Zkontrolujte připojení k databázi.
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Přehled produkce, obchodů a obsahu
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Rychlé akce
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">Nová objednávka</div>
              <div className="text-xs text-gray-500">Vytvořit novou</div>
            </div>
          </Link>

          <Link
            href="/admin/events/new"
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">Nová akce</div>
              <div className="text-xs text-gray-500">Přidat do kalendáře</div>
            </div>
          </Link>

          <Link
            href="/admin/posts/new"
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">Nová aktualita</div>
              <div className="text-xs text-gray-500">Vytvořit článek</div>
            </div>
          </Link>

          <Link
            href="/admin/performances/new"
            className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Theater className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">Nová inscenace</div>
              <div className="text-xs text-gray-500">Přidat představení</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Orders Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Objednávky
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.orders.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm flex items-center justify-between">
              <span className="text-orange-600 font-medium">{stats.orders.new} nových</span>
              <Link href="/admin/orders" className="text-blue-600 hover:text-blue-500 font-medium">
                Zobrazit →
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkové tržby
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.orders.totalRevenue).toLocaleString('cs-CZ')} Kč
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Průměr: {Math.round(stats.orders.avgOrderValue).toLocaleString('cs-CZ')} Kč
            </div>
          </div>
        </div>

        {/* Performances */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Theater className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inscenace
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.content.performances.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm flex items-center justify-between">
              <span className="text-gray-600">{stats.content.performances.draft} konceptů</span>
              <Link href="/admin/performances" className="text-blue-600 hover:text-blue-500 font-medium">
                Zobrazit →
              </Link>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Newspaper className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aktuality
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.content.posts.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="text-sm flex items-center justify-between">
              <span className="text-gray-600">{stats.content.posts.draft} konceptů</span>
              <Link href="/admin/posts" className="text-blue-600 hover:text-blue-500 font-medium">
                Zobrazit →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Nadcházející akce
            </h3>
            {stats.upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Žádné nadcházející akce</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {event.performance?.title || event.game?.title || 'Akce'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {(event.venue as any)?.name || (event.venue as any)?.city || 'Není uvedeno'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-blue-700">
                          {new Date(event.date).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                          Detail →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <Link
              href="/admin/events"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Zobrazit všechny akce →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Poslední aktivita
            </h3>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Žádná nedávná aktivita</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Objednávka #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.eventName || 'Bez názvu akce'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('cs-CZ', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {((order.pricing as any)?.totalPrice || 0).toLocaleString('cs-CZ')} Kč
                      </p>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Detail →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Zobrazit všechny objednávky →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
