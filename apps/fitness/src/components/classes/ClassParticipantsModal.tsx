'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Loader2, UserPlus, Check, UserX, Users, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  creditsRemaining: number
}

interface Booking {
  id: string
  clientId: string
  status: string
  checkedIn: boolean
  paid: boolean
  createdAt: string
  client: Client | null
}

interface ClassParticipantsModalProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  className: string
  capacity: number
}

export function ClassParticipantsModal({
  isOpen,
  onClose,
  classId,
  className,
  capacity,
}: ClassParticipantsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableClients, setAvailableClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [useCredits, setUseCredits] = useState(true)
  const [showAddClient, setShowAddClient] = useState(false)

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/classes/${classId}/bookings`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      setBookings(data.bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Nepodařilo se načíst účastníky')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()

      // Filter out clients who are already booked
      const bookedClientIds = bookings
        .filter((b) => b.status !== 'cancelled')
        .map((b) => b.clientId)
      const available = data.clients.filter(
        (c: Client) => !bookedClientIds.includes(c.id)
      )
      setAvailableClients(available)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchBookings()
    }
  }, [isOpen, classId])

  useEffect(() => {
    if (showAddClient) {
      fetchAvailableClients()
    }
  }, [showAddClient, bookings])

  const handleCheckIn = async (bookingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update check-in')

      toast.success(currentStatus ? 'Check-in zrušen' : 'Klient přihlášen')
      fetchBookings()
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat check-in')
    }
  }

  const handleRemoveBooking = async (bookingId: string) => {
    if (!confirm('Opravdu chcete zrušit tuto rezervaci?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to cancel booking')

      toast.success('Rezervace byla zrušena')
      fetchBookings()
    } catch (error) {
      toast.error('Nepodařilo se zrušit rezervaci')
    }
  }

  const handleAddClient = async () => {
    if (!selectedClientId) {
      toast.error('Vyberte klienta')
      return
    }

    setIsAddingClient(true)
    try {
      const response = await fetch(`/api/classes/${classId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          useCredits,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add client')
      }

      toast.success('Klient byl přihlášen na lekci')
      setSelectedClientId('')
      setShowAddClient(false)
      fetchBookings()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se přidat klienta')
    } finally {
      setIsAddingClient(false)
    }
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')
  const checkedInCount = confirmedBookings.filter((b) => b.checkedIn).length
  const availableSpots = capacity - confirmedBookings.length

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {className}
                    </Dialog.Title>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {confirmedBookings.length}/{capacity} účastníků
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-600" />
                        {checkedInCount} check-in
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchBookings}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Obnovit"
                    >
                      <RefreshCw className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Add Client Section */}
                {availableSpots > 0 && (
                  <div className="mb-4">
                    {!showAddClient ? (
                      <button
                        onClick={() => setShowAddClient(true)}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Přidat účastníka ({availableSpots} volných míst)
                      </button>
                    ) : (
                      <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <select
                          value={selectedClientId}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Vyberte klienta...</option>
                          {availableClients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} ({client.creditsRemaining} kreditů)
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={useCredits}
                            onChange={(e) => setUseCredits(e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          Použít kredit klienta
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAddClient(false)}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Zrušit
                          </button>
                          <button
                            onClick={handleAddClient}
                            disabled={isAddingClient || !selectedClientId}
                            className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isAddingClient && <Loader2 className="h-4 w-4 animate-spin" />}
                            Přidat
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Participants List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : confirmedBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Zatím žádní účastníci
                    </div>
                  ) : (
                    confirmedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-lg border ${
                          booking.checkedIn
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                              {booking.client?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.client?.name || 'Neznámý klient'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.client?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {booking.paid && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                Zaplaceno
                              </span>
                            )}
                            <button
                              onClick={() => handleCheckIn(booking.id, booking.checkedIn)}
                              className={`p-2 rounded-lg transition-colors ${
                                booking.checkedIn
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                              title={booking.checkedIn ? 'Zrušit check-in' : 'Check-in'}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveBooking(booking.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Zrušit rezervaci"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Zavřít
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
