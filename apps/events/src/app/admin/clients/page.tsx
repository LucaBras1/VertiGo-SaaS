'use client'

import { useState, useMemo } from 'react'
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
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { useConfirm } from '@vertigo/ui'
import { useToast } from '@/hooks/use-toast'
import { useClients, useDeleteClient, type Client } from '@/hooks/use-clients'
import { SkeletonClientCard, SkeletonStatCard, Skeleton } from '@/components/ui/skeleton'

type ClientTypeFilter = 'all' | 'individual' | 'corporate'

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>('all')
  const { confirmDelete } = useConfirm()
  const toast = useToast()

  const { data: clients = [], isLoading, isError } = useClients(
    searchQuery || undefined,
    typeFilter !== 'all' ? typeFilter : undefined
  )
  const deleteClient = useDeleteClient()

  const handleDeleteClient = async (id: string, name: string) => {
    const confirmed = await confirmDelete(name)
    if (confirmed) {
      try {
        await deleteClient.mutateAsync(id)
        toast.success(`Client "${name}" deleted`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete client')
      }
    }
  }

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        !searchQuery ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [clients, searchQuery])

  // Calculate stats from real data
  const stats = useMemo(() => {
    return {
      total: clients.length,
      corporate: clients.filter((c) => c.clientType === 'corporate').length,
      individual: clients.filter((c) => c.clientType === 'individual').length,
      totalRevenue: clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
    }
  }, [clients])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonClientCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Clients</h1>
            <p className="text-gray-600">Manage your client relationships and bookings</p>
          </div>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Failed to load clients</p>
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
          <h1 className="text-3xl font-display font-bold mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships and bookings</p>
        </div>

        <Link href="/admin/clients/new" className="btn-primary inline-flex items-center">
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
          icon={<Building2 className="w-6 h-6" />}
          label="Corporate"
          value={stats.corporate.toString()}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Individual"
          value={stats.individual.toString()}
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

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ClientTypeFilter)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="corporate">Corporate</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} onDelete={handleDeleteClient} />
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
  gradient,
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
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function ClientCard({
  client,
  onDelete,
}: {
  client: Client
  onDelete: (id: string, name: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const typeConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    corporate: { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Corporate' },
    individual: { icon: UserCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Individual' },
  }

  const clientTypeInfo = typeConfig[client.clientType] || typeConfig.individual
  const TypeIcon = clientTypeInfo.icon

  const totalEvents = client.totalEvents || client._count?.events || 0
  const upcomingEvents = client.upcomingEvents || 0
  const totalRevenue = client.totalRevenue || 0

  return (
    <div className="card group hover:scale-[1.01] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {client.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
            {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
            <div className="flex items-center space-x-2 mt-1">
              <TypeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 capitalize">{client.clientType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div
            className={`${clientTypeInfo.bg} ${clientTypeInfo.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}
          >
            <TypeIcon className="w-3 h-3" />
            <span>{clientTypeInfo.label}</span>
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-10">
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
                <Link
                  href={`/admin/clients/${client.id}/edit`}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(client.id, client.name)
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
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{client.phone}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Events</p>
          <p className="text-xl font-bold text-gray-900">{totalEvents}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Upcoming</p>
          <p className="text-xl font-bold text-primary-600">{upcomingEvents}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">${(totalRevenue / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {client.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {client.tags.length === 0 && <span className="text-gray-400 text-sm">-</span>}
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="space-y-2 mb-4">
        {client.lastEvent && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last Event:</span>
            </div>
            <span className="font-medium text-gray-900">
              {new Date(client.lastEvent).toLocaleDateString()}
            </span>
          </div>
        )}
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
          <p className="text-sm text-gray-700 line-clamp-2">{client.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          href={`/admin/clients/${client.id}`}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors text-center"
        >
          View Details
        </Link>
        <Link
          href={`/admin/events/new?client=${client.id}`}
          className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
        >
          New Event
        </Link>
      </div>
    </div>
  )
}
