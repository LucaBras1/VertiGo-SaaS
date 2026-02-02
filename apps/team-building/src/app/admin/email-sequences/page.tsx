'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mail,
  Plus,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  Users,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react'

interface SequenceStep {
  id: string
  stepOrder: number
  delayDays: number
  delayHours: number
  subject: string
}

interface SequenceStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalEmailsSent: number
  openRate: number
  clickRate: number
}

interface EmailSequence {
  id: string
  name: string
  description: string | null
  triggerType: string
  isActive: boolean
  createdAt: string
  steps: SequenceStep[]
  _count: { enrollments: number }
  stats: SequenceStats
}

interface Template {
  key: string
  name: string
  description: string
  triggerType: string
  stepsCount: number
}

const triggerLabels: Record<string, string> = {
  session_completed: 'Po dokončení session',
  days_after_session: 'X dní po session',
  no_booking_days: 'Re-engagement',
  invoice_paid: 'Po zaplacení faktury',
  quote_sent: 'Follow-up nabídky',
  manual: 'Manuální spuštění',
}

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchSequences()
    fetchTemplates()
  }, [])

  const fetchSequences = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/email-sequences')
      if (res.ok) {
        setSequences(await res.json())
      }
    } catch (error) {
      console.error('Error fetching sequences:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-sequences/templates')
      if (res.ok) {
        setTemplates(await res.json())
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const toggleSequenceActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/email-sequences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      if (res.ok) {
        setSequences((prev) => prev.map((seq) => (seq.id === id ? { ...seq, isActive: !currentActive } : seq)))
      }
    } catch (error) {
      console.error('Error toggling sequence:', error)
    }
  }

  const deleteSequence = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto sekvenci?')) return

    try {
      const res = await fetch(`/api/email-sequences/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSequences((prev) => prev.filter((seq) => seq.id !== id))
      }
    } catch (error) {
      console.error('Error deleting sequence:', error)
    }
  }

  const createFromTemplate = async (templateKey: string) => {
    setCreating(true)
    try {
      const res = await fetch('/api/email-sequences/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey }),
      })
      if (res.ok) {
        setShowTemplateModal(false)
        fetchSequences()
      }
    } catch (error) {
      console.error('Error creating from template:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-500 mt-1">Automatické follow-up kampaně</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Ze šablony
          </button>
          <Link
            href="/admin/email-sequences/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nová sekvence
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Celkem sekvencí</p>
              <p className="text-xl font-bold text-gray-900">{sequences.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Aktivní</p>
              <p className="text-xl font-bold text-gray-900">{sequences.filter((s) => s.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrollováno</p>
              <p className="text-xl font-bold text-gray-900">
                {sequences.reduce((sum, s) => sum + s.stats.activeEnrollments, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Send className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Odesláno emailů</p>
              <p className="text-xl font-bold text-gray-900">
                {sequences.reduce((sum, s) => sum + s.stats.totalEmailsSent, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sequences list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : sequences.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Žádné email sekvence</h3>
          <p className="text-gray-500 mb-4">Vytvořte první sekvenci pro automatické follow-up emaily.</p>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Vytvořit ze šablony
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sekvence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kroky
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollováno
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Odesláno
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sequences.map((sequence) => (
                <tr key={sequence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/admin/email-sequences/${sequence.id}`} className="block">
                      <p className="font-medium text-gray-900 hover:text-blue-600">{sequence.name}</p>
                      {sequence.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{sequence.description}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <Clock className="h-3 w-3" />
                      {triggerLabels[sequence.triggerType] || sequence.triggerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-900">{sequence.steps.length}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-900">{sequence.stats.activeEnrollments}</span>
                    <span className="text-gray-400 text-sm"> / {sequence.stats.totalEnrollments}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-900">{sequence.stats.totalEmailsSent}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sequence.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktivní
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Pause className="h-3 w-3" />
                        Pozastaveno
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleSequenceActive(sequence.id, sequence.isActive)}
                        className={`p-2 rounded-lg hover:bg-gray-100 ${
                          sequence.isActive ? 'text-yellow-600' : 'text-green-600'
                        }`}
                        title={sequence.isActive ? 'Pozastavit' : 'Aktivovat'}
                      >
                        {sequence.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteSequence(sequence.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                        title="Smazat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vytvořit ze šablony</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.key}
                  onClick={() => createFromTemplate(template.key)}
                  disabled={creating}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span>{template.stepsCount} kroků</span>
                    <span>•</span>
                    <span>{triggerLabels[template.triggerType]}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
