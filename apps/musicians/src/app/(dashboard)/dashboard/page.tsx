'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Music, DollarSign, TrendingUp, Plus, Sparkles, FileText, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DashboardStats {
  upcomingGigs: number
  pendingQuotes: number
  monthlyRevenue: number
  totalClients: number
  quoteConversionRate: number
}

interface Gig {
  id: string
  title: string
  eventDate: string
  startTime?: string
  venueName?: string
  status: string
  agreedPrice?: number
}

interface Invoice {
  id: string
  status: string
  paidDate?: string
  totalAmount: number
}

interface RevenueDataPoint {
  month: string
  revenue: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingGigs: 0,
    pendingQuotes: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    quoteConversionRate: 0,
  })
  const [upcomingGigs, setUpcomingGigs] = useState<Gig[]>([])
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [gigsRes, clientsRes, invoicesRes] = await Promise.all([
        fetch('/api/gigs'),
        fetch('/api/clients'),
        fetch('/api/invoices'),
      ])

      const gigsData = gigsRes.ok ? await gigsRes.json() : { gigs: [] }
      const clientsData = clientsRes.ok ? await clientsRes.json() : { clients: [] }
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { invoices: [] }

      const gigs = gigsData.gigs || []
      const clients = clientsData.clients || []
      const invoices = invoicesData.invoices || []

      // Calculate stats
      const now = new Date()
      const upcoming = gigs.filter((g: Gig) => new Date(g.eventDate) >= now && g.status !== 'CANCELLED')
      const pending = gigs.filter((g: Gig) => g.status === 'INQUIRY' || g.status === 'QUOTE_SENT')

      // Quote conversion rate: CONFIRMED + COMPLETED / (QUOTE_SENT + CONFIRMED + COMPLETED)
      const quoteSent = gigs.filter((g: Gig) => g.status === 'QUOTE_SENT').length
      const confirmed = gigs.filter((g: Gig) => g.status === 'CONFIRMED').length
      const completed = gigs.filter((g: Gig) => g.status === 'COMPLETED').length
      const totalQuotes = quoteSent + confirmed + completed
      const conversionRate = totalQuotes > 0
        ? Math.round(((confirmed + completed) / totalQuotes) * 100)
        : 0

      // Monthly revenue from paid invoices
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyPaid = invoices
        .filter((inv: Invoice) => inv.status === 'paid' && inv.paidDate && new Date(inv.paidDate) >= monthStart)
        .reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0)

      // Calculate revenue data for the last 6 months
      const revenueByMonth: RevenueDataPoint[] = []
      const monthNames = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro']

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const monthRevenue = invoices
          .filter((inv: Invoice) => {
            if (inv.status !== 'paid' || !inv.paidDate) return false
            const paidDate = new Date(inv.paidDate)
            return paidDate >= monthDate && paidDate <= monthEnd
          })
          .reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0)

        revenueByMonth.push({
          month: monthNames[monthDate.getMonth()],
          revenue: monthRevenue / 100,
        })
      }

      setRevenueData(revenueByMonth)

      setStats({
        upcomingGigs: upcoming.length,
        pendingQuotes: pending.length,
        monthlyRevenue: monthlyPaid,
        totalClients: clients.length,
        quoteConversionRate: conversionRate,
      })

      // Get next 3 upcoming gigs
      setUpcomingGigs(
        upcoming
          .sort((a: Gig, b: Gig) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 3)
      )
    } catch (error) {
      console.error('Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Nadcházející gigy',
      value: stats.upcomingGigs.toString(),
      change: 'potvrzené zakázky',
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Čekající nabídky',
      value: stats.pendingQuotes.toString(),
      change: 'k vyřízení',
      icon: Music,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      title: 'Měsíční příjem',
      value: formatCurrency(stats.monthlyRevenue / 100),
      change: 'tento měsíc',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Celkem klientů',
      value: stats.totalClients.toString(),
      change: 'v databázi',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const aiSuggestions = [
    {
      title: 'Aktualizujte repertoár',
      description: 'Přidejte nové písně pro více zakázek',
      action: 'Přidat písně',
      href: '/dashboard/repertoire',
    },
    {
      title: 'Vygenerujte setlist',
      description: 'AI vytvoří optimální playlist',
      action: 'Generovat',
      href: '/dashboard/setlists/generate',
    },
    {
      title: 'Zkontrolujte faktury',
      description: 'Sledujte stav plateb',
      action: 'Zobrazit',
      href: '/dashboard/invoices',
    },
  ]

  const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' }> = {
    INQUIRY: { label: 'Poptávka', variant: 'default' },
    QUOTE_SENT: { label: 'Nabídka', variant: 'warning' },
    CONFIRMED: { label: 'Potvrzeno', variant: 'success' },
    COMPLETED: { label: 'Dokončeno', variant: 'default' },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Vítejte zpět! Zde je přehled vašich zakázek.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/gigs/new">
              <Plus className="w-4 h-4 mr-2" />
              Nový gig
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/setlists/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generovat setlist
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart & Quote Conversion */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Vývoj příjmů
              </CardTitle>
              <span className="text-sm text-gray-500">posledních 6 měsíců</span>
            </div>
          </CardHeader>
          <CardContent>
            {revenueData.every((d) => d.revenue === 0) ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Zatím žádné příjmy</p>
                <p className="text-sm text-gray-500 mt-1">Grafy se zobrazí po prvních zaplacených fakturách</p>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), 'Příjem']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Úspěšnost nabídek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#8B5CF6"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.quoteConversionRate / 100) * 352} 352`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-gray-900">
                  {stats.quoteConversionRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Podíl potvrzených nabídek
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ze všech odeslaných cenových nabídek
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Gigs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nadcházející gigy</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/gigs">Zobrazit vše</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingGigs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Žádné nadcházející gigy</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/dashboard/gigs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Vytvořit gig
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingGigs.map((gig) => {
                  const status = statusConfig[gig.status] || statusConfig.INQUIRY
                  return (
                    <Link
                      key={gig.id}
                      href={`/dashboard/gigs/${gig.id}`}
                      className="block p-4 border rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{gig.title}</h4>
                          {gig.venueName && (
                            <p className="text-sm text-gray-600 mt-1">{gig.venueName}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{formatDate(new Date(gig.eventDate))}</span>
                            {gig.startTime && <span>{gig.startTime}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {gig.agreedPrice && (
                            <p className="text-sm font-semibold text-gray-900 mt-2">
                              {formatCurrency(gig.agreedPrice / 100)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Doporučení
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:border-primary-300 transition"
                >
                  <h4 className="font-medium text-gray-900 text-sm">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    asChild
                  >
                    <Link href={suggestion.href}>{suggestion.action}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
