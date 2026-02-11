'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import {
  Clock,
  Calendar,
  User,
  Dumbbell,
  Sparkles,
  Play,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'

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

interface SessionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  onSessionUpdated: () => void
}

const muscleGroupLabels: Record<string, string> = {
  chest: 'Hrudník',
  back: 'Záda',
  shoulders: 'Ramena',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Nohy',
  glutes: 'Hýždě',
  core: 'Jádro',
  full_body: 'Celé tělo',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Naplánováno', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Probíhá', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'Nedostavil se', color: 'bg-gray-100 text-gray-700' },
}

export function SessionDetailModal({
  isOpen,
  onClose,
  session,
  onSessionUpdated,
}: SessionDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!session) return null

  const updateSessionStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(
          newStatus === 'in_progress'
            ? 'Session zahájena'
            : 'Session dokončena'
        )
        onSessionUpdated()
        if (newStatus === 'completed') {
          onClose()
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Chyba při aktualizaci session')
      }
    } catch {
      toast.error('Chyba při aktualizaci session')
    } finally {
      setIsUpdating(false)
    }
  }

  const scheduledDate = new Date(session.scheduledAt)
  const statusInfo = statusLabels[session.status] || statusLabels.scheduled

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-lg">
                <DialogHeader onClose={onClose}>
                  <DialogTitle>
                    Detail session
                  </DialogTitle>
                </DialogHeader>

                {/* Status Badge */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {session.client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.client.name}</h3>
                    <p className="text-sm text-gray-600">{session.client.email}</p>
                    {session.client.phone && (
                      <p className="text-sm text-gray-500">{session.client.phone}</p>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{format(scheduledDate, 'EEEE, d. MMMM yyyy', { locale: cs })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{format(scheduledDate, 'HH:mm')} ({session.duration} min)</span>
                  </div>

                  {session.muscleGroups && session.muscleGroups.length > 0 && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <Dumbbell className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {session.muscleGroups.map((group) => (
                          <span
                            key={group}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                          >
                            {muscleGroupLabels[group] || group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Workout Plan Section */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    Tréninkový plán
                  </h4>
                  {session.workoutPlan ? (
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof session.workoutPlan === 'string'
                          ? session.workoutPlan
                          : JSON.stringify(session.workoutPlan, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Žádný tréninkový plán nebyl vytvořen</p>
                    </div>
                  )}
                </div>

                {/* Trainer Notes */}
                {session.trainerNotes && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h4 className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      Poznámky trenéra
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {session.trainerNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Zavřít
                  </button>

                  {session.status === 'scheduled' && (
                    <button
                      type="button"
                      onClick={() => updateSessionStatus('in_progress')}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Zahájit session
                    </button>
                  )}

                  {session.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => updateSessionStatus('completed')}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Dokončit session
                    </button>
                  )}
                </div>
    </Dialog>
  )
}
