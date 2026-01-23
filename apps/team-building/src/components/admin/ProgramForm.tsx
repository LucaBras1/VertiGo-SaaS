/**
 * Program Form Component
 * Form for creating and editing team building programs
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

const physicalLevels = [
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

const industryTypes = [
  { value: 'TECHNOLOGY', label: 'Technologie' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTHCARE', label: 'Zdravotnictví' },
  { value: 'EDUCATION', label: 'Vzdělávání' },
  { value: 'MANUFACTURING', label: 'Výroba' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'HOSPITALITY', label: 'Pohostinství' },
  { value: 'CONSULTING', label: 'Konzultace' },
  { value: 'GOVERNMENT', label: 'Vláda' },
  { value: 'NONPROFIT', label: 'Nezisková' },
  { value: 'OTHER', label: 'Jiné' },
]

const programSchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  teamSize: z.number().int().positive().optional().nullable(),
  minTeamSize: z.number().int().positive().optional().nullable(),
  maxTeamSize: z.number().int().positive().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  industryType: z.string().optional().nullable(),
  physicalLevel: z.string().optional().nullable(),
  indoorOutdoor: z.string().optional().nullable(),
  duration: z.number().int().positive('Délka musí být kladné číslo'),
  includesCatering: z.boolean().default(false),
  debriefIncluded: z.boolean().default(true),
  facilitationRequired: z.boolean().default(true),
  price: z.number().int().positive().optional().nullable(),
  pricePerPerson: z.number().int().positive().optional().nullable(),
  pricingNotes: z.string().optional(),
  featuredImageUrl: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  featured: z.boolean().default(false),
  activityIds: z.array(z.string()).optional(),
})

type ProgramFormData = z.infer<typeof programSchema>

interface ProgramFormProps {
  initialData?: any
  activities?: any[]
  onSubmit: (data: ProgramFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ProgramForm({
  initialData,
  activities = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: ProgramFormProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(
    initialData?.objectives || []
  )
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    initialData?.activityLinks?.map((link: any) => link.activityId) || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      ...initialData,
      objectives: initialData?.objectives || [],
      activityIds: initialData?.activityLinks?.map((link: any) => link.activityId) || [],
    },
  })

  useEffect(() => {
    setValue('objectives', selectedObjectives)
  }, [selectedObjectives, setValue])

  useEffect(() => {
    setValue('activityIds', selectedActivities)
  }, [selectedActivities, setValue])

  const toggleObjective = (objective: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(objective)
        ? prev.filter((o) => o !== objective)
        : [...prev, objective]
    )
  }

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
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
              Název programu *
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Např. Leadership Intensive"
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
              placeholder="Krátký popis programu..."
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
              placeholder="Detailní popis programu..."
            />
          </div>
        </div>
      </Card>

      {/* Team Size & Objectives */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Parametry týmu</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ideální počet účastníků
            </label>
            <input
              type="number"
              {...register('teamSize', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimální počet
            </label>
            <input
              type="number"
              {...register('minTeamSize', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximální počet
            </label>
            <input
              type="number"
              {...register('maxTeamSize', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cíle programu
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

      {/* Physical & Location */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fyzické parametry</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fyzická náročnost
            </label>
            <select
              {...register('physicalLevel')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Vyberte...</option>
              {physicalLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
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
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Průmysl
          </label>
          <select
            {...register('industryType')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Vyberte...</option>
            {industryTypes.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Services */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Služby</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('includesCatering')}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">Zahrnuje catering</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('debriefIncluded')}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">Zahrnuje debrief</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('facilitationRequired')}
              className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">Vyžaduje facilitaci</span>
          </label>
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ceník</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Základní cena (Kč)
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cena za osobu (Kč)
            </label>
            <input
              type="number"
              {...register('pricePerPerson', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Poznámky k ceně
          </label>
          <textarea
            {...register('pricingNotes')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Dodatečné informace o ceně..."
          />
        </div>
      </Card>

      {/* Activities */}
      {activities.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Aktivity v programu</h3>

          <div className="space-y-2">
            {activities.map((activity) => (
              <label
                key={activity.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity.id)}
                  onChange={() => toggleActivity(activity.id)}
                  className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                  {activity.duration && (
                    <p className="text-xs text-gray-500 mt-1">{activity.duration} minut</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}

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
              <span className="text-sm font-medium text-gray-700">Zvýrazněný program</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Uložit změny' : 'Vytvořit program'}
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
