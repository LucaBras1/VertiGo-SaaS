'use client'

/**
 * Order Detail Page
 * Displays full order information and allows creating calendar events
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, User, FileText, DollarSign, Clock, Receipt, Send, CheckCircle, MessageCircle } from 'lucide-react'
import type { OrderPopulated, OrderItem as OrderItemType } from '@/types/admin'
import { CreateEventDialog } from '@/components/admin/modals/CreateEventDialog'
import { CreateInvoiceDialog } from '@/components/admin/modals/CreateInvoiceDialog'
import { OrderStatusChanger } from '@/components/admin/order/OrderStatusChanger'
import { ParticipantsPanel } from '@/components/admin/order/ParticipantsPanel'
import { useToast } from '@/hooks/useToast'

const statusLabels: Record<string, string> = {
  new: '📥 Nová',
  reviewing: '🔍 V posouzení',
  awaiting_info: '💬 Čeká na info',
  quote_sent: '💰 Nabídka odeslána',
  confirmed: '✅ Potvrzena',
  approved: '🎭 Schválena',
  completed: '✔️ Dokončena',
  cancelled: '❌ Zrušena',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  awaiting_info: 'bg-purple-100 text-purple-800',
  quote_sent: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-green-100 text-green-800',
  approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderPopulated | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}?populate=true`)

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
        toast('Chyba při načítání objednávky', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, toast])

  const handleEventCreated = () => {
    toast('Události úspěšně vytvořeny', 'success')
    setShowEventDialog(false)
    // Refresh order to update linkedEventId
    if (orderId) {
      fetch(`/api/admin/orders/${orderId}?populate=true`)
        .then(res => res.json())
        .then(data => setOrder(data.order))
    }
  }

  const handleInvoiceCreated = () => {
    // Refresh order to get updated invoice data
    if (orderId) {
      fetch(`/api/admin/orders/${orderId}?populate=true`)
        .then(res => res.json())
        .then(data => setOrder(data.order))
    }
  }

  const handleSendOffer = async () => {
    if (!orderId) return

    setSendingOffer(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/send-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba pri odesilani nabidky')
      }

      toast('Nabidka odeslana zakaznikovi', 'success')

      // Refresh order to update status
      const orderResponse = await fetch(`/api/admin/orders/${orderId}?populate=true`)
      const orderData = await orderResponse.json()
      setOrder(orderData.order)
    } catch (error) {
      console.error('Error sending offer:', error)
      toast(error instanceof Error ? error.message : 'Chyba pri odesilani nabidky', 'error')
    } finally {
      setSendingOffer(false)
    }
  }

  // Check if order can have offer sent
  const canSendOffer = order &&
    ['new', 'reviewing', 'awaiting_info'].includes(order.status) &&
    order.items &&
    order.items.length > 0

  // Check if order can have invoice created
  const canCreateInvoice = order &&
    ['confirmed', 'approved', 'completed'].includes(order.status) &&
    order.pricing?.totalPrice &&
    order.pricing.totalPrice > 0

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítání objednávky...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Objednávka nenalezena</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-900"
          >
            ← Zpět na seznam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          ← Zpět na objednávky
        </Link>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Objednávka {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Vytvořeno: {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            {/* Show Send Offer button for orders that can receive offers */}
            {canSendOffer && (
              <button
                onClick={handleSendOffer}
                disabled={sendingOffer}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                {sendingOffer ? 'Odesilaim...' : 'Odeslat nabidku'}
              </button>
            )}
            {/* Show Create Events button only for confirmed orders without linked event */}
            {order.status === 'confirmed' && !order.linkedEventId && order.items && order.items.length > 0 && (
              <button
                onClick={() => setShowEventDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Calendar className="h-5 w-5" />
                Vytvořit události v kalendáři
              </button>
            )}
            {/* Show Create Invoice button for confirmed/approved/completed orders with price */}
            {canCreateInvoice && (
              <button
                onClick={() => setShowInvoiceDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Receipt className="h-5 w-5" />
                Vystavit fakturu
              </button>
            )}
            <Link
              href={`/admin/orders/${order.id}/edit`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Upravit
            </Link>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderStatusChanger
            orderId={order.id || orderId}
            currentStatus={order.status}
            orderNumber={order.orderNumber || orderId}
          />
        </div>
        {order.linkedEventId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Udalosti vytvoreny</span>
          </div>
        )}
      </div>

      {/* Confirmation Info Panels */}
      {order.confirmedAt && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">Potvrzeno zakaznikem</h3>
              <div className="mt-1 text-sm text-green-700 space-y-1">
                <p>
                  <span className="font-medium">Datum:</span>{' '}
                  {new Date(order.confirmedAt).toLocaleString('cs-CZ')}
                </p>
                {order.confirmedByName && (
                  <p>
                    <span className="font-medium">Potvrdil:</span>{' '}
                    {order.confirmedByName}
                    {order.confirmedByEmail && ` (${order.confirmedByEmail})`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {order.customerComments && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Pripominky zakaznika</h3>
              <p className="mt-2 text-amber-700 whitespace-pre-wrap">{order.customerComments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Zákazník</h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">
                {order.customer?.firstName} {order.customer?.lastName}
              </p>
              {order.customer?.organization && (
                <p className="text-gray-600">{order.customer.organization}</p>
              )}
              <p className="text-gray-600">{order.customer?.email}</p>
              {order.customer?.phone && (
                <p className="text-gray-600">{order.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Detaily akce</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Název akce</label>
                <p className="mt-1 text-gray-900">{order.eventName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Termíny</label>
                <p className="mt-1 text-gray-900">
                  {order.dates && order.dates.length > 0
                    ? order.dates.map((d: string) => new Date(d).toLocaleDateString('cs-CZ')).join(', ')
                    : '-'}
                </p>
              </div>
              {order.arrivalTime && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Čas příjezdu</label>
                  <p className="mt-1 text-gray-900">{order.arrivalTime}</p>
                </div>
              )}
              {order.preparationTime && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Čas přípravy</label>
                  <p className="mt-1 text-gray-900">{order.preparationTime} min</p>
                </div>
              )}
            </div>
          </div>

          {/* Venue */}
          {order.venue && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Místo konání</h2>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{order.venue.name}</p>
                {order.venue.street && <p className="text-gray-600">{order.venue.street}</p>}
                {order.venue.city && order.venue.postalCode && (
                  <p className="text-gray-600">
                    {order.venue.postalCode} {order.venue.city}
                  </p>
                )}
                {order.venue.gpsCoordinates && (
                  <p className="text-sm text-gray-500">
                    GPS: {order.venue.gpsCoordinates.lat}, {order.venue.gpsCoordinates.lng}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Položky objednávky</h2>
            </div>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: OrderItemType) => (
                  <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium text-gray-900">
                      {item.performance?.title || item.game?.title || item.service?.title || 'Bez názvu'}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>{new Date(item.date).toLocaleDateString('cs-CZ')}</span>
                      {item.startTime && <span>{item.startTime}</span>}
                      {item.price > 0 && <span>{item.price.toLocaleString('cs-CZ')} Kč</span>}
                    </div>
                    {item.notes && (
                      <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Žádné položky</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <ParticipantsPanel
            orderId={order.id || orderId}
            orderStatus={order.status}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {order.pricing && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Cena</h2>
              </div>
              <div className="space-y-2">
                {order.pricing.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mezisoučet</span>
                    <span className="text-gray-900">{order.pricing.subtotal.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                )}
                {order.pricing.travelCosts && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doprava</span>
                    <span className="text-gray-900">{order.pricing.travelCosts.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                )}
                {order.pricing.discount && (
                  <div className="flex justify-between text-red-600">
                    <span>Sleva</span>
                    <span>-{order.pricing.discount.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Celkem</span>
                    <span>{order.pricing.totalPrice?.toLocaleString('cs-CZ') || 0} Kč</span>
                  </div>
                </div>
                {order.pricing.vatIncluded && (
                  <p className="text-xs text-gray-500">Včetně DPH</p>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Zdroj objednávky</h3>
            <p className="text-gray-900">{order.source || 'manual'}</p>
          </div>

          {/* Dates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Časové údaje</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Vytvořeno:</span>
                <p className="text-gray-900">{new Date(order.createdAt).toLocaleString('cs-CZ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Aktualizováno:</span>
                <p className="text-gray-900">{order.updatedAt ? new Date(order.updatedAt).toLocaleString('cs-CZ') : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      {showEventDialog && order.items && order.venue && (
        <CreateEventDialog
          isOpen={showEventDialog}
          onClose={() => setShowEventDialog(false)}
          orderId={order.id || orderId}
          orderNumber={order.orderNumber}
          orderItems={order.items}
          venue={{
            name: order.venue.name,
            city: order.venue.city,
          }}
          onEventCreated={handleEventCreated}
        />
      )}

      {/* Create Invoice Dialog */}
      {showInvoiceDialog && (
        <CreateInvoiceDialog
          isOpen={showInvoiceDialog}
          onClose={() => setShowInvoiceDialog(false)}
          orderId={order.id || orderId}
          orderNumber={order.orderNumber}
          customerEmail={order.customer?.email}
          totalPrice={order.pricing?.totalPrice}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}
    </div>
  )
}
