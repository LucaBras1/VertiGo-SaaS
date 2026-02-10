'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { staggerContainer, staggerItem } from '@vertigo/ui'

interface SessionData {
  id: string
  companyName: string | null
  teamName: string | null
  date: Date | string
  status: string
  teamSize: number | null
  program: { title: string } | null
}

interface UpcomingSessionsProps {
  sessions: SessionData[]
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  confirmed: { icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50 dark:bg-success-950/50', label: 'Confirmed' },
  tentative: { icon: Clock, color: 'text-warning-600', bg: 'bg-warning-50 dark:bg-warning-950/50', label: 'Tentative' },
  cancelled: { icon: AlertCircle, color: 'text-error-600', bg: 'bg-error-50 dark:bg-error-950/50', label: 'Cancelled' },
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
          No upcoming sessions in the next 30 days
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Sessions</h2>
        <Link
          href="/admin/sessions"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View All
        </Link>
      </div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="divide-y divide-neutral-100 dark:divide-neutral-800"
      >
        {sessions.map((session) => {
          const name = session.companyName || session.teamName || 'Unnamed Session'
          const config = statusConfig[session.status] || statusConfig.tentative
          const StatusIcon = config.icon

          return (
            <motion.div
              key={session.id}
              variants={staggerItem}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                {getInitials(name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {session.program && ` \u2022 ${session.program.title}`}
                </p>
              </div>

              {/* Right: participants + status */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {session.teamSize || '?'} people
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </Card>
  )
}
