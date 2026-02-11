'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useConfirm } from '@vertigo/ui'
import { useToast } from '@/hooks/use-toast'
import { useEvents, useDeleteEvent, type Event } from '@/hooks/use-events'
import { SkeletonTable, SkeletonQuickStats, Skeleton } from '@/components/ui/skeleton'

type EventStatusFilter = 'all' | 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all')
  const { confirmDelete } = useConfirm()
  const toast = useToast()

  const { data: events = [], isLoading, isError } = useEvents()
  const deleteEvent = useDeleteEvent()

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    const confirmed = await confirmDelete(eventName)
    if (confirmed) {
      try {
        await deleteEvent.mutateAsync(eventId)
        toast.success(`Event "${eventName}" deleted`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete event')
      }
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [events, searchQuery, statusFilter])

  // Calculate stats from real data
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = events.filter((e) => {
      const eventDate = new Date(e.date)
      return (
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getFullYear() === now.getFullYear()
      )
    })

    return {
      total: events.length,
      thisMonth: thisMonth.length,
      confirmed: events.filter((e) => e.status === 'confirmed').length,
      planning: events.filter((e) => e.status === 'planning').length,
    }
  }, [events])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
        <SkeletonQuickStats />
        <div className="card">
          <SkeletonTable rows={4} />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Events</h1>
            <p className="text-gray-600">Manage all your events in one place</p>
          </div>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Failed to load events</p>
          <p className="text-gray-400 text-sm">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Events</h1>
          <p className="text-gray-600">Manage all your events in one place</p>
        </div>

        <Link href="/admin/events/new" className="btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatusFilter)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Events" value={stats.total.toString()} />
        <QuickStat label="This Month" value={stats.thisMonth.toString()} />
        <QuickStat label="Confirmed" value={stats.confirmed.toString()} />
        <QuickStat label="Planning" value={stats.planning.toString()} />
      </div>

      {/* Events List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Event</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Venue</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Details</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Budget</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <EventRow key={event.id} event={event} onDelete={handleDeleteEvent} />
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No events found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EventRow({
  event,
  onDelete,
}: {
  event: Event
  onDelete: (id: string, name: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const statusColors: Record<string, string> = {
    planning: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const venueName = event.venue?.name || event.venueCustom || '-'
  const performerCount = event.bookings?.length || 0
  const budget = event.totalBudget || 0

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div>
          <p className="font-semibold text-gray-900">{event.name}</p>
          <p className="text-sm text-gray-500 capitalize">{event.type.replace('_', ' ')}</p>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Calendar className="w-4 h-4" />
          <div>
            <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">{event.startTime}</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>{venueName}</span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.guestCount || 0} guests</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{performerCount} performers</span>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status] || 'bg-gray-100 text-gray-700'}`}
        >
          {event.status.replace('_', ' ')}
        </span>
      </td>

      <td className="py-4 px-4">
        <p className="font-semibold text-gray-900">${Number(budget).toLocaleString()}</p>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/admin/events/${event.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Link>

          <Link
            href={`/admin/events/${event.id}/edit`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Link>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-10">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(event.id, event.name)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
