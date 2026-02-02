'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface UpcomingReminder {
  type: 'gig' | 'invoice'
  id: string
  title: string
  date: string
  daysUntil: number
  priority: 'high' | 'medium' | 'low'
  metadata: {
    clientName?: string
    venue?: string
    invoiceNumber?: string
    amount?: number
  }
}

const priorityStyles = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
}

const priorityIcons = {
  high: AlertTriangle,
  medium: Clock,
  low: Bell,
}

export default function RemindersWidget() {
  const [reminders, setReminders] = useState<UpcomingReminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReminders() {
      try {
        const res = await fetch('/api/tenant/reminders?upcoming=true')
        const data = await res.json()

        if (data.success) {
          setReminders(data.data)
        }
      } catch (error) {
        console.error('Failed to load reminders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReminders()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Připomínky
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Připomínky
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Žádné nadcházející připomínky</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Připomínky
        </CardTitle>
        <span className="text-sm text-gray-500">{reminders.length} položek</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.slice(0, 5).map((reminder) => {
          const Icon = reminder.type === 'gig' ? Calendar : FileText
          const PriorityIcon = priorityIcons[reminder.priority]
          const href = reminder.type === 'gig'
            ? `/dashboard/gigs/${reminder.id}`
            : `/dashboard/invoices/${reminder.id}`

          const timeText = reminder.daysUntil === 0
            ? 'Dnes'
            : reminder.daysUntil === 1
            ? 'Zítra'
            : reminder.daysUntil === -1
            ? 'Včera'
            : reminder.daysUntil < 0
            ? `${Math.abs(reminder.daysUntil)} dní po splatnosti`
            : `Za ${reminder.daysUntil} dní`

          return (
            <Link key={`${reminder.type}-${reminder.id}`} href={href}>
              <div className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${priorityStyles[reminder.priority]}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-white/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{reminder.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                      <PriorityIcon className="w-3 h-3" />
                      <span>{timeText}</span>
                      {reminder.metadata.clientName && (
                        <>
                          <span>•</span>
                          <span>{reminder.metadata.clientName}</span>
                        </>
                      )}
                    </div>
                    {reminder.type === 'invoice' && reminder.metadata.amount && (
                      <p className="text-xs mt-1 font-medium">
                        {(reminder.metadata.amount / 100).toLocaleString('cs-CZ')} Kč
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                </div>
              </div>
            </Link>
          )
        })}

        {reminders.length > 5 && (
          <Link href="/dashboard/settings/reminders">
            <Button variant="ghost" className="w-full text-sm">
              Zobrazit všechny ({reminders.length})
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
