'use client'

import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back, John! 👋</h1>
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
          value="12"
          change="+3 this month"
          gradient="from-primary-500 to-primary-600"
        />

        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Performers"
          value="48"
          change="+8 new"
          gradient="from-accent-500 to-accent-600"
        />

        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Revenue"
          value="$45.2K"
          change="+12% from last month"
          gradient="from-green-500 to-green-600"
        />

        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Satisfaction"
          value="98%"
          change="Above average"
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
            <EventCard
              name="Tech Summit 2024"
              date="Tomorrow, 9:00 AM"
              venue="Convention Center"
              status="confirmed"
              performers={5}
              guests={200}
            />

            <EventCard
              name="Corporate Gala Evening"
              date="Jan 28, 6:00 PM"
              venue="Grand Hotel Ballroom"
              status="in-progress"
              performers={8}
              guests={150}
            />

            <EventCard
              name="Summer Music Festival"
              date="Feb 5, 2:00 PM"
              venue="Riverside Park"
              status="planning"
              performers={12}
              guests={500}
            />
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
                href="/dashboard/performers/new"
              />
              <QuickActionButton
                icon={<Clock />}
                label="Generate Timeline"
                href="/dashboard/timeline"
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Today&apos;s Tasks</h2>
            <div className="space-y-3">
              <TaskItem
                title="Confirm venue booking"
                event="Tech Summit 2024"
                priority="high"
              />
              <TaskItem
                title="Send performer contracts"
                event="Corporate Gala"
                priority="medium"
              />
              <TaskItem
                title="Review timeline"
                event="Music Festival"
                priority="low"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            title="Timeline generated for Tech Summit 2024"
            time="2 hours ago"
          />
          <ActivityItem
            icon={<Users className="w-5 h-5 text-primary-600" />}
            title="3 performers confirmed for Corporate Gala"
            time="5 hours ago"
          />
          <ActivityItem
            icon={<AlertCircle className="w-5 h-5 text-accent-600" />}
            title="Payment received from client"
            time="Yesterday"
          />
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
          <p className="text-sm text-green-600 font-medium">{change}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function EventCard({
  name,
  date,
  venue,
  status,
  performers,
  guests
}: {
  name: string
  date: string
  venue: string
  status: 'planning' | 'confirmed' | 'in-progress'
  performers: number
  guests: number
}) {
  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
        {date.split(',')[0].slice(0, 3)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
            {status.replace('-', ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">{date} • {venue}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {performers} performers
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {guests} guests
          </span>
        </div>
      </div>
    </div>
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

function TaskItem({
  title,
  event,
  priority
}: {
  title: string
  event: string
  priority: 'high' | 'medium' | 'low'
}) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <input type="checkbox" className="mt-1" />
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{event}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
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
        <p className="text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  )
}
