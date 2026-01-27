'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Shoot {
  id: string
  date: string
  location: string | null
  startTime: string | null
  endTime: string | null
  notes: string | null
  package: {
    id: string
    title: string
    eventType: string | null
    client: {
      name: string
    } | null
  } | null
}

interface ShootCalendarProps {
  shoots: Shoot[]
  onNewShoot?: () => void
}

const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

const eventTypeColors: Record<string, string> = {
  WEDDING: 'bg-pink-500',
  PORTRAIT: 'bg-blue-500',
  FAMILY: 'bg-green-500',
  CORPORATE: 'bg-gray-500',
  EVENT: 'bg-purple-500',
  PRODUCT: 'bg-amber-500',
  OTHER: 'bg-teal-500'
}

export function ShootCalendar({ shoots, onNewShoot }: ShootCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = []

    // Add empty cells for days before the first
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [year, month, daysInMonth, startDay])

  // Group shoots by date
  const shootsByDate = useMemo(() => {
    const map = new Map<string, Shoot[]>()
    shoots.forEach(shoot => {
      const dateKey = new Date(shoot.date).toISOString().split('T')[0]
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(shoot)
    })
    return map
  }, [shoots])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getShootsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return shootsByDate.get(dateKey) || []
  }

  const selectedDateShoots = selectedDate ? getShootsForDate(selectedDate) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Dnes
            </Button>
            {onNewShoot && (
              <Button size="sm" onClick={onNewShoot}>
                <Plus className="w-4 h-4 mr-1" />
                Nové focení
              </Button>
            )}
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map(day => (
            <div
              key={day}
              className="px-2 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-24 border-b border-r border-gray-100 bg-gray-50"
                />
              )
            }

            const dateShoots = getShootsForDate(date)
            const isSelected =
              selectedDate &&
              date.toISOString().split('T')[0] ===
                selectedDate.toISOString().split('T')[0]

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  h-24 p-1 border-b border-r border-gray-100 text-left
                  hover:bg-gray-50 transition-colors
                  ${isSelected ? 'bg-amber-50 ring-2 ring-amber-500 ring-inset' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`
                      inline-flex items-center justify-center w-6 h-6 text-sm rounded-full
                      ${isToday(date) ? 'bg-amber-500 text-white font-bold' : 'text-gray-700'}
                    `}
                  >
                    {date.getDate()}
                  </span>

                  <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                    {dateShoots.slice(0, 3).map(shoot => (
                      <div
                        key={shoot.id}
                        className={`
                          text-xs px-1 py-0.5 rounded truncate text-white
                          ${eventTypeColors[shoot.package?.eventType || 'OTHER']}
                        `}
                      >
                        {shoot.package?.client?.name || shoot.package?.title || 'Focení'}
                      </div>
                    ))}
                    {dateShoots.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dateShoots.length - 3} další
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar - Selected Date Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">
          {selectedDate
            ? selectedDate.toLocaleDateString('cs-CZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })
            : 'Vyberte den'}
        </h3>

        {selectedDate && selectedDateShoots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Camera className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Žádné focení tento den</p>
            {onNewShoot && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onNewShoot}
              >
                <Plus className="w-4 h-4 mr-1" />
                Přidat focení
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {selectedDateShoots.map(shoot => (
            <Link
              key={shoot.id}
              href={`/dashboard/shoots/${shoot.id}`}
              className="block p-3 border border-gray-200 rounded-lg hover:border-amber-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {shoot.package?.title || 'Focení'}
                    </span>
                    {shoot.package?.eventType && (
                      <Badge
                        variant="secondary"
                        className={`${eventTypeColors[shoot.package.eventType]} text-white`}
                      >
                        {shoot.package.eventType}
                      </Badge>
                    )}
                  </div>
                  {shoot.package?.client && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {shoot.package.client.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-1 text-sm text-gray-500">
                {(shoot.startTime || shoot.endTime) && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {shoot.startTime || '?'}
                      {shoot.endTime && ` - ${shoot.endTime}`}
                    </span>
                  </div>
                )}
                {shoot.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shoot.location}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legenda</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(eventTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color}`} />
                <span className="text-gray-600">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
