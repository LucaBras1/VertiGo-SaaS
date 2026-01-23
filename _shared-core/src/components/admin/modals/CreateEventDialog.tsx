/**
 * Create Event Dialog - Confirm event creation from confirmed order
 * Allows selecting which order items to add to the calendar
 */
'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Calendar, X, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface OrderItem {
  id: string
  type?: 'performance' | 'game' | 'service'
  performanceId?: string
  gameId?: string
  serviceId?: string
  date: string
  performance?: { title: string }
  game?: { title: string }
  service?: { title: string }
}

interface CreateEventDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber?: string
  orderItems: OrderItem[]
  venue: {
    name: string
    city?: string
  }
  onEventCreated: () => void
}

export function CreateEventDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  orderItems,
  venue,
  onEventCreated,
}: CreateEventDialogProps) {
  const { toast } = useToast()
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setSelectedItemIds([])
    onClose()
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItemIds.length === orderItems.length) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(orderItems.map((item) => item.id))
    }
  }

  const handleCreateEvents = async () => {
    if (selectedItemIds.length === 0) {
      toast('Vyberte alespoň jednu položku pro vytvoření události', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/events/from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          itemIds: selectedItemIds,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(
          `Úspěšně vytvořeno ${data.eventsCreated} ${data.eventsCreated === 1 ? 'událost' : data.eventsCreated > 1 && data.eventsCreated < 5 ? 'události' : 'událostí'}`,
          'success'
        )
        onEventCreated()
        handleClose()
      } else {
        const error = await response.json()
        toast(error.error || 'Chyba při vytváření událostí', 'error')
      }
    } catch (error) {
      console.error('Error creating events:', error)
      toast('Chyba při vytváření událostí', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getItemTitle = (item: OrderItem) => {
    if (item.performance) return item.performance.title
    if (item.game) return item.game.title
    if (item.service) return item.service.title
    return 'Bez názvu'
  }

  const getItemTypeLabel = (type?: string) => {
    switch (type) {
      case 'performance':
        return 'Inscenace'
      case 'game':
        return 'Hra'
      case 'service':
        return 'Služba'
      default:
        return type || 'Položka'
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all text-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                        Vytvořit události v kalendáři
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Objednávka #{orderNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-700 mb-4">
                    Objednávka byla potvrzena. Vyberte položky, které chcete přidat do veřejného
                    kalendáře akcí:
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.length === orderItems.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Vybrat vše
                      </label>
                      <span className="text-xs text-gray-500">
                        {selectedItemIds.length} / {orderItems.length} vybráno
                      </span>
                    </div>

                    {orderItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {getItemTitle(item)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              {getItemTypeLabel(item.type)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('cs-CZ', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}{' '}
                            • {venue.name}
                            {venue.city && `, ${venue.city}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Poznámka:</strong> Události budou vytvořeny jako <strong>soukromé</strong> (isPublic: false).
                      Můžete je později zveřejnit v administraci událostí.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateEvents}
                    disabled={isSubmitting || selectedItemIds.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? 'Vytvářím...'
                      : `Vytvořit ${selectedItemIds.length > 0 ? `(${selectedItemIds.length})` : ''}`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
