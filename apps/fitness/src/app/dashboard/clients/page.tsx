'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ClientFormModal } from '@/components/clients/ClientFormModal'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  fitnessLevel: string | null
  creditsRemaining: number
  goals: string[]
  currentWeight: number | null
  targetWeight: number | null
  _count: {
    sessions: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivní', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Neaktivní', color: 'bg-gray-100 text-gray-800' },
  paused: { label: 'Pozastaven', color: 'bg-yellow-100 text-yellow-800' },
}

const fitnessLevelLabels: Record<string, string> = {
  beginner: 'Začátečník',
  intermediate: 'Pokročilý',
  advanced: 'Expert',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fitnessLevelFilter, setFitnessLevelFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(fitnessLevelFilter && { fitnessLevel: fitnessLevelFilter }),
      })

      const response = await fetch(`/api/clients?${params}`)
      const data = await response.json()

      if (response.ok) {
        setClients(data.clients)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Chyba při načítání klientů')
      }
    } catch {
      toast.error('Chyba při načítání klientů')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, fitnessLevelFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchClients()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchClients])

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tohoto klienta?')) return

    try {
      const response = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Klient byl smazán')
        fetchClients()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Chyba při mazání klienta')
      }
    } catch {
      toast.error('Chyba při mazání klienta')
    }
  }

  const handleClientSaved = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    fetchClients()
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Klienti</h1>
                <p className="text-gray-600">Správa klientů a jejich profilů</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingClient(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nový klient
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Hledat podle jména, emailu nebo telefonu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
              <option value="paused">Pozastavení</option>
            </select>
            <select
              value={fitnessLevelFilter}
              onChange={(e) => {
                setFitnessLevelFilter(e.target.value)
                setPagination((p) => ({ ...p, page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Všechny úrovně</option>
              <option value="beginner">Začátečník</option>
              <option value="intermediate">Pokročilý</option>
              <option value="advanced">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádní klienti</h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter || fitnessLevelFilter
                ? 'Nenalezeni žádní klienti odpovídající filtrům'
                : 'Začněte přidáním prvního klienta'}
            </p>
            {!search && !statusFilter && !fitnessLevelFilter && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-5 w-5" />
                Přidat klienta
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Klient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontakt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Úroveň
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kredity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Akce</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {client.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <Link
                                href={`/dashboard/clients/${client.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-primary-600"
                              >
                                {client.name}
                              </Link>
                              {client.goals && client.goals.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {client.goals.slice(0, 2).map((goal) => (
                                    <span
                                      key={goal}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                    >
                                      {goal.replace('_', ' ')}
                                    </span>
                                  ))}
                                  {client.goals.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{client.goals.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {client.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {client.fitnessLevel ? (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-900">
                              <Dumbbell className="h-4 w-4 text-gray-400" />
                              {fitnessLevelLabels[client.fitnessLevel] || client.fitnessLevel}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              client.creditsRemaining > 5
                                ? 'text-green-600'
                                : client.creditsRemaining > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            )}
                          >
                            {client.creditsRemaining}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client._count.sessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              statusLabels[client.status]?.color || 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {statusLabels[client.status]?.label || client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-1 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal className="h-5 w-5 text-gray-400" />
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
                              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Link
                                        href={`/dashboard/clients/${client.id}`}
                                        className={cn(
                                          'flex items-center gap-2 px-4 py-2 text-sm',
                                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                        )}
                                      >
                                        <Eye className="h-4 w-4" />
                                        Zobrazit profil
                                      </Link>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setEditingClient(client)
                                          setIsModalOpen(true)
                                        }}
                                        className={cn(
                                          'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                          active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                        )}
                                      >
                                        <Edit className="h-4 w-4" />
                                        Upravit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleDeleteClient(client.id)}
                                        className={cn(
                                          'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                          active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                        )}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Smazat
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Zobrazeno{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  až{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  z <span className="font-medium">{pagination.total}</span> klientů
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Client Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onSaved={handleClientSaved}
        client={editingClient}
      />
    </>
  )
}
