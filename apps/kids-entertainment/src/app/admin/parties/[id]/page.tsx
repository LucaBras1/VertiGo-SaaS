/**
 * Party Detail Page
 * View and manage individual party details with safety checklist
 */

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Baby,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Loader2,
  Save,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Party {
  id: string
  date: string
  endDate?: string
  childName?: string
  childAge?: number
  childGender?: string
  childInterests?: string[]
  theme?: string
  status: string
  guestCount?: number
  ageRange?: { min: number; max: number }
  venue?: {
    name?: string
    address?: string
    city?: string
    type?: string
  }
  allergies?: string[]
  dietaryRestrictions?: string[]
  specialNeeds?: string
  specialRequests?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  emergencyContact?: {
    name?: string
    phone?: string
    relation?: string
  }
  package?: {
    id: string
    title: string
    duration: number
  }
  activity?: {
    id: string
    title: string
  }
}

interface SafetyChecklist {
  id: string
  allergyReview: boolean
  emergencyContacts: boolean
  venueAssessment: boolean
  equipmentCheck: boolean
  staffBriefing: boolean
  headcountVerified: boolean
  allergiesConfirmed: boolean
  incidentReport: boolean
  feedbackCollected: boolean
  completedBy?: string
  completedAt?: string
  notes?: any
}

interface Entertainer {
  id: string
  firstName: string
  lastName: string
  stageName?: string
  role: string
  specializations: string[]
  isActive: boolean
}

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [party, setParty] = useState<Party | null>(null)
  const [checklist, setChecklist] = useState<SafetyChecklist | null>(null)
  const [entertainers, setEntertainers] = useState<Entertainer[]>([])
  const [assignedEntertainerId, setAssignedEntertainerId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [partyRes, checklistRes, entertainersRes] = await Promise.all([
        fetch(`/api/parties/${id}`),
        fetch(`/api/parties/${id}/checklist`),
        fetch('/api/entertainers'),
      ])

      if (partyRes.ok) {
        const partyData = await partyRes.json()
        setParty(partyData)
      }

      if (checklistRes.ok) {
        const checklistData = await checklistRes.json()
        setChecklist(checklistData)
      }

      if (entertainersRes.ok) {
        const entertainersData = await entertainersRes.json()
        setEntertainers(entertainersData.filter((e: Entertainer) => e.isActive))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Nepodařilo se načíst data')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(newStatus: string) {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/parties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setParty((prev) => (prev ? { ...prev, status: newStatus } : null))
        toast.success('Stav aktualizován')
      }
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat stav')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateChecklist(field: keyof SafetyChecklist, value: boolean) {
    if (!checklist) return

    try {
      const response = await fetch(`/api/parties/${id}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        setChecklist((prev) => (prev ? { ...prev, [field]: value } : null))
      }
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat checklist')
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'info' | 'danger'; label: string }> = {
      confirmed: { variant: 'success', label: 'Potvrzeno' },
      inquiry: { variant: 'warning', label: 'Poptávka' },
      completed: { variant: 'info', label: 'Dokončeno' },
      cancelled: { variant: 'danger', label: 'Zrušeno' },
    }
    const { variant, label } = config[status] || { variant: 'info', label: status }
    return <Badge variant={variant} className="text-sm px-3 py-1">{label}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-partypal-pink-500 animate-spin" />
      </div>
    )
  }

  if (!party) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Oslava nenalezena</p>
        <Link href="/admin/parties">
          <Button variant="outline" className="mt-4">
            Zpět na seznam
          </Button>
        </Link>
      </div>
    )
  }

  const hasAllergies = party.allergies && party.allergies.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/parties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zpět
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Baby className="h-6 w-6 text-partypal-pink-500" />
              {party.childName || 'Oslava'}
              {party.childAge && <span className="text-gray-500 font-normal">({party.childAge} let)</span>}
            </h1>
            {party.package?.title && (
              <p className="text-partypal-pink-600">{party.package.title}</p>
            )}
          </div>
        </div>
        {getStatusBadge(party.status)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Venue */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Termín a místo</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-partypal-pink-500" />
                  <span>{formatDate(party.date)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-partypal-pink-500" />
                  <span>
                    {formatTime(party.date)}
                    {party.endDate && ` - ${formatTime(party.endDate)}`}
                  </span>
                </div>
              </div>
              {party.venue && (
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-0.5 text-partypal-pink-500" />
                    <div>
                      <p className="font-medium">{party.venue.name}</p>
                      <p className="text-sm text-gray-500">
                        {party.venue.address}, {party.venue.city}
                      </p>
                      <Badge variant="info" size="sm" className="mt-1">
                        {party.venue.type === 'home' ? 'Doma' : party.venue.type === 'venue' ? 'Pronajatý prostor' : 'Venku'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Guests */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hosté</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Počet hostů</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-partypal-pink-500" />
                  {party.guestCount || 'Neuvedeno'}
                </p>
              </div>
              {party.ageRange && (
                <div>
                  <p className="text-sm text-gray-500">Věkové rozmezí</p>
                  <p className="text-lg font-medium text-gray-900">
                    {party.ageRange.min} - {party.ageRange.max} let
                  </p>
                </div>
              )}
            </div>
            {party.childInterests && party.childInterests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Zájmy dítěte</p>
                <div className="flex flex-wrap gap-2">
                  {party.childInterests.map((interest, i) => (
                    <Badge key={i} variant="default">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Allergies & Dietary */}
          {(hasAllergies || party.dietaryRestrictions?.length || party.specialNeeds) && (
            <Card variant="outlined" className="p-6 border-amber-200 bg-amber-50">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Bezpečnostní informace
              </h3>
              <div className="space-y-4">
                {hasAllergies && (
                  <div>
                    <p className="text-sm font-medium text-amber-700">Alergie:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {party.allergies!.map((allergy, i) => (
                        <Badge key={i} variant="danger">{allergy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {party.dietaryRestrictions && party.dietaryRestrictions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-700">Dietetická omezení:</p>
                    <p className="text-amber-800">{party.dietaryRestrictions.join(', ')}</p>
                  </div>
                )}
                {party.specialNeeds && (
                  <div>
                    <p className="text-sm font-medium text-amber-700">Speciální potřeby:</p>
                    <p className="text-amber-800">{party.specialNeeds}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Contact */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakty</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Rodič / Objednavatel</p>
                <div className="space-y-2">
                  <p className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {party.parentName}
                  </p>
                  {party.parentPhone && (
                    <a href={`tel:${party.parentPhone}`} className="flex items-center text-partypal-pink-600 hover:underline">
                      <Phone className="h-4 w-4 mr-2" />
                      {party.parentPhone}
                    </a>
                  )}
                  {party.parentEmail && (
                    <a href={`mailto:${party.parentEmail}`} className="flex items-center text-partypal-pink-600 hover:underline">
                      <Mail className="h-4 w-4 mr-2" />
                      {party.parentEmail}
                    </a>
                  )}
                </div>
              </div>
              {party.emergencyContact && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Nouzový kontakt</p>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {party.emergencyContact.name}
                      {party.emergencyContact.relation && (
                        <span className="text-gray-500 font-normal"> ({party.emergencyContact.relation})</span>
                      )}
                    </p>
                    {party.emergencyContact.phone && (
                      <a href={`tel:${party.emergencyContact.phone}`} className="flex items-center text-partypal-pink-600 hover:underline">
                        <Phone className="h-4 w-4 mr-2" />
                        {party.emergencyContact.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Special Requests */}
          {party.specialRequests && (
            <Card variant="outlined" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Speciální požadavky</h3>
              <p className="text-gray-700">{party.specialRequests}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Akce</h3>
            <div className="space-y-3">
              {party.status === 'inquiry' && (
                <Button
                  className="w-full"
                  onClick={() => updateStatus('confirmed')}
                  disabled={isSaving}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Potvrdit rezervaci
                </Button>
              )}
              {party.status === 'confirmed' && (
                <Button
                  className="w-full"
                  onClick={() => updateStatus('completed')}
                  disabled={isSaving}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Označit jako dokončené
                </Button>
              )}
              {party.status !== 'cancelled' && party.status !== 'completed' && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={() => updateStatus('cancelled')}
                  disabled={isSaving}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Zrušit
                </Button>
              )}
            </div>
          </Card>

          {/* Assign Entertainer */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Přiřadit animátora</h3>
            <select
              value={assignedEntertainerId}
              onChange={(e) => setAssignedEntertainerId(e.target.value)}
              className="w-full rounded-lg border-gray-300 mb-3"
            >
              <option value="">Vyberte animátora</option>
              {entertainers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.stageName || `${e.firstName} ${e.lastName}`} ({e.role})
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="w-full" disabled={!assignedEntertainerId}>
              <Save className="h-4 w-4 mr-2" />
              Přiřadit
            </Button>
          </Card>

          {/* Safety Checklist */}
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-partypal-pink-500" />
              Bezpečnostní checklist
            </h3>
            {checklist ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-medium">Před oslavou</p>
                {[
                  { key: 'allergyReview', label: 'Kontrola alergií' },
                  { key: 'emergencyContacts', label: 'Nouzové kontakty' },
                  { key: 'venueAssessment', label: 'Posouzení prostoru' },
                  { key: 'equipmentCheck', label: 'Kontrola vybavení' },
                  { key: 'staffBriefing', label: 'Poučení personálu' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist[key as keyof SafetyChecklist] as boolean}
                      onChange={(e) => updateChecklist(key as keyof SafetyChecklist, e.target.checked)}
                      className="h-4 w-4 text-partypal-pink-500 focus:ring-partypal-pink-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{label}</span>
                  </label>
                ))}

                <p className="text-xs text-gray-500 uppercase font-medium mt-4">Během oslavy</p>
                {[
                  { key: 'headcountVerified', label: 'Počet dětí ověřen' },
                  { key: 'allergiesConfirmed', label: 'Alergie potvrzeny' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist[key as keyof SafetyChecklist] as boolean}
                      onChange={(e) => updateChecklist(key as keyof SafetyChecklist, e.target.checked)}
                      className="h-4 w-4 text-partypal-pink-500 focus:ring-partypal-pink-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{label}</span>
                  </label>
                ))}

                <p className="text-xs text-gray-500 uppercase font-medium mt-4">Po oslavě</p>
                {[
                  { key: 'incidentReport', label: 'Incident report' },
                  { key: 'feedbackCollected', label: 'Zpětná vazba' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist[key as keyof SafetyChecklist] as boolean}
                      onChange={(e) => updateChecklist(key as keyof SafetyChecklist, e.target.checked)}
                      className="h-4 w-4 text-partypal-pink-500 focus:ring-partypal-pink-500 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Checklist není k dispozici</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
