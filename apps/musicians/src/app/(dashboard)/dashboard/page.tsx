import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Music, DollarSign, TrendingUp, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data - will be replaced with real data from API
  const stats = [
    {
      title: 'Upcoming Gigs',
      value: '12',
      change: '+3 this week',
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Active Quotes',
      value: '5',
      change: '2 pending response',
      icon: Music,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      title: 'Monthly Revenue',
      value: '125,000 CZK',
      change: '+18% from last month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Quote Conversion',
      value: '67%',
      change: '+5% improvement',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const upcomingGigs = [
    {
      id: '1',
      title: 'Wedding - Smith & Johnson',
      date: '2026-02-15',
      time: '18:00',
      venue: 'Grand Hotel Prague',
      status: 'confirmed',
      price: 45000,
    },
    {
      id: '2',
      title: 'Corporate Event - Tech Corp',
      date: '2026-02-20',
      time: '19:30',
      venue: 'Conference Center Brno',
      status: 'confirmed',
      price: 38000,
    },
    {
      id: '3',
      title: 'Private Party',
      date: '2026-02-28',
      time: '20:00',
      venue: 'Villa Richter',
      status: 'pending',
      price: 35000,
    },
  ]

  const aiSuggestions = [
    {
      title: 'Update your repertoire',
      description: 'Add new songs to increase booking potential',
      action: 'Add Songs',
      href: '/dashboard/repertoire',
    },
    {
      title: 'Generate setlist for upcoming wedding',
      description: 'Smith & Johnson wedding on Feb 15',
      action: 'Generate',
      href: '/dashboard/setlists/new',
    },
    {
      title: 'Send overdue invoice reminder',
      description: '1 invoice is 7 days overdue',
      action: 'View',
      href: '/dashboard/invoices',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your gigs.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/gigs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Gig
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/setlists/new">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Setlist
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Gigs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Gigs</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/gigs">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingGigs.map((gig) => (
                <Link
                  key={gig.id}
                  href={`/dashboard/gigs/${gig.id}`}
                  className="block p-4 border rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{gig.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{gig.venue}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(gig.date).toLocaleDateString('cs-CZ')}</span>
                        <span>{gig.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          gig.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {gig.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-2">
                        {gig.price.toLocaleString('cs-CZ')} CZK
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              AI Suggestions
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
