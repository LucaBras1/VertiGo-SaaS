/**
 * Booking Payment Page
 * Displays order summary and initiates Stripe checkout
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  Calendar,
  MapPin,
  Package,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  PartyPopper,
} from 'lucide-react'
import { redirectToCheckout, formatCurrency } from '@/lib/stripe-client'

interface OrderDetails {
  id: string
  orderNumber: string
  partyName: string
  status: string
  venue: string | null
  guestCount: number | null
  dates: {
    date: string
    startTime: string
    duration: number
  } | null
  pricing: {
    subtotal: number
    total: number
    deposit: number
  } | null
  customer: {
    firstName: string
    lastName: string
    email: string
  } | null
  linkedParty: {
    date: string
    childName: string
    childAge: number
    package: {
      title: string
    } | null
  } | null
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    } else {
      setError('Chybí ID objednávky')
      setIsLoading(false)
    }
  }, [orderId])

  async function fetchOrder(id: string) {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Objednávka nebyla nalezena')
        }
        throw new Error('Chyba při načítání objednávky')
      }
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePayment() {
    if (!orderId) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentType: 'deposit',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Chyba při vytváření platby')
      }

      const { sessionId, url } = await response.json()

      // Prefer direct URL redirect if available
      if (url) {
        window.location.href = url
      } else if (sessionId) {
        await redirectToCheckout(sessionId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při zpracování platby')
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 to-partypal-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-partypal-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Načítání objednávky...</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 to-partypal-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chyba</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center text-partypal-pink-500 hover:text-partypal-pink-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    )
  }

  if (!order) return null

  const pricing = order.pricing || { total: 0, deposit: 0 }
  const partyDate = order.linkedParty?.date
    ? new Date(order.linkedParty.date).toLocaleDateString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : order.dates?.date || 'Neuvedeno'
  const partyTime = order.dates?.startTime || ''
  const packageName = order.linkedParty?.package?.title || 'Vlastní program'

  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 to-partypal-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <PartyPopper className="w-12 h-12 text-partypal-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dokončete rezervaci
          </h1>
          <p className="text-gray-600">
            Objednávka #{order.orderNumber}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-partypal-pink-500 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">{order.partyName}</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Party Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-partypal-pink-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Datum a čas</p>
                  <p className="font-medium text-gray-900">{partyDate}</p>
                  {partyTime && (
                    <p className="text-sm text-gray-600">v {partyTime}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-partypal-pink-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Místo</p>
                  <p className="font-medium text-gray-900">
                    {order.venue || 'Neuvedeno'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-partypal-pink-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Balíček</p>
                  <p className="font-medium text-gray-900">{packageName}</p>
                </div>
              </div>

              {order.guestCount && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-partypal-pink-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Počet hostů</p>
                    <p className="font-medium text-gray-900">
                      {order.guestCount} dětí
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-200" />

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Celková cena</span>
                <span>{formatCurrency(pricing.total)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Záloha k úhradě (30%)</span>
                <span className="text-partypal-pink-500">
                  {formatCurrency(pricing.deposit)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Zbývající doplatek {formatCurrency(pricing.total - pricing.deposit)} uhradíte před oslavou.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-partypal-pink-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-partypal-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Přesměrování na platbu...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Zaplatit zálohu {formatCurrency(pricing.deposit)}
            </>
          )}
        </button>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zpět na hlavní stránku
          </Link>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Platba je zabezpečena pomocí Stripe. Vaše údaje jsou v bezpečí.
        </p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 to-partypal-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-partypal-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Načítání...</p>
      </div>
    </div>
  )
}

export default function BookingPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentContent />
    </Suspense>
  )
}
