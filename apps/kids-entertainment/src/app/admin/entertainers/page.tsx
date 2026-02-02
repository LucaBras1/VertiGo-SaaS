/**
 * Admin Entertainers Page
 * Manage team of entertainers with compliance tracking
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Sparkles,
  Mail,
  Phone,
  AlertTriangle,
  Plus,
  Edit,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Heart,
  Calendar,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Entertainer {
  id: string
  firstName: string
  lastName: string
  stageName?: string
  role: string
  email?: string
  phone?: string
  photoUrl?: string
  specializations: string[]
  ageGroups: string[]
  languages: string[]
  backgroundCheckDate?: string
  backgroundCheckStatus?: string
  firstAidCertified: boolean
  firstAidExpiryDate?: string
  insuranceNumber?: string
  insuranceExpiryDate?: string
  isActive: boolean
  createdAt: string
}

const roleLabels: Record<string, string> = {
  animator: 'Animátor',
  magician: 'Kouzelník',
  musician: 'Hudebník',
  face_painter: 'Face Painter',
  clown: 'Klaun',
  mascot: 'Maskot',
}

const ageGroupLabels: Record<string, string> = {
  TODDLER_3_5: '3-5 let',
  KIDS_6_9: '6-9 let',
  TWEENS_10_12: '10-12 let',
  TEENS_13_PLUS: '13+ let',
}

export default function AdminEntertainersPage() {
  const [entertainers, setEntertainers] = useState<Entertainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchEntertainers()
  }, [])

  async function fetchEntertainers() {
    try {
      const response = await fetch('/api/entertainers')
      const data = await response.json()
      setEntertainers(data)
    } catch (error) {
      console.error('Error fetching entertainers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const response = await fetch(`/api/entertainers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setEntertainers((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isActive: !isActive } : e))
        )
        toast.success(isActive ? 'Animátor deaktivován' : 'Animátor aktivován')
      }
    } catch (error) {
      toast.error('Nepodařilo se změnit stav')
    }
  }

  const filteredEntertainers = entertainers.filter((entertainer) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      entertainer.firstName.toLowerCase().includes(query) ||
      entertainer.lastName.toLowerCase().includes(query) ||
      entertainer.stageName?.toLowerCase().includes(query) ||
      entertainer.role.toLowerCase().includes(query) ||
      entertainer.specializations.some((s) => s.toLowerCase().includes(query))
    )
  })

  const isExpiring = (dateStr?: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return date <= thirtyDaysFromNow
  }

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return true
    return new Date(dateStr) < new Date()
  }

  // Stats
  const activeCount = entertainers.filter((e) => e.isActive).length
  const complianceIssues = entertainers.filter(
    (e) =>
      e.isActive &&
      (!e.backgroundCheckStatus ||
        e.backgroundCheckStatus !== 'approved' ||
        !e.firstAidCertified ||
        isExpired(e.firstAidExpiryDate))
  ).length

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
          <h1 className="text-3xl font-bold text-gray-900">Animátoři</h1>
          <p className="text-gray-600 mt-1">Správa týmu animátorů a jejich certifikací</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Přidat animátora
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-partypal-pink-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Celkem</p>
              <p className="text-2xl font-bold text-gray-900">{entertainers.length}</p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-green-700">Aktivní</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <p className="text-sm text-amber-700">Compliance problémy</p>
              <p className="text-2xl font-bold text-amber-600">{complianceIssues}</p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Neaktivní</p>
              <p className="text-2xl font-bold text-gray-600">
                {entertainers.length - activeCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Hledat podle jména, role, specializace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Entertainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntertainers.map((entertainer) => {
          const hasComplianceIssue =
            !entertainer.backgroundCheckStatus ||
            entertainer.backgroundCheckStatus !== 'approved' ||
            !entertainer.firstAidCertified ||
            isExpired(entertainer.firstAidExpiryDate)

          return (
            <Card
              key={entertainer.id}
              variant="outlined"
              className={!entertainer.isActive ? 'opacity-60' : ''}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-partypal-pink-400 to-partypal-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                      {entertainer.firstName[0]}
                      {entertainer.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {entertainer.firstName} {entertainer.lastName}
                      </h3>
                      {entertainer.stageName && (
                        <p className="text-sm text-partypal-pink-600">
                          "{entertainer.stageName}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {entertainer.isActive ? (
                      <Badge variant="success" size="sm">Aktivní</Badge>
                    ) : (
                      <Badge variant="default" size="sm">Neaktivní</Badge>
                    )}
                    {hasComplianceIssue && entertainer.isActive && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Compliance
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {roleLabels[entertainer.role] || entertainer.role}
                  </div>
                  {entertainer.email && (
                    <a
                      href={`mailto:${entertainer.email}`}
                      className="flex items-center text-gray-600 hover:text-partypal-pink-600"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {entertainer.email}
                    </a>
                  )}
                  {entertainer.phone && (
                    <a
                      href={`tel:${entertainer.phone}`}
                      className="flex items-center text-gray-600 hover:text-partypal-pink-600"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {entertainer.phone}
                    </a>
                  )}
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Specializace:</p>
                  <div className="flex flex-wrap gap-1">
                    {entertainer.specializations.slice(0, 4).map((spec: string) => (
                      <Badge key={spec} variant="pink" size="sm">
                        {spec}
                      </Badge>
                    ))}
                    {entertainer.specializations.length > 4 && (
                      <Badge variant="default" size="sm">
                        +{entertainer.specializations.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Age Groups */}
                {entertainer.ageGroups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Věkové skupiny:</p>
                    <div className="flex flex-wrap gap-1">
                      {entertainer.ageGroups.map((age: string) => (
                        <Badge key={age} variant="info" size="sm">
                          {ageGroupLabels[age] || age}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Status */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center text-gray-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Background check
                    </span>
                    {entertainer.backgroundCheckStatus === 'approved' ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Schváleno
                      </span>
                    ) : entertainer.backgroundCheckStatus === 'pending' ? (
                      <span className="text-amber-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Čeká
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="w-3 h-3 mr-1" />
                        Chybí
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center text-gray-600">
                      <Heart className="w-3 h-3 mr-1" />
                      První pomoc
                    </span>
                    {entertainer.firstAidCertified ? (
                      entertainer.firstAidExpiryDate ? (
                        isExpired(entertainer.firstAidExpiryDate) ? (
                          <span className="text-red-600 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            Vypršelo
                          </span>
                        ) : isExpiring(entertainer.firstAidExpiryDate) ? (
                          <span className="text-amber-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Vyprší brzy
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Platné
                          </span>
                        )
                      ) : (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ano
                        </span>
                      )
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="w-3 h-3 mr-1" />
                        Ne
                      </span>
                    )}
                  </div>

                  {entertainer.insuranceNumber && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-gray-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Pojištění
                      </span>
                      {entertainer.insuranceExpiryDate ? (
                        isExpired(entertainer.insuranceExpiryDate) ? (
                          <span className="text-red-600">Vypršelo</span>
                        ) : (
                          <span className="text-green-600">Platné</span>
                        )
                      ) : (
                        <span className="text-green-600">Ano</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t mt-4 pt-4 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(entertainer.id, entertainer.isActive)}
                  >
                    {entertainer.isActive ? 'Deaktivovat' : 'Aktivovat'}
                  </Button>
                  <Link href={`/admin/entertainers/${entertainer.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Upravit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredEntertainers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Žádní animátoři</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Zkuste upravit vyhledávací dotaz'
                : 'Přidejte prvního animátora do týmu'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat animátora
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
