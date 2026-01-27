'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EmailSequence {
  id: string
  name: string
  description: string | null
  triggerType: string
  triggerConfig?: Record<string, unknown> | null
  isActive: boolean
}

interface SequenceFormModalProps {
  sequence: EmailSequence | null
  onClose: () => void
  onSuccess: () => void
}

const TRIGGER_TYPES = [
  { value: 'client_created', label: 'Novy klient', description: 'Pri vytvoreni noveho klienta' },
  { value: 'package_purchased', label: 'Zakoupeni balicku', description: 'Pri zakoupeni balicku kreditu' },
  { value: 'session_completed', label: 'Dokoncena lekce', description: 'Po dokonceni lekce' },
  { value: 'days_inactive', label: 'Neaktivita', description: 'Po urcitem poctu dni neaktivity' },
  { value: 'membership_expiring', label: 'Expirace clenstvi', description: 'Pred vyprsenim clenstvi' },
  { value: 'manual', label: 'Manualni', description: 'Spousti se rucne' },
]

export function SequenceFormModal({ sequence, onClose, onSuccess }: SequenceFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('manual')
  const [triggerConfig, setTriggerConfig] = useState<Record<string, unknown>>({})
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sequence) {
      setName(sequence.name)
      setDescription(sequence.description || '')
      setTriggerType(sequence.triggerType)
      setTriggerConfig(sequence.triggerConfig || {})
      setIsActive(sequence.isActive)
    }
  }, [sequence])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = sequence
        ? `/api/email-sequences/${sequence.id}`
        : '/api/email-sequences'
      const method = sequence ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          triggerType,
          triggerConfig: Object.keys(triggerConfig).length > 0 ? triggerConfig : null,
          isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se ulozit sekvenci')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo se ulozit sekvenci')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {sequence ? 'Upravit sekvenci' : 'Nova sekvence'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazev sekvence
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="napr. Uvitaci serie"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Popis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={2}
              placeholder="Kratky popis sekvence..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spoustec (trigger)
            </label>
            <div className="space-y-2">
              {TRIGGER_TYPES.map((trigger) => (
                <label
                  key={trigger.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    triggerType === trigger.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="triggerType"
                    value={trigger.value}
                    checked={triggerType === trigger.value}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{trigger.label}</p>
                    <p className="text-sm text-gray-500">{trigger.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {triggerType === 'days_inactive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pocet dni neaktivity
              </label>
              <input
                type="number"
                value={triggerConfig.inactiveDays as number || 7}
                onChange={(e) => setTriggerConfig({ ...triggerConfig, inactiveDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={1}
              />
            </div>
          )}

          {triggerType === 'membership_expiring' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dni pred expiraci
              </label>
              <input
                type="number"
                value={triggerConfig.daysBeforeExpiry as number || 7}
                onChange={(e) => setTriggerConfig({ ...triggerConfig, daysBeforeExpiry: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={1}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Sekvence je aktivni
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Zrusit
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ukladam...' : sequence ? 'Ulozit' : 'Vytvorit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
