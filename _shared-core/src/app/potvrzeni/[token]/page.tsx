'use client'

/**
 * Order Confirmation Page
 *
 * Public page where customers can view and confirm/reject order offers
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { CheckCircle, AlertTriangle, Clock, XCircle, Loader2 } from 'lucide-react'

type ConfirmationStatus = 'pending' | 'confirmed' | 'reviewing' | 'expired' | 'not_found'

interface OrderItem {
  name: string
  date?: string
  startTime?: string
  endTime?: string
  price: number
}

interface OrderData {
  orderNumber: string
  eventName: string | null
  dates: string[]
  venue: {
    name: string
    street?: string
    city?: string
    postalCode?: string
  }
  items: OrderItem[]
  pricing: {
    subtotal?: number
    travelCosts?: number
    discount?: number
    totalPrice: number
    vatIncluded?: boolean
  }
  customer: {
    firstName: string
    lastName: string
    organization?: string
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' Kc'
}

function formatDate(date: string): string {
  return format(new Date(date), 'd. MMMM yyyy', { locale: cs })
}

export default function ConfirmationPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<ConfirmationStatus>('pending')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [confirmerName, setConfirmerName] = useState('')
  const [confirmerEmail, setConfirmerEmail] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [comments, setComments] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/confirm/${token}`)
        const data = await response.json()

        if (data.success) {
          setStatus(data.status)
          setOrder(data.order)
          setConfirmedAt(data.confirmedAt)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError('Chyba pri nacitani objednavky')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOrder()
    }
  }, [token])

  // Handle confirmation
  const handleConfirm = async () => {
    if (!agreedToTerms) {
      setError('Pro potvrzeni musite souhlasit s podminkami')
      return
    }

    if (!confirmerName.trim() || !confirmerEmail.trim()) {
      setError('Vyplnte prosim sve jmeno a email')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          agreedToTerms,
          confirmerName: confirmerName.trim(),
          confirmerEmail: confirmerEmail.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('confirmed')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Chyba pri potvrzovani objednavky')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle rejection
  const handleReject = async () => {
    if (!comments.trim()) {
      setError('Vyplnte prosim sve pripominky')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          comments: comments.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('reviewing')
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Chyba pri odesilani pripominek')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Nacitam objednavku...</p>
        </div>
      </div>
    )
  }

  // Status screens
  if (status === 'not_found') {
    return (
      <StatusScreen
        icon={<XCircle className="h-16 w-16 text-red-500" />}
        title="Objednavka nenalezena"
        message="Odkaz neni platny nebo objednavka neexistuje."
      />
    )
  }

  if (status === 'expired') {
    return (
      <StatusScreen
        icon={<Clock className="h-16 w-16 text-orange-500" />}
        title="Platnost odkazu vyprsela"
        message="Platnost potvrzovacího odkazu vyprsela. Kontaktujte nas prosim pro zaslani noveho odkazu."
      />
    )
  }

  if (status === 'confirmed') {
    return (
      <StatusScreen
        icon={<CheckCircle className="h-16 w-16 text-green-500" />}
        title="Objednavka potvrzena"
        message={confirmedAt
          ? `Objednavka byla potvrzena dne ${format(new Date(confirmedAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs })}.`
          : 'Objednavka byla uspesne potvrzena. Dekujeme!'
        }
      />
    )
  }

  if (status === 'reviewing') {
    return (
      <StatusScreen
        icon={<AlertTriangle className="h-16 w-16 text-yellow-500" />}
        title="Pripominky odeslany"
        message="Vase pripominky byly odeslany. Budeme vas kontaktovat s upravenou nabidkou."
      />
    )
  }

  // Main confirmation form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-red-600 text-white py-6 px-6 rounded-t-lg text-center">
          <h1 className="text-2xl font-bold">Divadlo Studna</h1>
        </div>

        <div className="bg-white shadow-lg rounded-b-lg">
          {/* Title */}
          <div className="px-6 py-6 border-b">
            <h2 className="text-xl font-bold text-red-600">Dohoda o umeleckem vykonu</h2>
            <p className="text-gray-600 mt-1">Objednavka c. {order?.orderNumber}</p>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-6">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Shrnuti objednavky</h3>

              <dl className="space-y-3">
                <div className="flex">
                  <dt className="w-24 text-gray-500">Akce:</dt>
                  <dd className="font-medium">{order?.eventName || 'Neuvedeno'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500">Datum:</dt>
                  <dd>{order?.dates.map(d => formatDate(d)).join(', ')}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500">Misto:</dt>
                  <dd>
                    {order?.venue.name}
                    {order?.venue.street && <>, {order.venue.street}</>}
                    {order?.venue.city && <>, {order.venue.postalCode} {order.venue.city}</>}
                  </dd>
                </div>
              </dl>

              {/* Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Polozky:</h4>
                <div className="space-y-2">
                  {order?.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.date && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({formatDate(item.date)}{item.startTime && `, ${item.startTime}`}{item.endTime && ` - ${item.endTime}`})
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                {order?.pricing.travelCosts && order.pricing.travelCosts > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Cestovne:</span>
                    <span>{formatCurrency(order.pricing.travelCosts)}</span>
                  </div>
                )}
                {order?.pricing.discount && order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Sleva:</span>
                    <span>-{formatCurrency(order.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-red-200">
                  <span>Celkem:</span>
                  <span className="text-red-600">{formatCurrency(order?.pricing.totalPrice || 0)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {order?.pricing.vatIncluded === false ? '* Ceny jsou uvedeny bez DPH' : '* Ceny jsou uvedeny vcetne DPH'}
                </p>
              </div>
            </div>

            {/* Confirmation Form */}
            {!showCommentForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Vase jmeno *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={confirmerName}
                      onChange={(e) => setConfirmerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="Jan Novak"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Vas email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={confirmerEmail}
                      onChange={(e) => setConfirmerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="jan@example.cz"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Potvrzuji, ze jsem vše precetl/a a se vším uvedenym souhlasim.
                  </label>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
                  <strong>Upozorneni:</strong> Pri zruseni akce mene nez 14 dni pred terminem muze byt uctovan storno poplatek.
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  ZAVAZNE POTVRDIT OBJEDNAVKU
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">nebo</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  Mam pripominky
                </button>
              </div>
            )}

            {/* Comment Form */}
            {showCommentForm && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                    Vase pripominky *
                  </label>
                  <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Napiste sve pripominky nebo pozadavky na zmenu..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCommentForm(false)
                      setError(null)
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                  >
                    Zpet
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={submitting}
                    className="flex-1 py-2 px-4 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    Odeslat pripominky
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-800 text-center py-4 px-6 rounded-b-lg">
            <p className="text-white text-sm">Divadlo Studna</p>
            <p className="text-gray-400 text-xs mt-1">produkce@divadlo-studna.cz | www.divadlo-studna.cz</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Status screen component
function StatusScreen({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode
  title: string
  message: string
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">{message}</p>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">Divadlo Studna</p>
          <p className="text-xs text-gray-400 mt-1">produkce@divadlo-studna.cz</p>
        </div>
      </div>
    </div>
  )
}
