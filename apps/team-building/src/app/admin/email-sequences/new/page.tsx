'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

const triggerLabels: Record<string, string> = {
  session_completed: 'Po dokončení session',
  days_after_session: 'X dní po session',
  no_booking_days: 'Re-engagement (neaktivní zákazníci)',
  invoice_paid: 'Po zaplacení faktury',
  quote_sent: 'Follow-up nabídky',
  manual: 'Manuální spuštění',
}

export default function NewEmailSequencePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'manual',
    triggerConfig: {} as Record<string, unknown>,
    isActive: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Název je povinný')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/email-sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const sequence = await res.json()
        router.push(`/admin/email-sequences/${sequence.id}`)
      } else {
        const data = await res.json()
        setError(data.error || 'Nepodařilo se vytvořit sekvenci')
      }
    } catch (err) {
      setError('Nepodařilo se vytvořit sekvenci')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/email-sequences" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nová email sekvence</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Vytvořte automatickou follow-up kampaň</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-error-50 dark:bg-error-950/20 border border-error-200 dark:border-error-800 rounded-lg text-error-700 dark:text-error-300 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Název sekvence <span className="text-error-500 dark:text-error-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Follow-up po session"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Popis</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Automatický follow-up pro zákazníky po dokončení team buildingu..."
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
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Kdy se zákazníci automaticky enrollují do této sekvence.</p>
        </div>

        {formData.triggerType === 'no_booking_days' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Počet neaktivních dní</label>
            <input
              type="number"
              min="1"
              value={(formData.triggerConfig.inactiveDays as number) || 90}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  triggerConfig: { ...formData.triggerConfig, inactiveDays: parseInt(e.target.value) || 90 },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Zákazníci bez objednávky po tomto počtu dní budou enrollováni.</p>
          </div>
        )}

        {formData.triggerType === 'days_after_session' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Počet dní po session</label>
            <input
              type="number"
              min="1"
              value={(formData.triggerConfig.daysAfter as number) || 3}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  triggerConfig: { ...formData.triggerConfig, daysAfter: parseInt(e.target.value) || 3 },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-brand-600 dark:text-brand-400 border-neutral-300 dark:border-neutral-600 rounded focus:ring-brand-500"
          />
          <label htmlFor="isActive" className="text-sm text-neutral-700 dark:text-neutral-300">
            Aktivovat sekvenci ihned po vytvoření
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/email-sequences" className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            Zrušit
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Vytvořit sekvenci
          </button>
        </div>
      </form>
    </div>
  )
}
