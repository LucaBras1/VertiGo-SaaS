/**
 * Program Form Component
 * Form for creating and editing team building programs
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Card, staggerContainer, staggerItem } from '@vertigo/ui'

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
    <motion.form
      onSubmit={handleSubmit(onSubmit)} className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Basic Information */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Základní informace</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Název programu *
            </label>
            <input
              {...register('title')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Např. Leadership Intensive"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Podtitulek
            </label>
            <input
              {...register('subtitle')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Krátký podtitulek"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Krátký popis
            </label>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Krátký popis programu..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Detailní popis
            </label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Detailní popis programu..."
            />
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Team Size & Objectives */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Parametry týmu</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Ideální počet účastníků
            </label>
            <input
              type="number"
              {...register('teamSize', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Minimální počet
            </label>
            <input
              type="number"
              {...register('minTeamSize', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Maximální počet
            </label>
            <input
              type="number"
              {...register('maxTeamSize', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
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
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/30 dark:text-brand-300'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-brand-600'
                }`}
              >
                {objective.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Physical & Location */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Fyzické parametry</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Fyzická náročnost
            </label>
            <select
              {...register('physicalLevel')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
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
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Umístění
            </label>
            <select
              {...register('indoorOutdoor')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
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
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Délka (minuty) *
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.duration.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Průmysl
          </label>
          <select
            {...register('industryType')}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
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
      </motion.div>

      {/* Services */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Služby</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('includesCatering')}
              className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Zahrnuje catering</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('debriefIncluded')}
              className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Zahrnuje debrief</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('facilitationRequired')}
              className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Vyžaduje facilitaci</span>
          </label>
        </div>
      </Card>
      </motion.div>

      {/* Pricing */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Ceník</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Základní cena (Kč)
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Cena za osobu (Kč)
            </label>
            <input
              type="number"
              {...register('pricePerPerson', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Poznámky k ceně
          </label>
          <textarea
            {...register('pricingNotes')}
            rows={3}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Dodatečné informace o ceně..."
          />
        </div>
      </Card>
      </motion.div>

      {/* Activities */}
      {activities.length > 0 && (
        <motion.div variants={staggerItem}>
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Aktivity v programu</h3>

          <div className="space-y-2">
            {activities.map((activity) => (
              <label
                key={activity.id}
                className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity.id)}
                  onChange={() => toggleActivity(activity.id)}
                  className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{activity.title}</p>
                  {activity.duration && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{activity.duration} minut</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </Card>
        </motion.div>
      )}

      {/* Media */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Média</h3>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            URL hlavního obrázku
          </label>
          <input
            {...register('featuredImageUrl')}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </Card>
      </motion.div>

      {/* Status */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Stav</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
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
                className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Zvýrazněný program</span>
            </label>
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={staggerItem}>
      <div className="flex gap-4">
        <Button type="submit" loading={isLoading} className="flex-1">
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
      </motion.div>
    </motion.form>
  )
}
