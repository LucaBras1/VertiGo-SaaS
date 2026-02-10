'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Activity, Calendar } from 'lucide-react'
import { Card, hoverLift, staggerItem } from '@vertigo/ui'

const actions = [
  {
    title: 'Create Program',
    subtitle: 'Design a new team building program',
    href: '/admin/programs/new',
    icon: Users,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Add Activity',
    subtitle: 'Create a new team activity',
    href: '/admin/activities/new',
    icon: Activity,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Schedule Session',
    subtitle: 'Book a session for a client',
    href: '/admin/sessions/new',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.div key={action.title} variants={staggerItem}>
            <Link href={action.href}>
              <motion.div {...hoverLift}>
                <Card className="group cursor-pointer border-dashed transition-colors hover:border-brand-300 dark:hover:border-brand-700">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{action.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{action.subtitle}</p>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
