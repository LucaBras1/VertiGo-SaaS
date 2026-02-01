'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface DashboardStats {
  stats: {
    activeEvents: number
    totalPerformers: number
    upcomingEventsCount: number
    completedEvents: number
    totalBookings: number
    totalClients: number
    revenue: number
  }
  upcomingEvents: Array<{
    id: string
    name: string
    date: string
    type: string
    status: string
    venue?: string
    client?: string
    performersCount: number
  }>
  recentActivity: Array<{
    id: string
    name: string
    type: string
    status: string
    updatedAt: string
    venue?: string
    bookingsCount: number
    tasksCount: number
  }>
}

export default function DashboardOverview() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const userName = session?.user?.name?.split(' ')[0] || 'there'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {
    activeEvents: 0,
    totalPerformers: 0,
    revenue: 0,
    completedEvents: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your events today</p>
        </div>

        <Link href="/dashboard/events/new" className="btn-primary inline-flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Active Events"
          value={stats.activeEvents.toString()}
          change={`${stats.completedEvents} completed`}
          gradient="from-primary-500 to-primary-600"
        />

        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Performers"
          value={stats.totalPerformers.toString()}
          change={`${data?.stats.totalBookings || 0} total bookings`}
          gradient="from-accent-500 to-accent-600"
        />

        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Revenue"
          value={`$${(stats.revenue / 1000).toFixed(1)}K`}
          change="From bookings"
          gradient="from-green-500 to-green-600"
        />

        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Clients"
          value={(data?.stats.totalClients || 0).toString()}
          change="Total clients"
          gradient="from-blue-500 to-blue-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link href="/dashboard/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {data?.upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
                <Link href="/dashboard/events/new" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                  Create your first event
                </Link>
              </div>
            ) : (
              data?.upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  name={event.name}
                  date={format(new Date(event.date), 'MMM d, yyyy')}
                  venue={event.venue || 'TBD'}
                  status={event.status as 'planning' | 'confirmed' | 'in_progress'}
                  performers={event.performersCount}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Tasks */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickActionButton
                icon={<Calendar />}
                label="Create Event"
                href="/dashboard/events/new"
              />
              <QuickActionButton
                icon={<Users />}
                label="Add Performer"
                href="/dashboard/performers"
              />
              <QuickActionButton
                icon={<Clock />}
                label="View Events"
                href="/dashboard/events"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {data?.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                data?.recentActivity.slice(0, 5).map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    title={activity.name}
                    time={format(new Date(activity.updatedAt), 'MMM d, h:mm a')}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  change,
  gradient
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  gradient: string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          <p className="text-sm text-gray-500 font-medium">{change}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function EventCard({
  id,
  name,
  date,
  venue,
  status,
  performers,
}: {
  id: string
  name: string
  date: string
  venue: string
  status: 'planning' | 'confirmed' | 'in_progress'
  performers: number
}) {
  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700'
  }

  const statusLabels = {
    planning: 'Planning',
    confirmed: 'Confirmed',
    in_progress: 'In Progress'
  }

  return (
    <Link href={`/dashboard/events/${id}`}>
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
          {date.slice(0, 3)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status] || statusColors.planning}`}>
              {statusLabels[status] || status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">{date} • {venue}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {performers} performers
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function QuickActionButton({
  icon,
  label,
  href
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
    >
      <span className="text-gray-600 group-hover:text-primary-600">{icon}</span>
      <span className="font-medium text-gray-900 group-hover:text-primary-600">{label}</span>
    </Link>
  )
}

function ActivityItem({
  icon,
  title,
  time
}: {
  icon: React.ReactNode
  title: string
  time: string
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}
