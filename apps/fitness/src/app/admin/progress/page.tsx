'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Search, User, Scale, Ruler, Target, Calendar, Plus } from 'lucide-react'
import { MeasurementFormModal } from '@/components/progress/MeasurementFormModal'
import { format, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Client {
  id: string
  name: string
  email: string
  weight: number | null
  height: number | null
  bodyFat: number | null
  fitnessLevel: string
  goals: string[]
  measurements: Array<{
    id: string
    date: string
    weight: number | null
    bodyFat: number | null
    chest: number | null
    waist: number | null
    hips: number | null
    arms: number | null
    thighs: number | null
  }>
}

export default function ProgressPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clients?includeMeasurements=true')
      const data = await response.json()
      if (response.ok) {
        setClients(data.clients || [])
      }
    } catch {
      toast.error('Chyba při načítání klientů')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter((client) =>
    search === '' ||
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  )

  const getMeasurementChartData = () => {
    if (!selectedClient?.measurements?.length) return []

    return selectedClient.measurements
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => ({
        date: format(parseISO(m.date), 'd.M.', { locale: cs }),
        weight: m.weight,
        bodyFat: m.bodyFat,
        waist: m.waist,
      }))
  }

  const fitnessLevelLabels: Record<string, string> = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Expert',
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Progress klientů</h1>
              <p className="text-neutral-600 dark:text-neutral-400">Sledování pokroku a měření</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Client list */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="search"
                    placeholder="Hledat klienta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                    Žádní klienti
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800 transition-colors',
                        selectedClient?.id === client.id && 'bg-primary-50'
                      )}
                    >
                      <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{client.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{client.email}</p>
                      </div>
                      {client.measurements?.length > 0 && (
                        <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {client.measurements.length} měření
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Client detail */}
          <div className="flex-1">
            {selectedClient ? (
              <div className="space-y-6">
                {/* Client stats */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedClient.name}</h2>
                        <p className="text-neutral-500 dark:text-neutral-400">{selectedClient.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMeasurementModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Přidat měření
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                        <Scale className="h-4 w-4" />
                        <span className="text-sm">Váha</span>
                      </div>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {selectedClient.weight ? `${selectedClient.weight} kg` : '-'}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                        <Ruler className="h-4 w-4" />
                        <span className="text-sm">Výška</span>
                      </div>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {selectedClient.height ? `${selectedClient.height} cm` : '-'}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">Tuk</span>
                      </div>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {selectedClient.bodyFat ? `${selectedClient.bodyFat}%` : '-'}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Úroveň</span>
                      </div>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {fitnessLevelLabels[selectedClient.fitnessLevel] || selectedClient.fitnessLevel}
                      </p>
                    </div>
                  </div>

                  {selectedClient.goals?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Cíle:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.goals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress chart */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Vývoj měření</h3>

                  {selectedClient.measurements?.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getMeasurementChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            name="Váha (kg)"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: '#10B981' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="bodyFat"
                            name="Tělesný tuk (%)"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={{ fill: '#F59E0B' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="waist"
                            name="Pas (cm)"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <div className="text-center">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p>Žádná měření</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Measurements table */}
                {selectedClient.measurements?.length > 0 && (
                  <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Historie měření</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-950">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Datum</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Váha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Tuk</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Hrudník</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Pas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Boky</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Paže</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Stehna</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                          {selectedClient.measurements
                            .slice()
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((m) => (
                              <tr key={m.id} className="hover:bg-neutral-50 dark:bg-neutral-950">
                                <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                                  {format(parseISO(m.date), 'd. MMMM yyyy', { locale: cs })}
                                </td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.weight ? `${m.weight} kg` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.bodyFat ? `${m.bodyFat}%` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.chest ? `${m.chest} cm` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.waist ? `${m.waist} cm` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.hips ? `${m.hips} cm` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.arms ? `${m.arms} cm` : '-'}</td>
                                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{m.thighs ? `${m.thighs} cm` : '-'}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Vyberte klienta</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Vyberte klienta ze seznamu pro zobrazení jeho progressu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedClient && (
        <MeasurementFormModal
          isOpen={showMeasurementModal}
          onClose={() => setShowMeasurementModal(false)}
          onSuccess={fetchClients}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
        />
      )}
    </>
  )
}
