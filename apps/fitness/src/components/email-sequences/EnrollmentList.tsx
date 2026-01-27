'use client'

import { useState, useEffect } from 'react'
import { X, Play, Pause, UserMinus, Mail, Check, AlertCircle } from 'lucide-react'

interface Enrollment {
  id: string
  clientId: string
  currentStep: number
  status: string
  enrolledAt: string
  nextEmailAt: string | null
  completedAt: string | null
  emailsSent: number
  client: {
    id: string
    name: string
    email: string
  }
}

interface EnrollmentListProps {
  sequenceId: string
  onClose: () => void
}

export function EnrollmentList({ sequenceId, onClose }: EnrollmentListProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollments()
  }, [sequenceId])

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`/api/email-sequences/${sequenceId}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/email-sequences/enrollments/${enrollmentId}/pause`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchEnrollments()
      }
    } catch (error) {
      console.error('Failed to pause enrollment:', error)
    }
  }

  const handleResume = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/email-sequences/enrollments/${enrollmentId}/resume`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchEnrollments()
      }
    } catch (error) {
      console.error('Failed to resume enrollment:', error)
    }
  }

  const handleUnsubscribe = async (enrollmentId: string) => {
    if (!confirm('Opravdu chcete odhlasit tohoto klienta ze sekvence?')) return

    try {
      const response = await fetch(`/api/email-sequences/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchEnrollments()
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
            Aktivni
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Pause className="w-3 h-3 mr-1" />
            Pozastaveno
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Check className="w-3 h-3 mr-1" />
            Dokonceno
          </span>
        )
      case 'unsubscribed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Odhlaseno
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          Zapsani klienti ({enrollments.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Zatim zadni klienti</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Klient
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Stav
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Krok
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Odeslano
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Dalsi email
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.client.name}</p>
                      <p className="text-sm text-gray-500">{enrollment.client.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                  <td className="px-4 py-3 text-gray-600">{enrollment.currentStep + 1}</td>
                  <td className="px-4 py-3 text-gray-600">{enrollment.emailsSent}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {enrollment.nextEmailAt
                      ? new Date(enrollment.nextEmailAt).toLocaleDateString('cs-CZ')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {enrollment.status === 'active' && (
                        <button
                          onClick={() => handlePause(enrollment.id)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Pozastavit"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      {enrollment.status === 'paused' && (
                        <button
                          onClick={() => handleResume(enrollment.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Obnovit"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {(enrollment.status === 'active' || enrollment.status === 'paused') && (
                        <button
                          onClick={() => handleUnsubscribe(enrollment.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Odhlasit"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
