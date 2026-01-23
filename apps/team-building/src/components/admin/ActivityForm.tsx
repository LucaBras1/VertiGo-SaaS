/**
 * Activity Form Component
 * Form for creating and editing team building activities
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, X } from 'lucide-react'

const objectiveTypes = [
  { value: 'COMMUNICATION', label: 'Komunikace' },
  { value: 'TRUST', label: 'Důvěra' },
  { value: 'LEADERSHIP', label: 'Vedení' },
  { value: 'PROBLEM_SOLVING', label: 'Řešení problémů' },
  { value: 'CREATIVITY', label: 'Kreativita' },
  { value: 'COLLABORATION', label: 'Spolupráce' },
  { value: 'CONFLICT', label: 'Řešení konfliktů' },
  { value: 'MOTIVATION', label: 'Motivace' },
]

const physicalDemands = [
  { value: 'LOW', label: 'Nízká' },
  { value: 'MEDIUM', label: 'Střední' },
  { value: 'HIGH', label: 'Vysoká' },
]

const indoorOutdoorOptions = [
  { value: 'INDOOR', label: 'Uvnitř' },
  { value: 'OUTDOOR', label: 'Venku' },
  { value: 'BOTH', label: 'Obojí' },
  { value: 'FLEXIBLE', label: 'Flexibilní' },
]

const difficultyLevels = [
  { value: 'easy', label: 'Snadná' },
  { value: 'medium', label: 'Střední' },
  { value: 'hard', label: 'Náročná' },
  { value: 'adaptive', label: 'Adaptivní' },
]

const activitySchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  minParticipants: z.number().int().positive().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  idealGroupSize: z.number().int().positive().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  physicalDemand: z.string().optional().nullable(),
  indoorOutdoor: z.string().optional().nullable(),
  duration: z.number().int().positive('Délka musí být kladné číslo'),
  setupTime: z.number().int().positive().optional().nullable(),
  difficultyLevel: z.string().optional().nullable(),
  scalable: z.boolean().default(true),
  canCombine: z.boolean().default(true),
  price: z.number().int().positive().optional().nullable(),
  featuredImageUrl: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  featured: z.boolean().default(false),
})

type ActivityFormData = z.infer<typeof activitySchema>

interface ActivityFormProps {
  initialData?: any
  onSubmit: (data: ActivityFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ActivityForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ActivityFormProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(
    initialData?.objectives || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      ...initialData,
      objectives: initialData?.objectives || [],
    },
  })

  useEffect(() => {
    setValue('objectives', selectedObjectives)
  }, [selectedObjectives, setValue])

  const toggleObjective = (objective: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(objective)
        ? prev.filter((o) => o !== objective)
        : [...prev, objective]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Základní informace</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Název aktivity *
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Např. Escape Room Challenge"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Podtitulek
            </label>
            <input
              {...register('subtitle')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Krátký podtitulek"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Krátký popis
            </label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Krátký popis aktivity..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailní popis
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Detailní popis aktivity včetně pravidel..."
            />
          </div>
        </div>
      </Card>

      {/* Participants & Objectives */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Účastníci a cíle</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min. účastníků
            </label>
            <input
              type="number"
              {...register('minParticipants', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max. účastníků
            </label>
            <input
              type="number"
              {...register('maxParticipants', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ideální velikost skupiny
            </label>
            <input
              type="number"
              {...register('idealGroupSize', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cíle aktivity
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {objectiveTypes.map((objective) => (
              <button
                key={objective.value}
                type="button"
                onClick={() => toggleObjective(objective.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedObjectives.includes(objective.value)
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-cyan-300'
                }`}
              >
                {objective.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Physical Parameters */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fyzické parametry</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fyzická náročnost
            </label>
            <select
              {...register('physicalDemand')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Vyberte...</option>
              {physicalDemands.map((demand) => (
                <option key={demand.value} value={demand.value}>
                  {demand.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Umístění
            </label>
            <select
              {...register('indoorOutdoor')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Vyberte...</option>
              {indoorOutdoorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Duration & Difficulty */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Délka a obtížnost</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Délka (minuty) *
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Čas přípravy (minuty)
            </label>
            <input
              type="number"
              {...register('setupTime', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Obtížnost
            </label>
            <select
              {...register('difficultyLevel')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Vyberte...</option>
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Scalability */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Škálovatelnost</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('scalable')}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Škálovatelná (lze přizpůsobit počtu účastníků)
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('canCombine')}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Lze kombinovat s jinými aktivitami
            </span>
          </label>
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ceník</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cena (Kč)
          </label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="5000"
          />
        </div>
      </Card>

      {/* Media */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Média</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL hlavního obrázku
          </label>
          <input
            {...register('featuredImageUrl')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </Card>

      {/* Status */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Stav</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="active">Aktivní</option>
              <option value="draft">Koncept</option>
              <option value="archived">Archivováno</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('featured')}
                className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">Zvýrazněná aktivita</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Uložit změny' : 'Vytvořit aktivitu'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-5 h-5 mr-2" />
            Zrušit
          </Button>
        )}
      </div>
    </form>
  )
}
