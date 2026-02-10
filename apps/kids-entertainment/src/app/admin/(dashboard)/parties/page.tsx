/**
 * Admin Parties Page
 * List and manage all party bookings
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Phone,
  Mail,
  Baby,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface Party {
  id: string
  date: string
  endDate?: string
  childName?: string
  childAge?: number
  theme?: string
  status: string
  guestCount?: number
  venue?: {
    name?: string
    address?: string
    city?: string
    type?: string
  }
  allergies?: string[]
  specialRequests?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  package?: {
    title: string
  }
}

export default function AdminPartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    fetchParties()
  }, [statusFilter, dateFilter])

  async function fetchParties() {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter)

      const response = await fetch(`/api/parties?${params}`)
      const data = await response.json()
      setParties(data)
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredParties = parties.filter((party) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      party.childName?.toLowerCase().includes(query) ||
      party.parentName?.toLowerCase().includes(query) ||
      party.theme?.toLowerCase().includes(query) ||
      party.venue?.city?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'info' | 'danger' | 'default'; label: string }> = {
      confirmed: { variant: 'success', label: 'Potvrzeno' },
      inquiry: { variant: 'warning', label: 'Poptávka' },
      completed: { variant: 'info', label: 'Dokončeno' },
      cancelled: { variant: 'danger', label: 'Zrušeno' },
    }
    const { variant, label } = config[status] || { variant: 'default', label: status }
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('cs-CZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Oslavy</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa party akcí a rezervací</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            placeholder="Hledat podle jména, tématu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={dateFilter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('upcoming')}
          >
            <Clock className="h-4 w-4 mr-1" />
            Nadcházející
          </Button>
          <Button
            variant={dateFilter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('past')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Minulé
          </Button>
          <Button
            variant={dateFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('all')}
          >
            Všechny
          </Button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-neutral-300 dark:border-neutral-600 text-sm focus:ring-partypal-pink-500 focus:border-partypal-pink-500"
        >
          <option value="">Všechny stavy</option>
          <option value="inquiry">Poptávka</option>
          <option value="confirmed">Potvrzeno</option>
          <option value="completed">Dokončeno</option>
          <option value="cancelled">Zrušeno</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="outlined" className="p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{parties.length}</p>
        </Card>
        <Card variant="outlined" className="p-4 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">Poptávky</p>
          <p className="text-2xl font-bold text-amber-600">
            {parties.filter((p) => p.status === 'inquiry').length}
          </p>
        </Card>
        <Card variant="outlined" className="p-4 border-green-200 bg-green-50">
          <p className="text-sm text-green-700">Potvrzeno</p>
          <p className="text-2xl font-bold text-green-600">
            {parties.filter((p) => p.status === 'confirmed').length}
          </p>
        </Card>
        <Card variant="outlined" className="p-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-700">Nadcházející</p>
          <p className="text-2xl font-bold text-blue-600">
            {parties.filter((p) => isUpcoming(p.date)).length}
          </p>
        </Card>
      </div>

      {/* Parties List */}
      <div className="space-y-4">
        {filteredParties.map((party) => {
          const { date, time } = formatDate(party.date)
          const hasAllergies = party.allergies && party.allergies.length > 0

          return (
            <Card key={party.id} variant="outlined" className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Date Badge */}
                    <div className="text-center bg-partypal-pink-100 rounded-lg px-4 py-2 min-w-[80px]">
                      <p className="text-xs text-partypal-pink-600 uppercase font-medium">
                        {date.split(' ')[0]}
                      </p>
                      <p className="text-2xl font-bold text-partypal-pink-700">
                        {date.split(' ')[1]}
                      </p>
                      <p className="text-xs text-partypal-pink-600">
                        {date.split(' ')[2]}
                      </p>
                      <p className="text-sm font-medium text-partypal-pink-700 mt-1">
                        {time}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <Baby className="h-5 w-5 text-partypal-pink-500" />
                        {party.childName || 'Neznámé dítě'}
                        {party.childAge && (
                          <span className="text-neutral-500 dark:text-neutral-400 font-normal text-base">
                            ({party.childAge} let)
                          </span>
                        )}
                      </h3>
                      {party.package?.title && (
                        <p className="text-sm text-partypal-pink-600 mt-1">
                          {party.package.title}
                        </p>
                      )}
                      {party.theme && !party.package && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          Téma: {party.theme}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasAllergies && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Alergie
                      </Badge>
                    )}
                    {getStatusBadge(party.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  {party.guestCount && (
                    <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                      <Users className="w-4 h-4 mr-2 text-neutral-400 dark:text-neutral-500" />
                      {party.guestCount} hostů
                    </div>
                  )}
                  {party.venue && (
                    <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-400 dark:text-neutral-500" />
                      {party.venue.name || party.venue.type}
                      {party.venue.city && `, ${party.venue.city}`}
                    </div>
                  )}
                  {party.parentName && (
                    <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                      <span className="mr-2">Rodič:</span>
                      {party.parentName}
                    </div>
                  )}
                </div>

                {/* Contact Row */}
                <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400 border-t pt-4">
                  {party.parentPhone && (
                    <a
                      href={`tel:${party.parentPhone}`}
                      className="flex items-center hover:text-partypal-pink-600"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {party.parentPhone}
                    </a>
                  )}
                  {party.parentEmail && (
                    <a
                      href={`mailto:${party.parentEmail}`}
                      className="flex items-center hover:text-partypal-pink-600"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {party.parentEmail}
                    </a>
                  )}
                  <div className="flex-1" />
                  <Link href={`/admin/parties/${party.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </Link>
                </div>

                {/* Allergies Warning */}
                {hasAllergies && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Alergie:</strong> {party.allergies?.join(', ')}
                    </span>
                  </div>
                )}

                {party.specialRequests && (
                  <div className="mt-4 p-3 bg-sky-50 rounded-lg text-sm text-neutral-700 dark:text-neutral-300">
                    <strong>Speciální požadavky:</strong> {party.specialRequests}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredParties.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-lg font-medium">Žádné oslavy</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Zkuste upravit vyhledávací dotaz'
                : 'Rezervace se zde zobrazí po jejich vytvoření'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
