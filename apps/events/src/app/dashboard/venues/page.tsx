'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Star,
  Wifi,
  ParkingCircle,
  UtensilsCrossed,
  Music,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'
import { useToast } from '@/hooks/use-toast'
import { useVenues, useDeleteVenue, type Venue } from '@/hooks/use-venues'
import { SkeletonVenueCard, SkeletonQuickStats, Skeleton } from '@/components/ui/skeleton'

type VenueType = 'all' | 'indoor' | 'outdoor' | 'mixed'

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<VenueType>('all')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const { confirmDelete } = useConfirm()
  const toast = useToast()

  const { data: venues = [], isLoading, isError } = useVenues(
    typeFilter !== 'all' ? typeFilter : undefined
  )
  const deleteVenue = useDeleteVenue()

  const handleDeleteVenue = async (id: string, name: string) => {
    const confirmed = await confirmDelete(name)
    if (confirmed) {
      try {
        await deleteVenue.mutateAsync(id)
        toast.success(`Venue "${name}" deleted`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete venue')
      }
    }
  }

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch =
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCapacity =
        capacityFilter === 'all' ||
        (capacityFilter === 'small' && (venue.capacity || 0) < 200) ||
        (capacityFilter === 'medium' && (venue.capacity || 0) >= 200 && (venue.capacity || 0) < 500) ||
        (capacityFilter === 'large' && (venue.capacity || 0) >= 500)
      return matchesSearch && matchesCapacity
    })
  }, [venues, searchQuery, capacityFilter])

  // Calculate stats from real data
  const stats = useMemo(() => {
    const avgRating =
      venues.filter((v) => v.rating).length > 0
        ? venues.reduce((sum, v) => sum + Number(v.rating || 0), 0) / venues.filter((v) => v.rating).length
        : 0

    const totalBookings = venues.reduce((sum, v) => sum + (v._count?.events || 0), 0)

    return {
      total: venues.length,
      available: venues.filter((v) => v.availability === 'available').length,
      avgRating: avgRating ? avgRating.toFixed(1) : '-',
      totalBookings,
    }
  }, [venues])

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
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
        <SkeletonQuickStats />
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonVenueCard key={i} />
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
            <h1 className="text-3xl font-display font-bold mb-2">Venues</h1>
            <p className="text-gray-600">Manage your event venues and locations</p>
          </div>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Failed to load venues</p>
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
          <h1 className="text-3xl font-display font-bold mb-2">Venues</h1>
          <p className="text-gray-600">Manage your event venues and locations</p>
        </div>

        <Link href="/dashboard/venues/new" className="btn-primary inline-flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Venue
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
              placeholder="Search venues, locations..."
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
              onChange={(e) => setTypeFilter(e.target.value as VenueType)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Capacity Filter */}
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
            >
              <option value="all">All Capacities</option>
              <option value="small">Small (&lt; 200)</option>
              <option value="medium">Medium (200-500)</option>
              <option value="large">Large (500+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Total Venues" value={stats.total.toString()} />
        <QuickStat label="Available" value={stats.available.toString()} />
        <QuickStat label="Avg Rating" value={stats.avgRating} />
        <QuickStat label="Total Bookings" value={stats.totalBookings.toString()} />
      </div>

      {/* Venues Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} onDelete={handleDeleteVenue} />
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="card text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No venues found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

function VenueCard({
  venue,
  onDelete,
}: {
  venue: Venue
  onDelete: (id: string, name: string) => void
}) {
  const typeColors: Record<string, string> = {
    indoor: 'from-blue-500 to-indigo-500',
    outdoor: 'from-green-500 to-emerald-500',
    mixed: 'from-purple-500 to-pink-500',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    indoor: <Building2 className="w-6 h-6" />,
    outdoor: <MapPin className="w-6 h-6" />,
    mixed: <Building2 className="w-6 h-6" />,
  }

  const availabilityConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    available: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Available' },
    limited: { icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Limited' },
    booked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Booked' },
  }

  const availability = availabilityConfig[venue.availability || 'available']
  const AvailabilityIcon = availability.icon

  const amenityIcons: Record<string, React.ReactNode> = {
    Wifi: <Wifi className="w-4 h-4" />,
    Parking: <ParkingCircle className="w-4 h-4" />,
    Catering: <UtensilsCrossed className="w-4 h-4" />,
    'AV Equipment': <Music className="w-4 h-4" />,
  }

  const bookingsCount = venue._count?.events || 0
  const amenities = venue.amenities || []

  return (
    <div className="card group hover:scale-[1.02] cursor-pointer">
      {/* Header with gradient */}
      <div
        className={`h-32 bg-gradient-to-br ${typeColors[venue.type] || 'from-gray-500 to-gray-600'} rounded-xl -m-6 mb-4 flex items-center justify-center text-white relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          {typeIcons[venue.type]}
          <p className="text-sm font-semibold mt-2 capitalize">{venue.type} Venue</p>
        </div>

        {/* Availability badge */}
        <div
          className={`absolute top-3 right-3 ${availability.bg} ${availability.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}
        >
          <AvailabilityIcon className="w-3 h-3" />
          <span>{availability.label}</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h3>
            {venue.address && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{venue.address}</span>
              </div>
            )}
            {venue.city && <p className="text-sm text-gray-500 mt-1">{venue.city}</p>}
          </div>
        </div>

        {/* Capacity & Rating */}
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="font-semibold text-gray-900">{venue.capacity || '-'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-xs text-gray-500">Rating</p>
              <p className="font-semibold text-gray-900">{venue.rating ? Number(venue.rating).toFixed(1) : '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-semibold text-gray-900">{venue.priceRange || '-'}</p>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">AMENITIES</p>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 6).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full flex items-center space-x-1"
                >
                  {amenityIcons[amenity]}
                  <span>{amenity}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
          {venue.contactEmail && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{venue.contactEmail}</span>
            </div>
          )}
          {venue.contactPhone && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{venue.contactPhone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{bookingsCount}</span> bookings
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/dashboard/venues/${venue.id}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              View Details
            </Link>
            <Link
              href={`/dashboard/events/new?venue=${venue.id}`}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Book
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(venue.id, venue.name)
              }}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
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
