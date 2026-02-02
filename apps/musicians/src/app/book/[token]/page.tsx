'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Music, Calendar, MapPin, Mail, Phone, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface WidgetData {
  displayName: string
  displayBio: string | null
  displayPhoto: string | null
  primaryColor: string
  backgroundColor: string
  allowedEventTypes: string[]
  minNoticeHours: number
  successMessage: string | null
  tenant: {
    bandName: string | null
    website: string | null
    socialLinks: Record<string, string> | null
  }
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Svatba',
  corporate: 'Firemní akce',
  party: 'Soukromá oslava',
  concert: 'Koncert',
  festival: 'Festival',
  birthday: 'Narozeniny',
  graduation: 'Promoce',
  other: 'Jiná akce',
}

export default function BookingPage() {
  const params = useParams()
  const token = params.token as string

  const [widget, setWidget] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: '',
    eventDate: '',
    venueName: '',
    venueCity: '',
    message: '',
    website: '', // Honeypot
  })

  // Load widget data
  useEffect(() => {
    async function loadWidget() {
      try {
        const res = await fetch(`/api/public/widget/${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Widget nenalezen')
          return
        }

        setWidget(data.data)
        if (data.data.allowedEventTypes.length > 0) {
          setFormData(prev => ({ ...prev, eventType: data.data.allowedEventTypes[0] }))
        }
      } catch {
        setError('Nepodařilo se načíst rezervační formulář')
      } finally {
        setLoading(false)
      }
    }

    loadWidget()
  }, [token])

  // Calculate minimum date
  const minDate = widget ? new Date(Date.now() + widget.minNoticeHours * 60 * 60 * 1000).toISOString().slice(0, 16) : ''

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/public/widget/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone || undefined,
          eventType: formData.eventType,
          eventDate: new Date(formData.eventDate).toISOString(),
          venue: formData.venueName || formData.venueCity ? {
            name: formData.venueName || undefined,
            city: formData.venueCity || undefined,
          } : undefined,
          message: formData.message || undefined,
          website: formData.website, // Honeypot
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Nepodařilo se odeslat poptávku')
        return
      }

      setSuccess(data.message || 'Děkujeme za vaši poptávku!')
    } catch {
      setError('Nepodařilo se odeslat poptávku')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // Error state (widget not found)
  if (!widget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Formulář nenalezen</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: widget.backgroundColor }}
      >
        <div className="max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: widget.primaryColor }} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Děkujeme!</h1>
          <p className="text-gray-600">{success}</p>
          {widget.tenant.website && (
            <a
              href={widget.tenant.website}
              className="inline-block mt-6 px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: widget.primaryColor }}
            >
              Navštívit web
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: widget.backgroundColor }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {widget.displayPhoto && (
            <img
              src={widget.displayPhoto}
              alt={widget.displayName || 'Band'}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Music className="w-7 h-7" style={{ color: widget.primaryColor }} />
            {widget.displayName}
          </h1>
          {widget.displayBio && (
            <p className="text-gray-600 max-w-md mx-auto">{widget.displayBio}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Rezervační formulář</h2>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Kontaktní údaje</h3>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4" />
                Jméno a příjmení *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': widget.primaryColor } as any}
                placeholder="Jan Novák"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4" />
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Detaily akce</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Music className="w-4 h-4" />
                  Typ akce *
                </label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                >
                  {widget.allowedEventTypes.map((type) => (
                    <option key={type} value={type}>
                      {EVENT_TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  Datum a čas *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDate}
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4" />
                  Název místa
                </label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                  placeholder="Hotel XY / Zahrada"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4" />
                  Město
                </label>
                <input
                  type="text"
                  value={formData.venueCity}
                  onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': widget.primaryColor } as any}
                  placeholder="Praha"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="w-4 h-4" />
                Zpráva
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                style={{ '--tw-ring-color': widget.primaryColor } as any}
                placeholder="Napište nám více o vaší akci, speciální požadavky, repertoár..."
              />
            </div>
          </div>

          {/* Honeypot - hidden from humans */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="sr-only"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: widget.primaryColor }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Odesílám...
              </>
            ) : (
              'Odeslat poptávku'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Odesláním formuláře souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.
          </p>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Powered by{' '}
          <a href="https://gigbook.app" className="hover:underline" style={{ color: widget.primaryColor }}>
            GigBook
          </a>
        </div>
      </div>
    </div>
  )
}
