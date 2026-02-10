'use client'

import { useState, useCallback } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addDays,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { useShoots, SHOOT_STATUS_COLORS, Shoot } from '@/hooks/useShoots'
import { ShootDetailModal } from '@/components/calendar/ShootDetailModal'
import { ShootFormModal } from '@/components/calendar/ShootFormModal'

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedShoot, setSelectedShoot] = useState<Shoot | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: shoots = [], isLoading, refetch } = useShoots()

  const getShootsForDay = useCallback((day: Date) => {
    return shoots.filter((shoot) =>
      isSameDay(parseISO(shoot.date), day)
    )
  }, [shoots])

  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

  const handleSlotClick = (day: Date) => {
    setSelectedDate(day)
    setIsFormModalOpen(true)
  }

  const handleShootClick = (shoot: Shoot, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedShoot(shoot)
    setIsDetailModalOpen(true)
  }

  const handleFormSaved = () => {
    setIsFormModalOpen(false)
    setSelectedDate(null)
    refetch()
  }

  const handleDetailClose = () => {
    setIsDetailModalOpen(false)
    setSelectedShoot(null)
  }

  const handleShootUpdated = () => {
    refetch()
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Calendar</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Schedule and manage photo shoots</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDate(null)
                setIsFormModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Shoot
            </button>
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            {/* Header - Days */}
            <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-700">
              <div className="p-3 border-r border-neutral-200 dark:border-neutral-700" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center border-r border-neutral-200 dark:border-neutral-700 last:border-r-0',
                    isSameDay(day, new Date()) && 'bg-amber-50'
                  )}
                >
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                    {format(day, 'EEE')}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isSameDay(day, new Date()) ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-neutral-100 dark:border-neutral-800 min-h-[60px]">
                  <div className="p-2 text-xs text-neutral-500 dark:text-neutral-400 text-right pr-3 border-r border-neutral-200 dark:border-neutral-700">
                    {hour}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayShoots = getShootsForDay(day).filter((shoot) => {
                      const [shootHour] = shoot.startTime.split(':').map(Number)
                      return shootHour === hour
                    })

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'p-1 border-r border-neutral-100 dark:border-neutral-800 last:border-r-0 min-h-[60px] cursor-pointer hover:bg-neutral-50 dark:bg-neutral-800',
                          isSameDay(day, new Date()) && 'bg-amber-50/30'
                        )}
                        onClick={() => handleSlotClick(day)}
                      >
                        {dayShoots.map((shoot) => (
                          <div
                            key={shoot.id}
                            className={cn(
                              'text-xs p-2 rounded border mb-1 cursor-pointer hover:opacity-80',
                              SHOOT_STATUS_COLORS[shoot.package.status] || 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-neutral-200'
                            )}
                            onClick={(e) => handleShootClick(shoot, e)}
                          >
                            <div className="font-medium truncate">{shoot.package.client.name}</div>
                            <div className="flex items-center gap-1 mt-1 text-[10px] opacity-80">
                              <Clock className="h-3 w-3" />
                              {shoot.startTime} - {shoot.endTime}
                            </div>
                            {shoot.venueName && (
                              <div className="text-[10px] opacity-80 truncate mt-0.5">
                                {shoot.venueName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600" />
            <span className="text-neutral-600 dark:text-neutral-400">Inquiry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
            <span className="text-neutral-600 dark:text-neutral-400">Quote Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
            <span className="text-neutral-600 dark:text-neutral-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-200 border border-amber-300" />
            <span className="text-neutral-600 dark:text-neutral-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
            <span className="text-neutral-600 dark:text-neutral-400">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Shoot Form Modal */}
      <ShootFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedDate(null)
        }}
        onSaved={handleFormSaved}
        defaultDate={selectedDate}
      />

      {/* Shoot Detail Modal */}
      <ShootDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailClose}
        shoot={selectedShoot}
        onShootUpdated={handleShootUpdated}
        onEditClick={() => {
          setIsDetailModalOpen(false)
          setSelectedShoot(selectedShoot)
          setIsFormModalOpen(true)
        }}
      />
    </>
  )
}
