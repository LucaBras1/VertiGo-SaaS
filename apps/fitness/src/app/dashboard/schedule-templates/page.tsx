'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2, Calendar, Play, Copy, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { ScheduleTemplateModal } from '@/components/schedule/ScheduleTemplateModal'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface ScheduleSlot {
  dayOfWeek: number
  startTime: string
  duration: number
  type: 'session' | 'class' | 'break'
  title?: string
  notes?: string
}

interface ScheduleTemplate {
  id: string
  name: string
  description?: string | null
  slots: ScheduleSlot[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Client {
  id: string
  name: string
}

const DAYS = [
  { value: 1, label: 'Po' },
  { value: 2, label: 'Út' },
  { value: 3, label: 'St' },
  { value: 4, label: 'Čt' },
  { value: 5, label: 'Pá' },
  { value: 6, label: 'So' },
  { value: 0, label: 'Ne' },
]

const SLOT_TYPES = {
  session: { label: 'Trénink', color: 'bg-emerald-100 text-emerald-700' },
  class: { label: 'Lekce', color: 'bg-blue-100 text-blue-700' },
  break: { label: 'Přestávka', color: 'bg-gray-100 text-gray-600' },
}

export default function ScheduleTemplatesPage() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null)

  // Apply modal state
  const [applyingTemplate, setApplyingTemplate] = useState<ScheduleTemplate | null>(null)
  const [applyStartDate, setApplyStartDate] = useState('')
  const [applyClientId, setApplyClientId] = useState('')
  const [applyWeeks, setApplyWeeks] = useState(1)
  const [isApplying, setIsApplying] = useState(false)

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeFilter === 'active') {
        params.set('activeOnly', 'true')
      }

      const response = await fetch(`/api/schedule-templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Chyba při načítání šablon')
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  // Fetch clients for apply modal
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch('/api/clients?limit=100')
      if (!response.ok) throw new Error('Failed to fetch clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
    fetchClients()
  }, [fetchTemplates, fetchClients])

  // Filter templates by search
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase())
    const matchesActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' && template.isActive) ||
      (activeFilter === 'inactive' && !template.isActive)
    return matchesSearch && matchesActive
  })

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto šablonu?')) return

    try {
      const response = await fetch(`/api/schedule-templates/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete template')
      toast.success('Šablona byla smazána')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Chyba při mazání šablony')
    }
  }

  // Handle edit
  const handleEdit = (template: ScheduleTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  // Handle duplicate
  const handleDuplicate = (template: ScheduleTemplate) => {
    setEditingTemplate({
      ...template,
      id: '',
      name: `${template.name} (kopie)`,
    })
    setIsModalOpen(true)
  }

  // Handle apply
  const handleApply = async () => {
    if (!applyingTemplate || !applyStartDate) return

    setIsApplying(true)
    try {
      const response = await fetch(`/api/schedule-templates/${applyingTemplate.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: applyStartDate,
          clientId: applyClientId || undefined,
          weeks: applyWeeks,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při aplikování šablony')
      }

      const result = await response.json()
      toast.success(result.message)
      setApplyingTemplate(null)
      setApplyStartDate('')
      setApplyClientId('')
      setApplyWeeks(1)
    } catch (error) {
      console.error('Error applying template:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při aplikování šablony')
    } finally {
      setIsApplying(false)
    }
  }

  // Group slots by day for display
  const getSlotsByDay = (slots: ScheduleSlot[]) => {
    return DAYS.map((day) => ({
      ...day,
      slots: slots.filter((s) => s.dayOfWeek === day.value).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Šablony rozvrhu</h1>
          <p className="text-gray-500 mt-1">
            Vytvořte opakující se týdenní rozvrhy pro rychlé plánování
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nová šablona
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat šablony..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Active Filter */}
          <div className="w-full lg:w-48">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Všechny</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Žádné šablony</h3>
          <p className="mt-1 text-sm text-gray-500">
            Začněte vytvořením první šablony rozvrhu.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Vytvořit šablonu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {template.isActive ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                          Aktivní
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Neaktivní
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {template.slots.length} slotů • Aktualizováno{' '}
                      {format(new Date(template.updatedAt), 'd. MMM yyyy', { locale: cs })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setApplyingTemplate(template)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Aplikovat"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                      title="Duplikovat"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                      title="Upravit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Smazat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Week Preview */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {getSlotsByDay(template.slots).map((day) => (
                    <div key={day.value} className="text-center">
                      <div className="text-xs font-medium text-gray-500 mb-1">{day.label}</div>
                      <div className="space-y-1 min-h-[40px]">
                        {day.slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded ${SLOT_TYPES[slot.type].color}`}
                            title={`${slot.startTime} - ${slot.duration}min`}
                          >
                            {slot.startTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Template Modal */}
      <ScheduleTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTemplate(null)
        }}
        onSuccess={fetchTemplates}
        template={editingTemplate}
      />

      {/* Apply Template Modal */}
      {applyingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setApplyingTemplate(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aplikovat šablonu: {applyingTemplate.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Počáteční datum *
                </label>
                <input
                  type="date"
                  value={applyStartDate}
                  onChange={(e) => setApplyStartDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klient (volitelné - pro tréninky)
                </label>
                <select
                  value={applyClientId}
                  onChange={(e) => setApplyClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Bez klienta (pouze lekce)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Vyberte klienta pro vytvoření individuálních tréninků
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Počet týdnů
                </label>
                <select
                  value={applyWeeks}
                  onChange={(e) => setApplyWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'týden' : n < 5 ? 'týdny' : 'týdnů'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setApplyingTemplate(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleApply}
                disabled={!applyStartDate || isApplying}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
                Aplikovat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
