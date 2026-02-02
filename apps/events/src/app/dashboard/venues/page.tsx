'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { SkeletonVenueCard, SkeletonQuickStats, Skeleton } from '@/components/ui/skeleton'

type VenueType = 'all' | 'indoor' | 'outdoor' | 'hybrid'

const MOCK_VENUES = [
  {
    id: '1',
    name: 'Grand Hotel Ballroom',
    type: 'indoor',
    capacity: 500,
    address: '123 Main Street, Downtown',
    city: 'New York',
    zip: '10001',
    phone: '+1 234 567 8900',
    email: 'events@grandhotel.com',
    rating: 4.8,
    priceRange: '$$$',
    amenities: ['Wifi', 'Parking', 'Catering', 'AV Equipment'],
    availability: 'available',
    bookings: 45,
    images: []
  },
  {
    id: '2',
    name: 'Riverside Park',
    type: 'outdoor',
    capacity: 1000,
    address: '456 River Road',
    city: 'New York',
    zip: '10002',
    phone: '+1 234 567 8901',
    email: 'info@riversidepark.com',
    rating: 4.6,
    priceRange: '$$',
    amenities: ['Parking', 'Restrooms', 'Stage'],
    availability: 'available',
    bookings: 28,
    images: []
  },
  {
    id: '3',
    name: 'Convention Center',
    type: 'indoor',
    capacity: 2000,
    address: '789 Exhibition Blvd',
    city: 'New York',
    zip: '10003',
    phone: '+1 234 567 8902',
    email: 'bookings@conventioncenter.com',
    rating: 4.9,
    priceRange: '$$$$',
    amenities: ['Wifi', 'Parking', 'Catering', 'AV Equipment', 'Security'],
    availability: 'limited',
    bookings: 89,
    images: []
  },
  {
    id: '4',
    name: 'Innovation Hub',
    type: 'hybrid',
    capacity: 300,
    address: '321 Tech Street',
    city: 'New York',
    zip: '10004',
    phone: '+1 234 567 8903',
    email: 'events@innovationhub.com',
    rating: 4.7,
    priceRange: '$$',
    amenities: ['Wifi', 'AV Equipment', 'Catering'],
    availability: 'available',
    bookings: 34,
    images: []
  },
  {
    id: '5',
    name: 'Rooftop Garden Lounge',
    type: 'outdoor',
    capacity: 150,
    address: '555 Sky Tower',
    city: 'New York',
    zip: '10005',
    phone: '+1 234 567 8904',
    email: 'events@rooftopgarden.com',
    rating: 5.0,
    priceRange: '$$$$',
    amenities: ['Wifi', 'Catering', 'Bar'],
    availability: 'booked',
    bookings: 67,
    images: []
  },
]

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<VenueType>('all')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredVenues = MOCK_VENUES.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || venue.type === typeFilter
    const matchesCapacity =
      capacityFilter === 'all' ||
      (capacityFilter === 'small' && venue.capacity < 200) ||
      (capacityFilter === 'medium' && venue.capacity >= 200 && venue.capacity < 500) ||
      (capacityFilter === 'large' && venue.capacity >= 500)
    return matchesSearch && matchesType && matchesCapacity
  })

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
              <option value="hybrid">Hybrid</option>
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
        <QuickStat label="Total Venues" value={MOCK_VENUES.length.toString()} />
        <QuickStat label="Available" value={MOCK_VENUES.filter(v => v.availability === 'available').length.toString()} />
        <QuickStat label="Avg Rating" value="4.8" />
        <QuickStat label="Total Bookings" value="263" />
      </div>

      {/* Venues Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
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

function VenueCard({ venue }: { venue: typeof MOCK_VENUES[0] }) {
  const typeColors = {
    indoor: 'from-blue-500 to-indigo-500',
    outdoor: 'from-green-500 to-emerald-500',
    hybrid: 'from-purple-500 to-pink-500',
  }

  const typeIcons = {
    indoor: <Building2 className="w-6 h-6" />,
    outdoor: <MapPin className="w-6 h-6" />,
    hybrid: <Building2 className="w-6 h-6" />,
  }

  const availabilityConfig = {
    available: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Available' },
    limited: { icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Limited' },
    booked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Booked' },
  }

  const availability = availabilityConfig[venue.availability as keyof typeof availabilityConfig]
  const AvailabilityIcon = availability.icon

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Wifi': <Wifi className="w-4 h-4" />,
    'Parking': <ParkingCircle className="w-4 h-4" />,
    'Catering': <UtensilsCrossed className="w-4 h-4" />,
    'AV Equipment': <Music className="w-4 h-4" />,
  }

  return (
    <div className="card group hover:scale-[1.02] cursor-pointer">
      {/* Header with gradient */}
      <div className={`h-32 bg-gradient-to-br ${typeColors[venue.type as keyof typeof typeColors]} rounded-xl -m-6 mb-4 flex items-center justify-center text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          {typeIcons[venue.type as keyof typeof typeIcons]}
          <p className="text-sm font-semibold mt-2 capitalize">{venue.type} Venue</p>
        </div>

        {/* Availability badge */}
        <div className={`absolute top-3 right-3 ${availability.bg} ${availability.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
          <AvailabilityIcon className="w-3 h-3" />
          <span>{availability.label}</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{venue.address}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{venue.city}, {venue.zip}</p>
          </div>
        </div>

        {/* Capacity & Rating */}
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="font-semibold text-gray-900">{venue.capacity}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-xs text-gray-500">Rating</p>
              <p className="font-semibold text-gray-900">{venue.rating}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-semibold text-gray-900">{venue.priceRange}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">AMENITIES</p>
          <div className="flex flex-wrap gap-2">
            {venue.amenities.slice(0, 6).map((amenity, idx) => (
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

        {/* Contact Info */}
        <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{venue.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{venue.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{venue.bookings}</span> bookings
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
