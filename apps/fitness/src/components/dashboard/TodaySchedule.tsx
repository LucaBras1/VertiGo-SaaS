'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Sparkles, Video, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Session {
  id: string
  scheduledAt: string
  duration: number
  status: string
  muscleGroups: string[]
  workoutPlan?: unknown
  trainerNotes?: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

interface TodayScheduleProps {
  onStartSession?: (session: Session) => void
  onViewPlan?: (session: Session) => void
}

export function TodaySchedule({ onStartSession, onViewPlan }: TodayScheduleProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodaySessions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      const response = await fetch(
        `/api/sessions?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      )

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else {
        setError('Nepodařilo se načíst sessions')
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Chyba při načítání sessions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodaySessions()
  }, [])

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)

  const handleViewAll = () => {
    router.push('/dashboard/sessions')
  }

  // Find first upcoming or in_progress session
  const firstActiveIndex = sessions.findIndex(
    (s) => s.status === 'scheduled' || s.status === 'in_progress'
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-sm text-gray-600">
                {sessions.length} sessions, {totalMinutes} minutes total
              </p>
            </div>
          </div>
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchTodaySessions}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Zkusit znovu
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-1">Dnes nemáte žádné naplánované sessions</p>
            <button
              onClick={() => router.push('/dashboard/sessions')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Naplánovat session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const isFirstActive = index === firstActiveIndex
              const scheduledTime = new Date(session.scheduledAt)
              const hasAIWorkout = !!session.workoutPlan
              const isVirtual = false // Could be added to session model if needed

              return (
                <div
                  key={session.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    isFirstActive
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {session.client.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.client.name}</h3>
                        <p className="text-sm text-gray-600">
                          {session.muscleGroups?.length > 0
                            ? session.muscleGroups.join(', ')
                            : 'Trénink'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isVirtual && (
                          <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            <Video className="w-3 h-3" />
                            Virtual
                          </div>
                        )}
                        {hasAIWorkout && (
                          <div className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-medium">
                            <Sparkles className="w-3 h-3" />
                            AI Plan
                          </div>
                        )}
                        {session.status === 'in_progress' && (
                          <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                            Probíhá
                          </div>
                        )}
                        {session.status === 'completed' && (
                          <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                            Dokončeno
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(scheduledTime, 'HH:mm')} ({session.duration} min)
                      </div>
                    </div>

                    {session.trainerNotes && (
                      <p className="text-sm text-gray-500 mt-2">{session.trainerNotes}</p>
                    )}

                    {/* Actions - show for first active session */}
                    {isFirstActive && (session.status === 'scheduled' || session.status === 'in_progress') && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onStartSession?.(session)}
                          className="text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          {session.status === 'in_progress' ? 'Pokračovat' : 'Start Session'}
                        </button>
                        <button
                          onClick={() => onViewPlan?.(session)}
                          className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Plan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
