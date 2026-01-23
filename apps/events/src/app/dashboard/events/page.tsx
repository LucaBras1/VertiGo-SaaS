'use client'

import { useState } from 'react'
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
  Trash2
} from 'lucide-react'

type EventStatus = 'all' | 'planning' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Tech Summit 2024',
    type: 'corporate',
    date: '2024-01-24',
    startTime: '09:00',
    venue: 'Convention Center',
    guestCount: 200,
    performers: 5,
    status: 'confirmed',
    budget: 15000
  },
  {
    id: '2',
    name: 'Corporate Gala Evening',
    type: 'gala',
    date: '2024-01-28',
    startTime: '18:00',
    venue: 'Grand Hotel Ballroom',
    guestCount: 150,
    performers: 8,
    status: 'in-progress',
    budget: 25000
  },
  {
    id: '3',
    name: 'Summer Music Festival',
    type: 'festival',
    date: '2024-02-05',
    startTime: '14:00',
    venue: 'Riverside Park',
    guestCount: 500,
    performers: 12,
    status: 'planning',
    budget: 50000
  },
  {
    id: '4',
    name: 'Product Launch Party',
    type: 'product_launch',
    date: '2024-02-10',
    startTime: '19:00',
    venue: 'Innovation Hub',
    guestCount: 100,
    performers: 3,
    status: 'confirmed',
    budget: 8000
  },
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all')

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Events</h1>
          <p className="text-gray-600">Manage all your events in one place</p>
        </div>

        <Link href="/dashboard/events/new" className="btn-primary inline-flex items-center">
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
              onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Events" value={MOCK_EVENTS.length.toString()} />
        <QuickStat label="This Month" value="8" />
        <QuickStat label="Confirmed" value="5" />
        <QuickStat label="Planning" value="3" />
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
                <EventRow key={event.id} event={event} />
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

function EventRow({ event }: { event: typeof MOCK_EVENTS[0] }) {
  const [showMenu, setShowMenu] = useState(false)

  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  }

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
          <span>{event.venue}</span>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{event.guestCount} guests</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{event.performers} performers</span>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status as keyof typeof statusColors]}`}>
          {event.status.replace('-', ' ')}
        </span>
      </td>

      <td className="py-4 px-4">
        <p className="font-semibold text-gray-900">${event.budget.toLocaleString()}</p>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/dashboard/events/${event.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </Link>

          <Link
            href={`/dashboard/events/${event.id}/edit`}
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
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center space-x-2">
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
