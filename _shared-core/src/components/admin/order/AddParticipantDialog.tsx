'use client'

/**
 * Add Participant Dialog Component
 * Modal for adding new participants to an order
 */

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, User, Users, UserPlus } from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
  email?: string | null
  phone?: string | null
}

interface AddParticipantDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  onAdded: () => void
}

export function AddParticipantDialog({
  isOpen,
  onClose,
  orderId,
  onAdded,
}: AddParticipantDialogProps) {
  const [type, setType] = useState<'employee' | 'customer' | 'external'>('employee')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [includePricing, setIncludePricing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load team members when type is employee
  useEffect(() => {
    if (type === 'employee' && isOpen) {
      fetch('/api/admin/team?status=active')
        .then((res) => res.json())
        .then((data) => {
          // Filter only members with email
          const membersWithEmail = (data.teamMembers || []).filter(
            (m: TeamMember) => m.email
          )
          setTeamMembers(membersWithEmail)
        })
        .catch((err) => console.error('Error loading team members:', err))
    }
  }, [type, isOpen])

  // Set default includePricing based on type
  useEffect(() => {
    setIncludePricing(type === 'customer')
  }, [type])

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setType('employee')
      setSelectedTeamMemberId('')
      setFormData({ name: '', email: '', phone: '' })
      setIncludePricing(false)
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const body: any = {
        type,
        includePricing,
      }

      if (type === 'employee') {
        if (!selectedTeamMemberId) {
          setError('Vyberte clena tymu')
          setSubmitting(false)
          return
        }
        body.teamMemberId = selectedTeamMemberId
      } else {
        if (!formData.email) {
          setError('Email je povinny')
          setSubmitting(false)
          return
        }
        body.name = formData.name
        body.email = formData.email
        body.phone = formData.phone
      }

      const response = await fetch(`/api/admin/orders/${orderId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        onAdded()
        onClose()
      } else {
        setError(data.error || 'Chyba pri pridavani ucastnika')
      }
    } catch (err: any) {
      setError(err.message || 'Chyba pri pridavani ucastnika')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Pridat ucastnika
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Type selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ ucastnika
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'employee', label: 'Zamestnanec', icon: Users },
                        { value: 'customer', label: 'Zakaznik', icon: User },
                        { value: 'external', label: 'Externi', icon: UserPlus },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value as any)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                            type === opt.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <opt.icon
                            className={`h-5 w-5 ${
                              type === opt.value ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              type === opt.value ? 'text-blue-700' : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employee - select from team members */}
                  {type === 'employee' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vybrat clena tymu *
                      </label>
                      <select
                        value={selectedTeamMemberId}
                        onChange={(e) => setSelectedTeamMemberId(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Vyberte...</option>
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} ({member.role})
                          </option>
                        ))}
                      </select>
                      {teamMembers.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          Zadni clenove tymu s emailem
                        </p>
                      )}
                    </div>
                  )}

                  {/* Customer/External - form fields */}
                  {type !== 'employee' && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jmeno
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Jan Novak"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="jan@example.com"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="+420 123 456 789"
                        />
                      </div>
                    </>
                  )}

                  {/* Include pricing checkbox */}
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePricing}
                        onChange={(e) => setIncludePricing(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Zobrazit cenu v detailu akce
                      </span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      {type === 'employee'
                        ? 'Zamestnanci obvykle nevidi cenu'
                        : 'Zakaznici obvykle vidi cenu'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Zrusit
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Pridavam...' : 'Pridat'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
