'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Plus,
  Play,
  Pause,
  Trash2,
  Save,
  Clock,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  GripVertical,
} from 'lucide-react'

interface SequenceStep {
  id: string
  stepOrder: number
  delayDays: number
  delayHours: number
  subject: string
  htmlContent: string
  textContent: string | null
}

interface EnrollmentEmail {
  id: string
  stepOrder: number
  sentAt: string | null
  status: string
}

interface Enrollment {
  id: string
  status: string
  currentStep: number
  emailsSent: number
  enrolledAt: string
  nextEmailAt: string | null
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    organization: string | null
  }
  emails: EnrollmentEmail[]
}

interface SequenceStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  unsubscribed: number
  totalEmailsSent: number
  emailStats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    failed: number
  }
  openRate: number
  clickRate: number
}

interface EmailSequence {
  id: string
  name: string
  description: string | null
  triggerType: string
  triggerConfig: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  steps: SequenceStep[]
  enrollments: Enrollment[]
  stats: SequenceStats
}

const triggerLabels: Record<string, string> = {
  session_completed: 'Po dokončení session',
  days_after_session: 'X dní po session',
  no_booking_days: 'Re-engagement (neaktivní zákazníci)',
  invoice_paid: 'Po zaplacení faktury',
  quote_sent: 'Follow-up nabídky',
  manual: 'Manuální spuštění',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivní', color: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300' },
  paused: { label: 'Pozastaveno', color: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300' },
  completed: { label: 'Dokončeno', color: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' },
  unsubscribed: { label: 'Odhlášen', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' },
}

export default function EmailSequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [sequence, setSequence] = useState<EmailSequence | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null)
  const [showStepModal, setShowStepModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'manual',
    isActive: false,
  })

  const [stepForm, setStepForm] = useState({
    subject: '',
    delayDays: 0,
    delayHours: 0,
    htmlContent: '',
  })

  useEffect(() => {
    fetchSequence()
  }, [id])

  const fetchSequence = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/email-sequences/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSequence(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          triggerType: data.triggerType,
          isActive: data.isActive,
        })
      } else {
        router.push('/admin/email-sequences')
      }
    } catch (error) {
      console.error('Error fetching sequence:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSequence = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/email-sequences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchSequence()
      }
    } catch (error) {
      console.error('Error saving sequence:', error)
    } finally {
      setSaving(false)
    }
  }

  const addStep = async () => {
    try {
      const res = await fetch(`/api/email-sequences/${id}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepForm),
      })
      if (res.ok) {
        setShowStepModal(false)
        setStepForm({ subject: '', delayDays: 0, delayHours: 0, htmlContent: '' })
        fetchSequence()
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  const updateStep = async () => {
    if (!editingStep) return
    try {
      const res = await fetch(`/api/email-sequences/${id}/steps/${editingStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepForm),
      })
      if (res.ok) {
        setShowStepModal(false)
        setEditingStep(null)
        setStepForm({ subject: '', delayDays: 0, delayHours: 0, htmlContent: '' })
        fetchSequence()
      }
    } catch (error) {
      console.error('Error updating step:', error)
    }
  }

  const deleteStep = async (stepId: string) => {
    if (!confirm('Opravdu chcete smazat tento krok?')) return
    try {
      const res = await fetch(`/api/email-sequences/${id}/steps/${stepId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchSequence()
      }
    } catch (error) {
      console.error('Error deleting step:', error)
    }
  }

  const openEditStep = (step: SequenceStep) => {
    setEditingStep(step)
    setStepForm({
      subject: step.subject,
      delayDays: step.delayDays,
      delayHours: step.delayHours,
      htmlContent: step.htmlContent,
    })
    setShowStepModal(true)
  }

  const openNewStep = () => {
    setEditingStep(null)
    setStepForm({ subject: '', delayDays: 0, delayHours: 0, htmlContent: '' })
    setShowStepModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    )
  }

  if (!sequence) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/email-sequences" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sequence.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400">{triggerLabels[sequence.triggerType]}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              formData.isActive
                ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 hover:bg-warning-200 dark:hover:bg-warning-800'
                : 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-800'
            }`}
          >
            {formData.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {formData.isActive ? 'Pozastavit' : 'Aktivovat'}
          </button>
          <button
            onClick={saveSequence}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Uložit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Enrollováno</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sequence.stats.totalEnrollments}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Aktivní</p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">{sequence.stats.activeEnrollments}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Dokončeno</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{sequence.stats.completedEnrollments}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Odesláno</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sequence.stats.totalEmailsSent}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Open rate</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sequence.stats.openRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Click rate</p>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{sequence.stats.clickRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Nastavení</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Název</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Popis</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Trigger</label>
              <select
                value={formData.triggerType}
                onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {Object.entries(triggerLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Kroky ({sequence.steps.length})</h2>
            <button
              onClick={openNewStep}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Přidat
            </button>
          </div>
          <div className="space-y-3">
            {sequence.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:border-neutral-600"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{step.subject}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {step.delayDays > 0 && `${step.delayDays} dní`}
                    {step.delayDays > 0 && step.delayHours > 0 && ' a '}
                    {step.delayHours > 0 && `${step.delayHours} hodin`}
                    {step.delayDays === 0 && step.delayHours === 0 && 'Okamžitě'}
                    {' po předchozím'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditStep(step)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                    <Edit2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  </button>
                  <button onClick={() => deleteStep(step.id)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                    <Trash2 className="h-4 w-4 text-error-500 dark:text-error-400" />
                  </button>
                </div>
              </div>
            ))}
            {sequence.steps.length === 0 && (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">Žádné kroky. Přidejte první email.</p>
            )}
          </div>
        </div>
      </div>

      {/* Enrollments */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Enrollovaní zákazníci</h2>
        {sequence.enrollments.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">Zatím žádní enrollovaní zákazníci.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Zákazník</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Organizace</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Krok</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Odesláno</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Další email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {sequence.enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {enrollment.customer.firstName} {enrollment.customer.lastName}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{enrollment.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">{enrollment.customer.organization || '-'}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {enrollment.currentStep + 1} / {sequence.steps.length}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{enrollment.emailsSent}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusLabels[enrollment.status]?.color || 'bg-neutral-100 dark:bg-neutral-800'}`}
                      >
                        {statusLabels[enrollment.status]?.label || enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {enrollment.nextEmailAt
                        ? new Date(enrollment.nextEmailAt).toLocaleString('cs-CZ')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {editingStep ? 'Upravit krok' : 'Nový krok'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Předmět emailu</label>
                <input
                  type="text"
                  value={stepForm.subject}
                  onChange={(e) => setStepForm({ ...stepForm, subject: e.target.value })}
                  placeholder="Děkujeme za váš team building!"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Zpoždění (dny)</label>
                  <input
                    type="number"
                    min="0"
                    value={stepForm.delayDays}
                    onChange={(e) => setStepForm({ ...stepForm, delayDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Zpoždění (hodiny)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={stepForm.delayHours}
                    onChange={(e) => setStepForm({ ...stepForm, delayHours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">HTML obsah</label>
                <textarea
                  value={stepForm.htmlContent}
                  onChange={(e) => setStepForm({ ...stepForm, htmlContent: e.target.value })}
                  rows={10}
                  placeholder="<h2>Dobrý den {{customer.firstName}},</h2>..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Dostupné proměnné: {'{{customer.firstName}}'}, {'{{customer.lastName}}'}, {'{{customer.email}}'},{' '}
                  {'{{customer.organization}}'}, {'{{unsubscribeUrl}}'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStepModal(false)
                  setEditingStep(null)
                }}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                Zrušit
              </button>
              <button
                onClick={editingStep ? updateStep : addStep}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                {editingStep ? 'Uložit změny' : 'Přidat krok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
