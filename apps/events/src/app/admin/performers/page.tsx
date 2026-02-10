'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { useToast } from '@/hooks/use-toast'
import { usePerformers, useDeletePerformer, type Performer, type PerformerType } from '@/hooks/use-performers'
import { SkeletonPerformerCard, SkeletonQuickStats, Skeleton } from '@/components/ui/skeleton'

export default function PerformersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<PerformerType | 'all'>('all')
  const { confirmDelete } = useConfirm()
  const toast = useToast()

  const { data: performers = [], isLoading, isError } = usePerformers(
    typeFilter !== 'all' ? typeFilter : undefined
  )
  const deletePerformer = useDeletePerformer()

  const handleDeletePerformer = async (id: string, name: string) => {
    const confirmed = await confirmDelete(name)
    if (confirmed) {
      try {
        await deletePerformer.mutateAsync(id)
        toast.success(`Performer "${name}" deleted`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete performer')
      }
    }
  }

  const filteredPerformers = useMemo(() => {
    return performers.filter((performer) => {
      const matchesSearch =
        performer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        performer.stageName?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [performers, searchQuery])

  // Calculate stats from real data
  const stats = useMemo(() => {
    const activeBookings = performers.reduce((sum, p) => {
      const pending = p.bookings?.filter((b) => b.status === 'pending' || b.status === 'confirmed').length || 0
      return sum + pending
    }, 0)

    const avgRating =
      performers.length > 0
        ? performers.reduce((sum, p) => sum + (p.rating || 0), 0) / performers.filter((p) => p.rating).length
        : 0

    return {
      total: performers.length,
      activeBookings,
      avgRating: avgRating ? avgRating.toFixed(1) : '-',
      totalBookings: performers.reduce((sum, p) => sum + p.totalBookings, 0),
    }
  }, [performers])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-9 w-40 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
        <SkeletonQuickStats />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPerformerCard key={i} />
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
            <h1 className="text-3xl font-display font-bold mb-2">Performers</h1>
            <p className="text-gray-600">Manage your talent roster</p>
          </div>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Failed to load performers</p>
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
          <h1 className="text-3xl font-display font-bold mb-2">Performers</h1>
          <p className="text-gray-600">Manage your talent roster</p>
        </div>

        <Link href="/admin/performers/new" className="btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Performer
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
              placeholder="Search performers..."
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
              onChange={(e) => setTypeFilter(e.target.value as PerformerType | 'all')}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="fire">Fire</option>
              <option value="magic">Magic</option>
              <option value="circus">Circus</option>
              <option value="music">Music</option>
              <option value="dance">Dance</option>
              <option value="comedy">Comedy</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Performers" value={stats.total.toString()} />
        <QuickStat label="Active Bookings" value={stats.activeBookings.toString()} />
        <QuickStat label="Avg Rating" value={stats.avgRating} />
        <QuickStat label="Total Bookings" value={stats.totalBookings.toString()} />
      </div>

      {/* Performers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPerformers.map((performer) => (
          <PerformerCard key={performer.id} performer={performer} onDelete={handleDeletePerformer} />
        ))}
      </div>

      {filteredPerformers.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No performers found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

function PerformerCard({
  performer,
  onDelete,
}: {
  performer: Performer
  onDelete: (id: string, name: string) => void
}) {
  const typeColors: Record<string, string> = {
    fire: 'from-orange-500 to-red-500',
    magic: 'from-purple-500 to-pink-500',
    circus: 'from-blue-500 to-cyan-500',
    music: 'from-green-500 to-emerald-500',
    dance: 'from-pink-500 to-rose-500',
    comedy: 'from-yellow-500 to-amber-500',
    interactive: 'from-indigo-500 to-purple-500',
  }

  const typeIcons: Record<string, string> = {
    fire: '\ud83d\udd25',
    magic: '\u2728',
    circus: '\ud83c\udfaa',
    music: '\ud83c\udfb5',
    dance: '\ud83d\udc83',
    comedy: '\ud83d\ude04',
    interactive: '\ud83c\udfae',
  }

  return (
    <div className="card group hover:scale-105 cursor-pointer">
      {/* Header with gradient */}
      <div
        className={`h-24 bg-gradient-to-br ${typeColors[performer.type] || 'from-gray-500 to-gray-600'} rounded-t-xl -m-6 mb-4 flex items-center justify-center text-5xl`}
      >
        {typeIcons[performer.type] || '\ud83c\udfad'}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{performer.name}</h3>
            {performer.stageName && (
              <p className="text-sm text-gray-600 italic">&quot;{performer.stageName}&quot;</p>
            )}
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
            {performer.type}
          </span>
        </div>

        {/* Rating & Bookings */}
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold text-gray-900">{performer.rating || '-'}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{performer.totalBookings}</span> bookings
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {performer.specialties.slice(0, 3).map((specialty, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm mb-4">
          {performer.email && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{performer.email}</span>
            </div>
          )}
          {performer.phone && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{performer.phone}</span>
            </div>
          )}
        </div>

        {/* Rate & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900">
              ${performer.standardRate ? Number(performer.standardRate).toLocaleString() : '-'}
            </span>
            <span className="text-sm text-gray-500">/event</span>
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/admin/performers/${performer.id}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              View
            </Link>
            <Link
              href={`/admin/bookings/new?performer=${performer.id}`}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Book
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(performer.id, performer.name)
              }}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
