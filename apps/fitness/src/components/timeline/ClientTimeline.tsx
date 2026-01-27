'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, Flag, Loader2, Plus, RefreshCw } from 'lucide-react'
import { TimelineEventComponent } from './TimelineEvent'
import { MilestoneModal } from './MilestoneModal'
import type { TimelineEvent, TimelineEventType } from '@/lib/timeline/event-aggregator'
import { cn } from '@/lib/utils'

interface ClientTimelineProps {
  clientId: string
  className?: string
}

const EVENT_TYPE_OPTIONS: { value: TimelineEventType; label: string }[] = [
  { value: 'session_completed', label: 'Tréninky' },
  { value: 'measurement_recorded', label: 'Měření' },
  { value: 'badge_earned', label: 'Odznaky' },
  { value: 'invoice_paid', label: 'Platby' },
  { value: 'milestone', label: 'Milníky' },
  { value: 'note', label: 'Poznámky' },
]

export function ClientTimeline({ clientId, className }: ClientTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<TimelineEventType[]>([])
  const [milestonesOnly, setMilestonesOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

  const fetchTimeline = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true)
          setOffset(0)
        } else {
          setLoadingMore(true)
        }

        const currentOffset = reset ? 0 : offset
        const params = new URLSearchParams({
          limit: '20',
          offset: currentOffset.toString(),
        })

        if (selectedTypes.length > 0) {
          params.set('types', selectedTypes.join(','))
        }

        if (milestonesOnly) {
          params.set('milestonesOnly', 'true')
        }

        const response = await fetch(`/api/clients/${clientId}/timeline?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch timeline')
        }

        const data = await response.json()

        if (reset) {
          setEvents(data.events)
        } else {
          setEvents((prev) => [...prev, ...data.events])
        }

        setTotal(data.total)
        setHasMore(data.hasMore)
        setOffset(currentOffset + data.events.length)
        setError(null)
      } catch (err) {
        setError('Nepodařilo se načíst timeline')
        console.error('Timeline fetch error:', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [clientId, offset, selectedTypes, milestonesOnly]
  )

  useEffect(() => {
    fetchTimeline(true)
  }, [clientId, selectedTypes, milestonesOnly])

  const handleTypeToggle = (type: TimelineEventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleMilestoneSaved = (newEvent: TimelineEvent) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? newEvent : e))
      )
    } else {
      setEvents((prev) => [newEvent, ...prev])
      setTotal((prev) => prev + 1)
    }
    setShowMilestoneModal(false)
    setEditingEvent(null)
  }

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event)
    setShowMilestoneModal(true)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Timeline</h2>
          {total > 0 && (
            <span className="px-2 py-0.5 text-xs bg-secondary-700 text-gray-400 rounded-full">
              {total} událostí
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-secondary-700 text-gray-400 hover:text-white'
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            onClick={() => fetchTimeline(true)}
            className="p-2 rounded-lg bg-secondary-700 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowMilestoneModal(true)
            }}
            className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Přidat milník
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-secondary-800 rounded-lg p-4 border border-secondary-700 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Typ události
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTypeToggle(option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    selectedTypes.includes(option.value)
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={milestonesOnly}
                onChange={(e) => setMilestonesOnly(e.target.checked)}
                className="rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300 flex items-center gap-1">
                <Flag className="h-4 w-4 text-yellow-400" />
                Pouze milníky
              </span>
            </label>

            {(selectedTypes.length > 0 || milestonesOnly) && (
              <button
                onClick={() => {
                  setSelectedTypes([])
                  setMilestonesOnly(false)
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Zrušit filtry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchTimeline(true)}
            className="text-primary-400 hover:text-primary-300"
          >
            Zkusit znovu
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-secondary-800/50 rounded-lg border border-secondary-700">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">Zatím žádné události</p>
          <p className="text-sm text-gray-500">
            Timeline se automaticky plní při dokončení tréninků, měření a dalších aktivitách.
          </p>
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="mt-4 text-primary-400 hover:text-primary-300 text-sm"
          >
            Přidat první milník
          </button>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((event, index) => (
            <TimelineEventComponent
              key={event.id}
              event={event}
              isLast={index === events.length - 1 && !hasMore}
              onEdit={event.source === 'manual' ? handleEdit : undefined}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchTimeline(false)}
                disabled={loadingMore}
                className="px-4 py-2 bg-secondary-700 text-gray-300 rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Načítám...
                  </span>
                ) : (
                  'Načíst další'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <MilestoneModal
          clientId={clientId}
          event={editingEvent}
          onClose={() => {
            setShowMilestoneModal(false)
            setEditingEvent(null)
          }}
          onSave={handleMilestoneSaved}
        />
      )}
    </div>
  )
}
