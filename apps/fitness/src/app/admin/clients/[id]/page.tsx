'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  Target,
  TrendingUp,
  CreditCard,
  Edit,
  MoreHorizontal,
  Trash2,
  Plus,
  Scale,
  Ruler,
  Clock,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { ClientFormModal } from '@/components/clients/ClientFormModal'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  goals: string[]
  currentWeight: number | null
  targetWeight: number | null
  height: number | null
  fitnessLevel: string | null
  injuryHistory: string | null
  dietaryNotes: string | null
  medicalNotes: string | null
  membershipType: string | null
  creditsRemaining: number
  membershipExpiry: string | null
  status: string
  notes: string | null
  createdAt: string
  sessions: Array<{
    id: string
    scheduledAt: string
    duration: number
    status: string
    muscleGroups: string[]
  }>
  measurements: Array<{
    id: string
    date: string
    weight: number | null
    bodyFat: number | null
  }>
  _count: {
    sessions: number
    orders: number
    invoices: number
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivní', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Neaktivní', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200' },
  paused: { label: 'Pozastaven', color: 'bg-yellow-100 text-yellow-800' },
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Hubnutí',
  muscle_gain: 'Nárůst svalů',
  strength: 'Síla',
  endurance: 'Vytrvalost',
  flexibility: 'Flexibilita',
}

const fitnessLevelLabels: Record<string, string> = {
  beginner: 'Začátečník',
  intermediate: 'Pokročilý',
  advanced: 'Expert',
}

const sessionStatusLabels: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Naplánováno', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Zrušeno', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200' },
  no_show: { label: 'Nepřišel', color: 'bg-red-100 text-red-800' },
}

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      } else if (response.status === 404) {
        toast.error('Klient nenalezen')
        router.push('/admin/clients')
      } else {
        toast.error('Chyba při načítání klienta')
      }
    } catch {
      toast.error('Chyba při načítání klienta')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClient()
  }, [resolvedParams.id])

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tohoto klienta?')) return

    try {
      const response = await fetch(`/api/clients/${resolvedParams.id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Klient byl smazán')
        router.push('/admin/clients')
      } else {
        toast.error('Chyba při mazání klienta')
      }
    } catch {
      toast.error('Chyba při mazání klienta')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!client) return null

  return (
    <>
      {/* Page header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/clients"
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:text-neutral-400"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700">
                    {client.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h1>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusLabels[client.status]?.color || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      )}
                    >
                      {statusLabels[client.status]?.label || client.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </span>
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:bg-neutral-950"
              >
                <Edit className="h-4 w-4" />
                Upravit
              </button>
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:bg-neutral-950">
                  <MoreHorizontal className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleDelete}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 text-sm w-full',
                              active ? 'bg-red-50 text-red-700' : 'text-red-600'
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                            Smazat klienta
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client._count.sessions}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Sessions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.creditsRemaining}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Kredity</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Scale className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {client.currentWeight ? `${client.currentWeight} kg` : '-'}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Váha</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {client.targetWeight ? `${client.targetWeight} kg` : '-'}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Cílová váha</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Poslední sessions</h2>
                <Link
                  href={`/admin/sessions?client=${client.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Zobrazit vše
                </Link>
              </div>
              {client.sessions.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                  <p>Žádné sessions</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {client.sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatDate(session.scheduledAt)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <Clock className="h-4 w-4" />
                            {session.duration} min
                            {session.muscleGroups.length > 0 && (
                              <>
                                <span>•</span>
                                {session.muscleGroups.slice(0, 2).join(', ')}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          sessionStatusLabels[session.status]?.color || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        )}
                      >
                        {sessionStatusLabels[session.status]?.label || session.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Measurements */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Měření</h2>
                <button className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                  <Plus className="h-4 w-4" />
                  Přidat měření
                </button>
              </div>
              {client.measurements.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                  <p>Žádná měření</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {client.measurements.slice(0, 5).map((measurement) => (
                    <div key={measurement.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{formatDate(measurement.date)}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {measurement.weight && (
                          <span className="text-neutral-600 dark:text-neutral-400">
                            <span className="font-medium">{measurement.weight}</span> kg
                          </span>
                        )}
                        {measurement.bodyFat && (
                          <span className="text-neutral-600 dark:text-neutral-400">
                            <span className="font-medium">{measurement.bodyFat}</span>% BF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                Cíle
              </h3>
              {client.goals.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400">Žádné cíle</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {client.goals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                    >
                      {goalLabels[goal] || goal}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Informace
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Úroveň kondice</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {client.fitnessLevel
                      ? fitnessLevelLabels[client.fitnessLevel] || client.fitnessLevel
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Výška</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {client.height ? `${client.height} cm` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Typ členství</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {client.membershipType || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Členem od</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(client.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                  Poznámky
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            {/* Medical Notes */}
            {(client.injuryHistory || client.medicalNotes) && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="text-sm font-medium text-yellow-800 uppercase tracking-wider mb-3">
                  Zdravotní poznámky
                </h3>
                {client.injuryHistory && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Historie zranění</p>
                    <p className="text-sm text-yellow-800">{client.injuryHistory}</p>
                  </div>
                )}
                {client.medicalNotes && (
                  <div>
                    <p className="text-xs font-medium text-yellow-700 mb-1">Zdravotní omezení</p>
                    <p className="text-sm text-yellow-800">{client.medicalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={() => {
          setIsEditModalOpen(false)
          fetchClient()
        }}
        client={client}
      />
    </>
  )
}
