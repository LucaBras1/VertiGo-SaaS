'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react'

const MOCK_PERFORMERS = [
  {
    id: '1',
    name: 'Fire Phoenix',
    stageName: 'The Inferno Master',
    type: 'fire',
    rating: 4.9,
    bookings: 45,
    rate: 800,
    phone: '+1 234 567 8900',
    email: 'fire@phoenix.com',
    specialties: ['Fire Dancing', 'Fire Breathing', 'LED Performance']
  },
  {
    id: '2',
    name: 'Alex Wonder',
    stageName: 'Alex the Magnificent',
    type: 'magic',
    rating: 4.8,
    bookings: 62,
    rate: 600,
    phone: '+1 234 567 8901',
    email: 'alex@wonder.com',
    specialties: ['Close-up Magic', 'Stage Illusions', 'Mentalism']
  },
  {
    id: '3',
    name: 'Aerial Silk Duo',
    type: 'circus',
    rating: 5.0,
    bookings: 38,
    rate: 1200,
    phone: '+1 234 567 8902',
    email: 'contact@aerialsilk.com',
    specialties: ['Aerial Silks', 'Acrobatics', 'Contortion']
  },
  {
    id: '4',
    name: 'DJ Rhythm',
    type: 'music',
    rating: 4.7,
    bookings: 89,
    rate: 400,
    phone: '+1 234 567 8903',
    email: 'dj@rhythm.com',
    specialties: ['Electronic', 'House', 'Corporate Events']
  },
]

export default function PerformersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredPerformers = MOCK_PERFORMERS.filter(performer => {
    const matchesSearch =
      performer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      performer.stageName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || performer.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Performers</h1>
          <p className="text-gray-600">Manage your talent roster</p>
        </div>

        <Link href="/dashboard/performers/new" className="btn-primary inline-flex items-center">
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
              onChange={(e) => setTypeFilter(e.target.value)}
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
        <QuickStat label="Total Performers" value={MOCK_PERFORMERS.length.toString()} />
        <QuickStat label="Active Bookings" value="12" />
        <QuickStat label="Avg Rating" value="4.9" />
        <QuickStat label="This Month" value="24" />
      </div>

      {/* Performers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPerformers.map((performer) => (
          <PerformerCard key={performer.id} performer={performer} />
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

function PerformerCard({ performer }: { performer: typeof MOCK_PERFORMERS[0] }) {
  const typeColors = {
    fire: 'from-orange-500 to-red-500',
    magic: 'from-purple-500 to-pink-500',
    circus: 'from-blue-500 to-cyan-500',
    music: 'from-green-500 to-emerald-500',
    dance: 'from-pink-500 to-rose-500',
    comedy: 'from-yellow-500 to-amber-500',
    interactive: 'from-indigo-500 to-purple-500',
  }

  const typeIcons = {
    fire: '🔥',
    magic: '✨',
    circus: '🎪',
    music: '🎵',
    dance: '💃',
    comedy: '😄',
    interactive: '🎮',
  }

  return (
    <div className="card group hover:scale-105 cursor-pointer">
      {/* Header with gradient */}
      <div className={`h-24 bg-gradient-to-br ${typeColors[performer.type as keyof typeof typeColors]} rounded-t-xl -m-6 mb-4 flex items-center justify-center text-5xl`}>
        {typeIcons[performer.type as keyof typeof typeIcons]}
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
            <span className="font-semibold text-gray-900">{performer.rating}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{performer.bookings}</span> bookings
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
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{performer.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{performer.phone}</span>
          </div>
        </div>

        {/* Rate & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900">${performer.rate}</span>
            <span className="text-sm text-gray-500">/event</span>
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/dashboard/performers/${performer.id}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              View
            </Link>
            <Link
              href={`/dashboard/bookings/new?performer=${performer.id}`}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
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
