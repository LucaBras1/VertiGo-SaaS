/**
 * Session Form Component
 * Form for creating and editing team building sessions
 */

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@vertigo/ui'
import { format } from 'date-fns'

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

const sessionSchema = z.object({
  programId: z.string().min(1, 'Program je povinný'),
  customerId: z.string().optional().nullable(),
  date: z.string().min(1, 'Datum je povinné'),
  endDate: z.string().optional().nullable(),
  venueName: z.string().min(1, 'Název místa je povinný'),
  venueCity: z.string().optional(),
  venueAddress: z.string().optional(),
  venueIndoorOutdoor: z.enum(['INDOOR', 'OUTDOOR', 'BOTH']).optional(),
  teamSize: z.number().int().positive().optional().nullable(),
  teamName: z.string().optional(),
  companyName: z.string().optional(),
  industryType: z.string().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  customObjectives: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'completed', 'cancelled']).default('confirmed'),
  isPublic: z.boolean().default(false),
  notes: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

interface SessionFormProps {
  initialData?: any
  programs?: any[]
  customers?: any[]
  onSubmit: (data: SessionFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function SessionForm({
  initialData,
  programs = [],
  customers = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: SessionFormProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(
    initialData?.objectives || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      ...initialData,
      date: initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : '',
      endDate: initialData?.endDate ? format(new Date(initialData.endDate), 'yyyy-MM-dd') : '',
      venueName: initialData?.venue?.name || '',
      venueCity: initialData?.venue?.city || '',
      venueAddress: initialData?.venue?.address || '',
      venueIndoorOutdoor: initialData?.venue?.indoorOutdoor || undefined,
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

  const handleFormSubmit = async (data: SessionFormData) => {
    // Transform form data to match API expectations
    const submissionData = {
      ...data,
      venue: {
        name: data.venueName,
        city: data.venueCity,
        address: data.venueAddress,
        indoorOutdoor: data.venueIndoorOutdoor,
      },
      date: new Date(data.date).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }

    await onSubmit(submissionData as any)
  }

  return (
    <motion.form
      onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Program & Customer */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Program a zákazník</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Program *
            </label>
            <select
              {...register('programId')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Vyberte program...</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
            {errors.programId && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.programId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Zákazník
            </label>
            <select
              {...register('customerId')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Vyberte zákazníka...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} - {customer.organization}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Date & Venue */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Termín a místo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Datum začátku *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Datum konce
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Název místa *
            </label>
            <input
              {...register('venueName')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Např. Hotel Panorama"
            />
            {errors.venueName && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.venueName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Město
              </label>
              <input
                {...register('venueCity')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                placeholder="Praha"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Umístění
              </label>
              <select
                {...register('venueIndoorOutdoor')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">Vyberte...</option>
                <option value="INDOOR">Uvnitř</option>
                <option value="OUTDOOR">Venku</option>
                <option value="BOTH">Obojí</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Adresa
            </label>
            <textarea
              {...register('venueAddress')}
              rows={2}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Úplná adresa místa konání"
            />
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Team Information */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Informace o týmu</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Název týmu
            </label>
            <input
              {...register('teamName')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Např. Marketing Team"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Počet účastníků
            </label>
            <input
              type="number"
              {...register('teamSize', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Název společnosti
            </label>
            <input
              {...register('companyName')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Acme Corp"
            />
          </div>

          <div>
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
        </div>
      </Card>
      </motion.div>

      {/* Objectives */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Cíle workshopu</h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Vyberte cíle
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

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Vlastní cíle (volitelné)
          </label>
          <textarea
            {...register('customObjectives')}
            rows={3}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Specifické cíle klienta..."
          />
        </div>
      </Card>
      </motion.div>

      {/* Status & Notes */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Stav a poznámky</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="confirmed">Potvrzeno</option>
              <option value="tentative">Předběžně</option>
              <option value="completed">Dokončeno</option>
              <option value="cancelled">Zrušeno</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="h-5 w-5 rounded border-neutral-300 text-brand-500 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Veřejná akce</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Interní poznámky
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Interní poznámky k workshopu..."
          />
        </div>
      </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={staggerItem}>
      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Uložit změny' : 'Vytvořit workshop'}
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
