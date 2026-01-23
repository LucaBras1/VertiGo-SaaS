'use client'

/**
 * Event Form Component
 *
 * Form for creating and editing events
 * Events can be linked to a Performance or Game
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EventFormProps {
  event?: any
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Available performances and games
  const [performances, setPerformances] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Event Type Selection
  const [eventType, setEventType] = useState<'performance' | 'game' | 'custom'>(
    event?.performanceId ? 'performance' : event?.gameId ? 'game' : 'custom'
  )
  const [performanceId, setPerformanceId] = useState(event?.performanceId || '')
  const [gameId, setGameId] = useState(event?.gameId || '')

  // Date & Time
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().slice(0, 16) : ''
  )
  const [endDate, setEndDate] = useState(
    event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
  )

  // Venue
  const [venueName, setVenueName] = useState(event?.venue?.name || '')
  const [venueCity, setVenueCity] = useState(event?.venue?.city || '')
  const [venueAddress, setVenueAddress] = useState(event?.venue?.address || '')

  // Status
  const [status, setStatus] = useState(event?.status || 'confirmed')
  const [isPublic, setIsPublic] = useState(event?.isPublic !== undefined ? event.isPublic : true)

  // Additional Info
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl || '')
  const [notes, setNotes] = useState(event?.notes || '')

  // Fetch performances and games on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [performancesRes, gamesRes] = await Promise.all([
          fetch('/api/admin/performances'),
          fetch('/api/admin/games'),
        ])

        const performancesData = await performancesRes.json()
        const gamesData = await gamesRes.json()

        setPerformances(performancesData.data || [])
        setGames(gamesData.data || [])
      } catch (err) {
        console.error('Error fetching options:', err)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Build venue object
      const venue: any = {}
      if (venueName) venue.name = venueName
      if (venueCity) venue.city = venueCity
      if (venueAddress) venue.address = venueAddress

      if (!venue.name) {
        throw new Error('Venue name is required')
      }

      const data = {
        performanceId: eventType === 'performance' ? performanceId : null,
        gameId: eventType === 'game' ? gameId : null,
        date,
        endDate: endDate || null,
        venue,
        status,
        isPublic,
        ticketUrl: ticketUrl || null,
        notes: notes || null,
      }

      const url = event ? `/api/admin/events/${event.id}` : '/api/admin/events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save event')
      }

      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Načítání...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při ukládání</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Event Type & Link */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Typ akce</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vyberte, zda se jedná o představení, hru, nebo vlastní akci
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Event Type Radio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Typ akce <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="performance"
                    checked={eventType === 'performance'}
                    onChange={(e) => {
                      setEventType('performance')
                      setGameId('')
                    }}
                    className="mr-2"
                  />
                  <span>🎭 Představení</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="game"
                    checked={eventType === 'game'}
                    onChange={(e) => {
                      setEventType('game')
                      setPerformanceId('')
                    }}
                    className="mr-2"
                  />
                  <span>🎮 Hra</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="custom"
                    checked={eventType === 'custom'}
                    onChange={(e) => {
                      setEventType('custom')
                      setPerformanceId('')
                      setGameId('')
                    }}
                    className="mr-2"
                  />
                  <span>✨ Vlastní akce</span>
                </label>
              </div>
            </div>

            {/* Performance Selection */}
            {eventType === 'performance' && (
              <div>
                <label htmlFor="performanceId" className="block text-sm font-medium text-gray-700">
                  Vyberte představení <span className="text-red-500">*</span>
                </label>
                <select
                  id="performanceId"
                  value={performanceId}
                  onChange={(e) => setPerformanceId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Vyberte představení --</option>
                  {performances.map((perf) => (
                    <option key={perf.id} value={perf.id}>
                      {perf.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Game Selection */}
            {eventType === 'game' && (
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700">
                  Vyberte hru <span className="text-red-500">*</span>
                </label>
                <select
                  id="gameId"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Vyberte hru --</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Datum a čas</h3>
            <p className="mt-1 text-sm text-gray-500">Kdy se akce koná</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Start Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Datum a čas začátku <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* End Date (Optional) */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Datum a čas konce (volitelné)
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Pro vícedenní akce nebo s přesným časem konce
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Místo konání</h3>
            <p className="mt-1 text-sm text-gray-500">Kde se akce koná</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Venue Name */}
            <div>
              <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                Název místa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="venueName"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
                placeholder="např. Divadlo ABC, Kulturní centrum XYZ"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="venueCity" className="block text-sm font-medium text-gray-700">
                Město
              </label>
              <input
                type="text"
                id="venueCity"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="Praha"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
                Adresa
              </label>
              <input
                type="text"
                id="venueAddress"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Divadelní 123, 110 00 Praha 1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status & Visibility */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Stav a viditelnost</h3>
            <p className="mt-1 text-sm text-gray-500">Nastavení zobrazení akce</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Stav akce
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="confirmed">✓ Potvrzeno</option>
                <option value="tentative">? Nezávazně</option>
                <option value="cancelled">✗ Zrušeno</option>
              </select>
            </div>

            {/* Is Public */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Zobrazit veřejně na webu</span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                Pokud není zaškrtnuto, akce bude viditelná pouze v administraci
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Doplňující informace</h3>
            <p className="mt-1 text-sm text-gray-500">Volitelné údaje</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Ticket URL */}
            <div>
              <label htmlFor="ticketUrl" className="block text-sm font-medium text-gray-700">
                Odkaz na vstupenky
              </label>
              <input
                type="url"
                id="ticketUrl"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="https://goout.cz/cs/listky/..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Poznámky
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Interní poznámky k akci..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Ukládám...' : event ? 'Uložit změny' : 'Vytvořit akci'}
        </button>
      </div>
    </form>
  )
}
