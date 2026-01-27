'use client'

import { useState } from 'react'
import { X, Flag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent, TimelineEventType } from '@/lib/timeline/event-aggregator'

interface MilestoneModalProps {
  clientId: string
  event?: TimelineEvent | null
  onClose: () => void
  onSave: (event: TimelineEvent) => void
}

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'milestone', label: 'Milník' },
  { value: 'note', label: 'Poznámka' },
]

export function MilestoneModal({ clientId, event, onClose, onSave }: MilestoneModalProps) {
  const [eventType, setEventType] = useState<string>(event?.type || 'milestone')
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [isMilestone, setIsMilestone] = useState(event?.isMilestone ?? eventType === 'milestone')
  const [eventDate, setEventDate] = useState<string>(() => {
    if (event?.date) {
      return new Date(event.date).toISOString().slice(0, 16)
    }
    return new Date().toISOString().slice(0, 16)
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Zadejte název')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/clients/${clientId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          title: title.trim(),
          description: description.trim() || undefined,
          isMilestone,
          eventDate: new Date(eventDate).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save event')
      }

      const savedEvent = await response.json()
      onSave(savedEvent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-secondary-800 rounded-xl shadow-2xl max-w-md w-full border border-secondary-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Flag className="h-4 w-4 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {event ? 'Upravit událost' : 'Přidat událost'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary-700 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Typ události
            </label>
            <div className="flex gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setEventType(type.value)
                    if (type.value === 'milestone') setIsMilestone(true)
                  }}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    eventType === type.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Název *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                eventType === 'milestone'
                  ? 'např. Dosažení cílové váhy'
                  : 'např. Doporučení výživy'
              }
              className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Popis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Volitelný popis události..."
              rows={3}
              className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              maxLength={2000}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Datum a čas
            </label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Is Milestone */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                className="w-5 h-5 rounded border-secondary-600 bg-secondary-700 text-yellow-500 focus:ring-yellow-500"
              />
              <div>
                <span className="text-white font-medium">Označit jako milník</span>
                <p className="text-sm text-gray-400">
                  Milníky jsou zvýrazněny a lze je filtrovat
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary-700 text-gray-300 rounded-lg font-medium hover:bg-secondary-600 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Ukládám...' : event ? 'Uložit změny' : 'Přidat událost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
