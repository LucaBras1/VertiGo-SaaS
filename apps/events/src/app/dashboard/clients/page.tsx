'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserCircle2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react'

type ClientStatus = 'all' | 'active' | 'prospect' | 'inactive'

const MOCK_CLIENTS = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.johnson@techsolutions.com',
    phone: '+1 234 567 8900',
    company: 'Tech Solutions Inc.',
    industry: 'Technology',
    status: 'active',
    totalEvents: 12,
    upcomingEvents: 3,
    totalRevenue: 145000,
    lastEvent: '2024-01-15',
    nextEvent: '2024-01-25',
    rating: 4.9,
    notes: 'Prefers tech-focused venues'
  },
  {
    id: '2',
    name: 'Global Marketing Corp',
    contactPerson: 'Michael Chen',
    email: 'michael@globalmarketing.com',
    phone: '+1 234 567 8901',
    company: 'Global Marketing Corp',
    industry: 'Marketing',
    status: 'active',
    totalEvents: 8,
    upcomingEvents: 2,
    totalRevenue: 95000,
    lastEvent: '2024-01-10',
    nextEvent: '2024-02-05',
    rating: 4.7,
    notes: 'Large scale events preferred'
  },
  {
    id: '3',
    name: 'StartUp Ventures',
    contactPerson: 'Emily Rodriguez',
    email: 'emily@startupventures.com',
    phone: '+1 234 567 8902',
    company: 'StartUp Ventures',
    industry: 'Finance',
    status: 'prospect',
    totalEvents: 2,
    upcomingEvents: 1,
    totalRevenue: 25000,
    lastEvent: '2023-12-20',
    nextEvent: '2024-02-15',
    rating: 4.5,
    notes: 'Budget-conscious, looking for growth'
  },
  {
    id: '4',
    name: 'Healthcare Alliance',
    contactPerson: 'Dr. James Wilson',
    email: 'j.wilson@healthcarealliance.org',
    phone: '+1 234 567 8903',
    company: 'Healthcare Alliance',
    industry: 'Healthcare',
    status: 'active',
    totalEvents: 15,
    upcomingEvents: 4,
    totalRevenue: 180000,
    lastEvent: '2024-01-18',
    nextEvent: '2024-01-28',
    rating: 5.0,
    notes: 'VIP client, premium services'
  },
  {
    id: '5',
    name: 'Creative Agency Ltd',
    contactPerson: 'Lisa Anderson',
    email: 'lisa@creativeagency.com',
    phone: '+1 234 567 8904',
    company: 'Creative Agency Ltd',
    industry: 'Advertising',
    status: 'inactive',
    totalEvents: 5,
    upcomingEvents: 0,
    totalRevenue: 42000,
    lastEvent: '2023-10-05',
    nextEvent: null,
    rating: 4.3,
    notes: 'Last contact 3 months ago'
  },
]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus>('all')

  const filteredClients = MOCK_CLIENTS.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: MOCK_CLIENTS.length,
    active: MOCK_CLIENTS.filter(c => c.status === 'active').length,
    prospects: MOCK_CLIENTS.filter(c => c.status === 'prospect').length,
    totalRevenue: MOCK_CLIENTS.reduce((sum, c) => sum + c.totalRevenue, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and bookings</p>
        </div>

        <Link href="/dashboard/clients/new" className="btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<UserCircle2 className="w-6 h-6" />}
          label="Total Clients"
          value={stats.total.toString()}
          gradient="from-primary-500 to-primary-600"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Active Clients"
          value={stats.active.toString()}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Prospects"
          value={stats.prospects.toString()}
          gradient="from-accent-500 to-accent-600"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          gradient="from-blue-500 to-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search clients, companies..."
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
              onChange={(e) => setStatusFilter(e.target.value as ClientStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="card text-center py-12">
          <UserCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No clients found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  gradient
}: {
  icon: React.ReactNode
  label: string
  value: string
  gradient: string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ClientCard({ client }: { client: typeof MOCK_CLIENTS[0] }) {
  const [showMenu, setShowMenu] = useState(false)

  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
    prospect: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Prospect' },
    inactive: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Inactive' },
  }

  const status = statusConfig[client.status as keyof typeof statusConfig]
  const StatusIcon = status.icon

  return (
    <div className="card group hover:scale-[1.01] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {client.contactPerson.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.contactPerson}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{client.industry}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className={`${status.bg} ${status.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
            <StatusIcon className="w-3 h-3" />
            <span>{status.label}</span>
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-10">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
                <Link
                  href={`/dashboard/clients/${client.id}/edit`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{client.phone}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Events</p>
          <p className="text-xl font-bold text-gray-900">{client.totalEvents}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Upcoming</p>
          <p className="text-xl font-bold text-primary-600">{client.upcomingEvents}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">${(client.totalRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Rating</p>
          <p className="text-xl font-bold text-yellow-600">{client.rating}</p>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last Event:</span>
          </div>
          <span className="font-medium text-gray-900">
            {new Date(client.lastEvent).toLocaleDateString()}
          </span>
        </div>
        {client.nextEvent && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Next Event:</span>
            </div>
            <span className="font-medium text-primary-600">
              {new Date(client.nextEvent).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">NOTES</p>
          <p className="text-sm text-gray-700">{client.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors text-center"
        >
          View Details
        </Link>
        <Link
          href={`/dashboard/events/new?client=${client.id}`}
          className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
        >
          New Event
        </Link>
      </div>
    </div>
  )
}
