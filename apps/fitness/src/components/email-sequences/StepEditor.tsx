'use client'

import { useState, useEffect } from 'react'
import { X, Info } from 'lucide-react'

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

interface StepEditorProps {
  sequenceId: string
  step: SequenceStep | null
  stepOrder: number
  onClose: () => void
  onSuccess: () => void
}

const TEMPLATE_VARIABLES = [
  { key: '{{client.name}}', description: 'Jmeno klienta' },
  { key: '{{client.email}}', description: 'Email klienta' },
  { key: '{{tenant.name}}', description: 'Nazev studia' },
  { key: '{{credits.remaining}}', description: 'Zbyvajici kredity' },
  { key: '{{package.name}}', description: 'Nazev balicku' },
  { key: '{{next_session.date}}', description: 'Datum dalsi lekce' },
]

export function StepEditor({ sequenceId, step, stepOrder, onClose, onSuccess }: StepEditorProps) {
  const [delayDays, setDelayDays] = useState(0)
  const [delayHours, setDelayHours] = useState(0)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [textContent, setTextContent] = useState('')
  const [showVariables, setShowVariables] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (step) {
      setDelayDays(step.delayDays)
      setDelayHours(step.delayHours)
      setSubject(step.subject)
      setHtmlContent(step.htmlContent)
      setTextContent(step.textContent || '')
    }
  }, [step])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = step
        ? `/api/email-sequences/${sequenceId}/steps/${step.id}`
        : `/api/email-sequences/${sequenceId}/steps`
      const method = step ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepOrder: step ? step.stepOrder : stepOrder,
          delayDays,
          delayHours,
          subject,
          htmlContent,
          textContent: textContent || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se ulozit krok')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo se ulozit krok')
    } finally {
      setLoading(false)
    }
  }

  const insertVariable = (variable: string) => {
    setHtmlContent(prev => prev + variable)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step ? 'Upravit krok' : `Pridat krok ${stepOrder}`}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odeslat po (dny)
              </label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odeslat po (hodiny)
              </label>
              <input
                type="number"
                value={delayHours}
                onChange={(e) => setDelayHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={0}
                max={23}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Predmet emailu
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="napr. Vitejte v nasem studiu!"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Obsah emailu (HTML)
              </label>
              <button
                type="button"
                onClick={() => setShowVariables(!showVariables)}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
              >
                <Info className="h-4 w-4" />
                Promenne
              </button>
            </div>

            {showVariables && (
              <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Kliknutim vlozite promennou:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.key)}
                      className="px-2 py-1 bg-white border border-gray-200 rounded text-xs hover:border-green-500 hover:text-green-600 transition-colors"
                      title={v.description}
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows={8}
              placeholder="<h1>Ahoj {{client.name}}!</h1>&#10;<p>Vítejte v {{tenant.name}}...</p>"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Textova verze (volitelne)
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={4}
              placeholder="Pro emaily bez podpory HTML..."
            />
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
              disabled={loading || !subject || !htmlContent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ukladam...' : step ? 'Ulozit' : 'Pridat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
