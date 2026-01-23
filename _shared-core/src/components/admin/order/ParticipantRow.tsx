'use client'

/**
 * Participant Row Component
 * Displays a single participant with edit/delete actions
 */

import { useState } from 'react'
import { Pencil, Trash2, Mail, Calendar, Check, Clock, X, User, Users, UserPlus } from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
  email?: string | null
  phone?: string | null
}

interface EventParticipant {
  id: string
  type: 'employee' | 'customer' | 'external'
  name?: string | null
  email: string
  phone?: string | null
  teamMemberId?: string | null
  teamMember?: TeamMember | null
  includePricing: boolean
  inviteStatus: 'pending' | 'sent' | 'accepted' | 'declined'
  calendarInviteSentAt?: string | null
}

interface ParticipantRowProps {
  participant: EventParticipant
  orderId: string
  onUpdate: () => void
}

export function ParticipantRow({ participant, orderId, onUpdate }: ParticipantRowProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [includePricing, setIncludePricing] = useState(participant.includePricing)
  const [saving, setSaving] = useState(false)

  const displayName = participant.name ||
    (participant.teamMember
      ? `${participant.teamMember.firstName} ${participant.teamMember.lastName}`
      : participant.email)

  const typeLabel = {
    employee: 'Zamestnanec',
    customer: 'Zakaznik',
    external: 'Externi',
  }[participant.type]

  const typeIcon = {
    employee: <Users className="h-4 w-4" />,
    customer: <User className="h-4 w-4" />,
    external: <UserPlus className="h-4 w-4" />,
  }[participant.type]

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    sent: <Check className="h-4 w-4 text-green-500" />,
    accepted: <Check className="h-4 w-4 text-green-600" />,
    declined: <X className="h-4 w-4 text-red-500" />,
  }[participant.inviteStatus]

  const statusLabel = {
    pending: 'Ceka',
    sent: 'Odeslano',
    accepted: 'Prijato',
    declined: 'Odmitnuto',
  }[participant.inviteStatus]

  const handleTogglePricing = async () => {
    setSaving(true)
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/participants/${participant.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ includePricing: !includePricing }),
        }
      )

      const data = await response.json()
      if (data.success) {
        setIncludePricing(!includePricing)
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating participant:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Opravdu chcete odstranit ucastnika ${displayName}?`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/participants/${participant.id}`,
        { method: 'DELETE' }
      )

      const data = await response.json()
      if (data.success) {
        onUpdate()
      } else {
        alert(`Chyba: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting participant:', error)
      alert('Chyba pri mazani ucastnika')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left side - Info */}
      <div className="flex items-center gap-3">
        {/* Type icon */}
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
          {typeIcon}
        </div>

        {/* Name and details */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{displayName}</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
              {typeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {participant.email}
            </span>
            {participant.teamMember?.role && (
              <span className="text-gray-400">
                {participant.teamMember.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Status and actions */}
      <div className="flex items-center gap-4">
        {/* Pricing checkbox */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={includePricing}
            onChange={handleTogglePricing}
            disabled={saving}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Cena</span>
        </label>

        {/* Status */}
        <div className="flex items-center gap-1.5 min-w-[80px]">
          {statusIcon}
          <span className="text-sm text-gray-600">{statusLabel}</span>
        </div>

        {/* Calendar indicator */}
        {participant.calendarInviteSentAt && (
          <div className="flex items-center text-green-600" title="Kalendarni udalost vytvorena">
            <Calendar className="h-4 w-4" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Odstranit"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
