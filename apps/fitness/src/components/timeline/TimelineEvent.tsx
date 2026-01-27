'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  CheckCircle,
  Calendar,
  XCircle,
  Ruler,
  Award,
  CreditCard,
  FileText,
  Package,
  Flag,
  Edit,
  UserPlus,
  RefreshCw,
  XOctagon,
  Gift,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent as TimelineEventType } from '@/lib/timeline/event-aggregator'

interface TimelineEventProps {
  event: TimelineEventType
  isLast?: boolean
  onEdit?: (event: TimelineEventType) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle,
  calendar: Calendar,
  'x-circle': XCircle,
  ruler: Ruler,
  award: Award,
  'credit-card': CreditCard,
  'file-text': FileText,
  package: Package,
  flag: Flag,
  edit: Edit,
  'user-plus': UserPlus,
  'refresh-cw': RefreshCw,
  'x-octagon': XOctagon,
  gift: Gift,
  circle: Circle,
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  gray: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
  },
  pink: {
    bg: 'bg-pink-500/20',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
}

function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    session_completed: 'check-circle',
    session_scheduled: 'calendar',
    session_cancelled: 'x-circle',
    measurement_recorded: 'ruler',
    badge_earned: 'award',
    invoice_paid: 'credit-card',
    invoice_created: 'file-text',
    package_purchased: 'package',
    milestone: 'flag',
    note: 'edit',
    client_created: 'user-plus',
    subscription_started: 'refresh-cw',
    subscription_cancelled: 'x-octagon',
    referral_made: 'gift',
  }
  return icons[type] || 'circle'
}

function getColorForType(type: string): string {
  const colors: Record<string, string> = {
    session_completed: 'green',
    session_scheduled: 'blue',
    session_cancelled: 'red',
    measurement_recorded: 'purple',
    badge_earned: 'yellow',
    invoice_paid: 'green',
    invoice_created: 'gray',
    package_purchased: 'blue',
    milestone: 'orange',
    note: 'gray',
    client_created: 'blue',
    subscription_started: 'green',
    subscription_cancelled: 'red',
    referral_made: 'pink',
  }
  return colors[type] || 'gray'
}

export function TimelineEventComponent({ event, isLast, onEdit }: TimelineEventProps) {
  const iconName = getIconForType(event.type)
  const color = getColorForType(event.type)
  const Icon = iconMap[iconName] || Circle
  const colors = colorClasses[color] || colorClasses.gray

  const formattedDate = format(new Date(event.date), 'd. MMMM yyyy', { locale: cs })
  const formattedTime = format(new Date(event.date), 'HH:mm')
  const relativeDate = formatDistanceToNow(new Date(event.date), {
    addSuffix: true,
    locale: cs,
  })

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-secondary-700" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          colors.bg,
          event.isMilestone && 'ring-2 ring-yellow-400'
        )}
      >
        <Icon className={cn('h-5 w-5', colors.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div
          className={cn(
            'bg-secondary-800 rounded-lg p-4 border',
            colors.border,
            event.isMilestone && 'border-yellow-500/50'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-medium text-white flex items-center gap-2">
                {event.title}
                {event.isMilestone && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                    Milník
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-400">
                {formattedDate} v {formattedTime}{' '}
                <span className="text-gray-500">({relativeDate})</span>
              </p>
            </div>
            {event.source === 'manual' && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-1 rounded-md hover:bg-secondary-700 text-gray-400 hover:text-white transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-300 text-sm mb-3">{event.description}</p>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.type === 'session_completed' && (
                <>
                  {event.metadata.duration && (
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                      {event.metadata.duration as number} min
                    </span>
                  )}
                  {event.metadata.caloriesBurned && (
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                      {event.metadata.caloriesBurned as number} kcal
                    </span>
                  )}
                  {event.metadata.intensity && (
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                      Intenzita: {event.metadata.intensity as string}
                    </span>
                  )}
                  {event.metadata.rating && (
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                      {'★'.repeat(event.metadata.rating as number)}
                    </span>
                  )}
                </>
              )}
              {event.type === 'measurement_recorded' && (
                <>
                  {event.metadata.weight && (
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                      Váha: {event.metadata.weight as number} kg
                    </span>
                  )}
                  {event.metadata.bodyFat && (
                    <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                      Tuk: {event.metadata.bodyFat as number}%
                    </span>
                  )}
                </>
              )}
              {event.type === 'badge_earned' && event.metadata.icon ? (
                <span
                  className="px-2 py-1 text-lg"
                  title={String(event.metadata.category ?? '')}
                >
                  {String(event.metadata.icon)}
                </span>
              ) : null}
              {(event.type === 'invoice_paid' || event.type === 'invoice_created') &&
                event.metadata.total ? (
                  <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-gray-300">
                    {Number(event.metadata.total)} CZK
                  </span>
                ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
