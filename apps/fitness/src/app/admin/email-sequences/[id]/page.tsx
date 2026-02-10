'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Play, Pause, GripVertical, Trash2, Edit2, Save, X, Clock, Mail } from 'lucide-react'
import { StepEditor } from '@/components/email-sequences/StepEditor'

interface SequenceStep {
  id: string
  stepOrder: number
  delayDays: number
  delayHours: number
  subject: string
  htmlContent: string
  textContent: string | null
  conditions: Record<string, unknown> | null
}

interface EmailSequence {
  id: string
  name: string
  description: string | null
  triggerType: string
  triggerConfig: Record<string, unknown> | null
  isActive: boolean
  steps: SequenceStep[]
  _count?: {
    enrollments: number
  }
}

export default function EmailSequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [sequence, setSequence] = useState<EmailSequence | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingStep, setEditingStep] = useState<SequenceStep | null>(null)
  const [showAddStep, setShowAddStep] = useState(false)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)

  useEffect(() => {
    fetchSequence()
  }, [resolvedParams.id])

  const fetchSequence = async () => {
    try {
      const response = await fetch(`/api/email-sequences/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setSequence(data)
      }
    } catch (error) {
      console.error('Failed to fetch sequence:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    if (!sequence) return

    try {
      const response = await fetch(`/api/email-sequences/${sequence.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sequence.isActive }),
      })

      if (response.ok) {
        fetchSequence()
      }
    } catch (error) {
      console.error('Failed to toggle sequence:', error)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Opravdu chcete smazat tento krok?')) return

    try {
      const response = await fetch(`/api/email-sequences/${resolvedParams.id}/steps/${stepId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSequence()
      }
    } catch (error) {
      console.error('Failed to delete step:', error)
    }
  }

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId)
  }

  const handleDragOver = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault()
    if (draggedStep === targetStepId) return
  }

  const handleDrop = async (targetStepId: string) => {
    if (!draggedStep || !sequence || draggedStep === targetStepId) {
      setDraggedStep(null)
      return
    }

    const steps = [...sequence.steps]
    const draggedIndex = steps.findIndex(s => s.id === draggedStep)
    const targetIndex = steps.findIndex(s => s.id === targetStepId)

    const [removed] = steps.splice(draggedIndex, 1)
    steps.splice(targetIndex, 0, removed)

    // Optimistic update
    setSequence({
      ...sequence,
      steps: steps.map((s, i) => ({ ...s, stepOrder: i + 1 })),
    })

    try {
      await fetch(`/api/email-sequences/${resolvedParams.id}/steps/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepIds: steps.map(s => s.id) }),
      })
    } catch (error) {
      console.error('Failed to reorder steps:', error)
      fetchSequence() // Revert on error
    }

    setDraggedStep(null)
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

  if (!sequence) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">Sekvence nenalezena</p>
        <button
          onClick={() => router.push('/admin/email-sequences')}
          className="mt-4 text-green-600 hover:text-green-700"
        >
          Zpet na seznam
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/email-sequences')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sequence.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {getTriggerLabel(sequence.triggerType)}
              </span>
              {sequence.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktivni
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Neaktivni
                </span>
              )}
              {sequence._count && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {sequence._count.enrollments} klientu zapsano
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sequence.isActive
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {sequence.isActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pozastavit
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Aktivovat
              </>
            )}
          </button>
        </div>
      </div>

      {sequence.description && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-neutral-600 dark:text-neutral-400">{sequence.description}</p>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Kroky sekvence ({sequence.steps.length})
          </h2>
          <button
            onClick={() => setShowAddStep(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Pridat krok
          </button>
        </div>

        {sequence.steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Zatim zadne kroky</p>
            <button
              onClick={() => setShowAddStep(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Pridat prvni email
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sequence.steps
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step, index) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => handleDragStart(step.id)}
                  onDragOver={(e) => handleDragOver(e, step.id)}
                  onDrop={() => handleDrop(step.id)}
                  className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                    draggedStep === step.id
                      ? 'border-green-500 bg-green-50 opacity-50'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  <div className="cursor-grab">
                    <GripVertical className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {step.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {step.delayDays > 0 && `${step.delayDays} dni`}
                        {step.delayDays > 0 && step.delayHours > 0 && ' '}
                        {step.delayHours > 0 && `${step.delayHours} hod`}
                        {step.delayDays === 0 && step.delayHours === 0 && 'Okamzite'}
                      </span>
                      {step.conditions && Object.keys(step.conditions).length > 0 && (
                        <span className="text-orange-600">Podmineny</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {(showAddStep || editingStep) && (
        <StepEditor
          sequenceId={resolvedParams.id}
          step={editingStep}
          stepOrder={editingStep?.stepOrder || sequence.steps.length + 1}
          onClose={() => {
            setShowAddStep(false)
            setEditingStep(null)
          }}
          onSuccess={() => {
            setShowAddStep(false)
            setEditingStep(null)
            fetchSequence()
          }}
        />
      )}
    </div>
  )
}
