'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MoreHorizontal,
  Check,
  X,
  Edit,
  Trash2,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
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
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { BookSessionModal } from '@/components/sessions/BookSessionModal'
import { SessionDetailModal } from '@/components/sessions/SessionDetailModal'

interface Session {
  id: string
  scheduledAt: string
  duration: number
  status: string
  muscleGroups: string[]
  price: number | null
  paid: boolean
  workoutPlan?: unknown
  trainerNotes?: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 border-blue-300 text-blue-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-800',
  no_show: 'bg-red-100 border-red-300 text-red-800',
}

const statusLabels: Record<string, string> = {
  scheduled: 'Naplánováno',
  completed: 'Dokončeno',
  cancelled: 'Zrušeno',
  no_show: 'Nepřišel',
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 })
      const end = endOfWeek(currentWeek, { weekStartsOn: 1 })

      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: addDays(end, 1).toISOString(),
      })

      const response = await fetch(`/api/sessions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setSessions(data.sessions || [])
      } else {
        toast.error(data.error || 'Chyba při načítání sessions')
      }
    } catch {
      toast.error('Chyba při načítání sessions')
    } finally {
      setIsLoading(false)
    }
  }, [currentWeek])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session) =>
      isSameDay(parseISO(session.scheduledAt), day)
    )
  }

  const handleStatusChange = async (sessionId: string, status: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success('Status aktualizován')
        fetchSessions()
      } else {
        toast.error('Chyba při aktualizaci')
      }
    } catch {
      toast.error('Chyba při aktualizaci')
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Opravdu chcete zrušit tuto session?')) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Session byla zrušena')
        fetchSessions()
      } else {
        toast.error('Chyba při rušení session')
      }
    } catch {
      toast.error('Chyba při rušení session')
    }
  }

  const hours = Array.from({ length: 14 }, (_, i) => i + 6) // 6:00 - 19:00

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
                <p className="text-gray-600">Kalendář tréninků a sessions</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDate(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nová session
            </button>
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(weekStart, 'd. MMMM', { locale: cs })} -{' '}
              {format(weekEnd, 'd. MMMM yyyy', { locale: cs })}
            </h2>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            Dnes
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header - Days */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 border-r border-gray-200" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center border-r border-gray-200 last:border-r-0',
                    isSameDay(day, new Date()) && 'bg-primary-50'
                  )}
                >
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    {format(day, 'EEE', { locale: cs })}
                  </p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isSameDay(day, new Date()) ? 'text-primary-600' : 'text-gray-900'
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
                <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
                  <div className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-gray-200">
                    {hour}:00
                  </div>
                  {weekDays.map((day) => {
                    const daySessions = getSessionsForDay(day).filter((session) => {
                      const sessionHour = parseISO(session.scheduledAt).getHours()
                      return sessionHour === hour
                    })

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'p-1 border-r border-gray-100 last:border-r-0 min-h-[60px]',
                          isSameDay(day, new Date()) && 'bg-primary-50/30'
                        )}
                        onClick={() => {
                          setSelectedDate(day)
                          setIsModalOpen(true)
                        }}
                      >
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className={cn(
                              'text-xs p-2 rounded border mb-1 cursor-pointer hover:opacity-80',
                              statusColors[session.status]
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSession(session)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium truncate">{session.client.name}</span>
                              <Menu as="div" className="relative">
                                <Menu.Button className="p-0.5 hover:bg-black/10 rounded">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="py-1">
                                      {session.status === 'scheduled' && (
                                        <>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={() =>
                                                  handleStatusChange(session.id, 'completed')
                                                }
                                                className={cn(
                                                  'flex items-center gap-2 px-3 py-2 text-xs w-full',
                                                  active ? 'bg-gray-50' : ''
                                                )}
                                              >
                                                <Check className="h-3 w-3 text-green-600" />
                                                Dokončit
                                              </button>
                                            )}
                                          </Menu.Item>
                                          <Menu.Item>
                                            {({ active }) => (
                                              <button
                                                onClick={() =>
                                                  handleStatusChange(session.id, 'no_show')
                                                }
                                                className={cn(
                                                  'flex items-center gap-2 px-3 py-2 text-xs w-full',
                                                  active ? 'bg-gray-50' : ''
                                                )}
                                              >
                                                <X className="h-3 w-3 text-red-600" />
                                                Nepřišel
                                              </button>
                                            )}
                                          </Menu.Item>
                                        </>
                                      )}
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDelete(session.id)}
                                            className={cn(
                                              'flex items-center gap-2 px-3 py-2 text-xs w-full text-red-600',
                                              active ? 'bg-red-50' : ''
                                            )}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            Smazat
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[10px] opacity-80">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(session.scheduledAt), 'HH:mm')}
                              <span>• {session.duration} min</span>
                            </div>
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
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
            <span className="text-gray-600">Naplánováno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-300" />
            <span className="text-gray-600">Dokončeno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
            <span className="text-gray-600">Nepřišel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" />
            <span className="text-gray-600">Zrušeno</span>
          </div>
        </div>
      </div>

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
        }}
        onSaved={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
          fetchSessions()
        }}
        defaultDate={selectedDate}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedSession(null)
        }}
        session={selectedSession}
        onSessionUpdated={() => {
          fetchSessions()
        }}
      />
    </>
  )
}
