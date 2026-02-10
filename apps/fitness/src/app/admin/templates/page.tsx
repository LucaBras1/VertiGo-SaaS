'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Loader2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { TemplateFormModal } from '@/components/templates/TemplateFormModal'

interface Exercise {
  name: string
  sets?: number
  reps?: string
  weight?: string
  duration?: number
  restSeconds?: number
  notes?: string
}

interface WorkoutTemplate {
  id: string
  name: string
  description?: string | null
  category: string
  difficulty: string
  duration: number
  exercises: Exercise[]
  muscleGroups: string[]
  equipment: string[]
  usageCount: number
  isPublic: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null)

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
      })

      const response = await fetch(`/api/workout-templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')

      const data = await response.json()
      setTemplates(data.templates)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Chyba při načítání šablon')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, categoryFilter, difficultyFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchTemplates])

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/workout-templates/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete template')
      toast.success('Šablona byla smazána')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Chyba při mazání šablony')
    }
  }

  // Handle edit
  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  // Handle use
  const handleUse = async (template: WorkoutTemplate) => {
    try {
      const response = await fetch(`/api/workout-templates/${template.id}/use`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to use template')
      const data = await response.json()
      toast.success(`Šablona "${template.name}" připravena k použití`)
      // Here you could redirect to create session with this template
      console.log('Workout plan:', data.workoutPlan)
    } catch (error) {
      console.error('Error using template:', error)
      toast.error('Chyba při použití šablony')
    }
  }

  // Handle duplicate
  const handleDuplicate = (template: WorkoutTemplate) => {
    setEditingTemplate({
      ...template,
      id: '', // Clear ID for new template
      name: `${template.name} (kopie)`,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Šablony tréninků</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Vytvářejte a spravujte opakovaně použitelné tréninkové plány
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
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 border border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat šablony..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-40">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Všechny kategorie</option>
              <option value="strength">Síla</option>
              <option value="cardio">Kardio</option>
              <option value="hiit">HIIT</option>
              <option value="flexibility">Flexibilita</option>
              <option value="mixed">Mix</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="w-full lg:w-40">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Všechny obtížnosti</option>
              <option value="beginner">Začátečník</option>
              <option value="intermediate">Pokročilý</option>
              <option value="advanced">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-12 border border-neutral-100 dark:border-neutral-800 text-center">
          <FileText className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">Žádné šablony</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Začněte vytvořením první šablony tréninku.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUse={handleUse}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Zobrazeno {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} z{' '}
            {pagination.total} šablon
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:bg-neutral-950"
            >
              Předchozí
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:bg-neutral-950"
            >
              Další
            </button>
          </div>
        </div>
      )}

      {/* Template Form Modal */}
      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTemplate(null)
        }}
        onSuccess={fetchTemplates}
        template={editingTemplate}
      />
    </div>
  )
}
