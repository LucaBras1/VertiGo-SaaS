'use client'

/**
 * Participants Panel Component
 * Displays and manages event participants for an order
 */

import { useState, useEffect } from 'react'
import { Users, Plus, Send, Mail, Calendar, Check, Clock, X } from 'lucide-react'
import { AddParticipantDialog } from './AddParticipantDialog'
import { ParticipantRow } from './ParticipantRow'

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

interface ParticipantsPanelProps {
  orderId: string
  orderStatus: string
}

export function ParticipantsPanel({ orderId, orderStatus }: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/participants`)
      const data = await response.json()
      if (data.success) {
        setParticipants(data.participants)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipants()
  }, [orderId])

  const handleSendInvites = async () => {
    if (sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/send-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendCalendar: true, sendEmail: true }),
      })

      const data = await response.json()

      if (data.success) {
        fetchParticipants()
        const msg = []
        if (data.results.calendarEvents.length > 0) {
          msg.push(`${data.results.calendarEvents.length} kalendarni udalosti`)
        }
        if (data.results.emailsSent > 0) {
          msg.push(`${data.results.emailsSent} emailu`)
        }
        if (data.results.errors.length > 0) {
          console.warn('Send invite errors:', data.results.errors)
        }
        alert(`Pozvanky odeslany: ${msg.join(', ')}`)
      } else {
        alert(`Chyba: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending invites:', error)
      alert('Chyba pri odesilani pozvanek')
    } finally {
      setSending(false)
    }
  }

  const canSendInvites = ['confirmed', 'approved'].includes(orderStatus)
  const pendingParticipants = participants.filter((p) => p.inviteStatus === 'pending')
  const sentParticipants = participants.filter((p) => p.inviteStatus === 'sent')

  const statusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />
      case 'declined':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Ucastnici akce</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {participants.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Pridat
            </button>
            {canSendInvites && pendingParticipants.length > 0 && (
              <button
                onClick={handleSendInvites}
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Odesilam...' : `Odeslat pozvanky (${pendingParticipants.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Status summary */}
        {participants.length > 0 && (
          <div className="mt-3 flex gap-4 text-sm">
            {pendingParticipants.length > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Clock className="h-4 w-4" />
                <span>{pendingParticipants.length} ceka</span>
              </div>
            )}
            {sentParticipants.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span>{sentParticipants.length} odeslano</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2">Nacitam...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">Zadni ucastnici</p>
            <p className="text-sm mt-1">Pridejte zamestnance, zakaznika nebo externi osoby</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                orderId={orderId}
                onUpdate={fetchParticipants}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info banner */}
      {!canSendInvites && participants.length > 0 && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-700">
            <Calendar className="h-4 w-4 inline mr-1" />
            Pozvanky lze odeslat az po potvrzeni objednavky (status: confirmed nebo approved)
          </p>
        </div>
      )}

      {/* Add Participant Dialog */}
      <AddParticipantDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        orderId={orderId}
        onAdded={fetchParticipants}
      />
    </div>
  )
}
