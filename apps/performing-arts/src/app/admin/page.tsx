import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  Clapperboard,
  Calendar,
  Users,
  Clock,
  Plus,
  ArrowRight,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

// Stats card component
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: any
  label: string
  value: string | number
  trend?: string
  color: 'primary' | 'accent' | 'green' | 'blue'
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    accent: 'bg-accent-100 text-accent-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm">{label}</p>
    </div>
  )
}

// Quick action card
function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
        <Icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600 transition-colors" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-primary-500 transition-colors" />
    </Link>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Director'}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Here's what's happening with your productions
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clapperboard}
          label="Active Productions"
          value="3"
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Rehearsals This Week"
          value="12"
          color="accent"
        />
        <StatCard
          icon={Users}
          label="Cast & Crew"
          value="47"
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Performances This Month"
          value="8"
          color="blue"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming rehearsals */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Rehearsals</h2>
            <Link
              href="/admin/rehearsals"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {/* Placeholder items */}
            {[
              {
                time: 'Today, 2:00 PM',
                title: 'Hamlet - Act 3 Blocking',
                location: 'Main Stage',
                cast: 8,
              },
              {
                time: 'Tomorrow, 10:00 AM',
                title: 'Hamlet - Scene Work',
                location: 'Rehearsal Room B',
                cast: 4,
              },
              {
                time: 'Thu, 6:00 PM',
                title: 'Hamlet - Full Run',
                location: 'Main Stage',
                cast: 15,
              },
            ].map((rehearsal, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{rehearsal.title}</p>
                  <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{rehearsal.time}</span>
                    <span className="w-1 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                    <span>{rehearsal.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300">
                    <Users className="w-4 h-4" />
                    {rehearsal.cast}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state (shown when no rehearsals) */}
          {/* <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">No upcoming rehearsals</p>
            <Link
              href="/admin/rehearsals/new"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-500 font-medium"
            >
              <Plus className="w-4 h-4" />
              Schedule a rehearsal
            </Link>
          </div> */}
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction
                icon={Plus}
                title="New Production"
                description="Start planning a new show"
                href="/admin/productions/new"
              />
              <QuickAction
                icon={Calendar}
                title="Schedule Rehearsal"
                description="Book rehearsal time"
                href="/admin/rehearsals/new"
              />
              <QuickAction
                icon={FileText}
                title="Generate Tech Rider"
                description="AI-powered tech requirements"
                href="/admin/tech-riders/generate"
              />
            </div>
          </div>

          {/* Active productions */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Active Productions</h2>
            <div className="space-y-3">
              {[
                { name: 'Hamlet', status: 'Rehearsing', progress: 65 },
                { name: 'A Midsummer Night\'s Dream', status: 'Pre-production', progress: 25 },
                { name: 'The Importance of Being Earnest', status: 'Planning', progress: 10 },
              ].map((production, i) => (
                <Link
                  key={i}
                  href={`/admin/productions/${i}`}
                  className="block p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{production.name}</h3>
                    <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                      {production.status}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${production.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
