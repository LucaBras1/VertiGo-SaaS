'use client'

import { useState, useEffect } from 'react'
import { Mail, Plus, Play, Pause, Trash2, Users, Clock, Check, AlertCircle } from 'lucide-react'
import { SequenceFormModal } from '@/components/email-sequences/SequenceFormModal'
import { EnrollmentList } from '@/components/email-sequences/EnrollmentList'

interface EmailSequence {
  id: string
  name: string
  description: string | null
  triggerType: string
  isActive: boolean
  createdAt: string
  _count: {
    steps: number
    enrollments: number
  }
}

interface SequenceStats {
  total: number
  active: number
  totalEnrollments: number
  activeEnrollments: number
  emailsSent: number
}

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [stats, setStats] = useState<SequenceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSequence, setEditingSequence] = useState<EmailSequence | null>(null)
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null)

  useEffect(() => {
    fetchSequences()
  }, [])

  const fetchSequences = async () => {
    try {
      const response = await fetch('/api/email-sequences')
      if (response.ok) {
        const data = await response.json()
        setSequences(data.sequences || data)
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (sequence: EmailSequence) => {
    try {
      const response = await fetch(`/api/email-sequences/${sequence.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sequence.isActive }),
      })

      if (response.ok) {
        fetchSequences()
      }
    } catch (error) {
      console.error('Failed to toggle sequence:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto sekvenci?')) return

    try {
      const response = await fetch(`/api/email-sequences/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSequences()
      }
    } catch (error) {
      console.error('Failed to delete sequence:', error)
    }
  }

  const getTriggerLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      client_created: 'Novy klient',
      package_purchased: 'Zakoupeni balicku',
      session_completed: 'Dokoncena lekce',
      days_inactive: 'Neaktivita',
      membership_expiring: 'Expirace clenstvi',
      manual: 'Manualni',
    }
    return labels[triggerType] || triggerType
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email sekvence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automatizovane emaily pro vase klienty
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova sekvence
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Celkem sekvenci</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktivni sekvence</p>
                <p className="text-xl font-semibold">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktivni enrollment</p>
                <p className="text-xl font-semibold">{stats.activeEnrollments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Check className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Odeslanych emailu</p>
                <p className="text-xl font-semibold">{stats.emailsSent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nazev
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kroky
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sequences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Zadne sekvence</p>
                    <p className="text-sm">Vytvorte prvni automatickou email sekvenci</p>
                  </td>
                </tr>
              ) : (
                sequences.map((sequence) => (
                  <tr
                    key={sequence.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSequence(selectedSequence === sequence.id ? null : sequence.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{sequence.name}</p>
                        {sequence.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {sequence.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTriggerLabel(sequence.triggerType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{sequence._count.steps}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{sequence._count.enrollments}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sequence.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                          Aktivni
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                          Neaktivni
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleActive(sequence)}
                          className={`p-2 rounded-lg transition-colors ${
                            sequence.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={sequence.isActive ? 'Pozastavit' : 'Aktivovat'}
                        >
                          {sequence.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingSequence(sequence)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Upravit"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sequence.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Smazat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSequence && (
        <EnrollmentList
          sequenceId={selectedSequence}
          onClose={() => setSelectedSequence(null)}
        />
      )}

      {(showCreateModal || editingSequence) && (
        <SequenceFormModal
          sequence={editingSequence}
          onClose={() => {
            setShowCreateModal(false)
            setEditingSequence(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingSequence(null)
            fetchSequences()
          }}
        />
      )}
    </div>
  )
}
