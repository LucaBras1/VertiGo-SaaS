'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const productionSchema = z.object({
  name: z.string().min(1, 'Production name is required'),
  type: z.enum([
    'THEATER',
    'DANCE',
    'CIRCUS',
    'MUSICAL',
    'OPERA',
    'COMEDY',
    'VARIETY',
    'KIDS_SHOW',
    'CONCERT',
    'OTHER',
  ]),
  synopsis: z.string().optional(),
  tagline: z.string().optional(),
  duration: z.coerce.number().min(1).optional(),
  hasIntermission: z.boolean().default(false),
  intermissionLength: z.coerce.number().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  director: z.string().optional(),
  playwright: z.string().optional(),
})

type ProductionFormData = z.infer<typeof productionSchema>

const productionTypes = [
  { value: 'THEATER', label: 'Theater' },
  { value: 'DANCE', label: 'Dance' },
  { value: 'CIRCUS', label: 'Circus' },
  { value: 'MUSICAL', label: 'Musical' },
  { value: 'OPERA', label: 'Opera' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'VARIETY', label: 'Variety' },
  { value: 'KIDS_SHOW', label: 'Kids Show' },
  { value: 'CONCERT', label: 'Concert' },
  { value: 'OTHER', label: 'Other' },
]

export default function NewProductionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductionFormData>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      type: 'THEATER',
      hasIntermission: false,
    },
  })

  const hasIntermission = watch('hasIntermission')

  const onSubmit = async (data: ProductionFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create production')
      }

      toast.success('Production created successfully!')
      router.push(`/admin/productions/${result.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/productions"
          className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Productions
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">New Production</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Create a new theater production</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic info */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Production Name *
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="e.g., Hamlet"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Production Type *
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white dark:bg-neutral-900"
                >
                  {productionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  {...register('duration')}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tagline
              </label>
              <input
                id="tagline"
                type="text"
                {...register('tagline')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="A short marketing tagline"
              />
            </div>

            <div>
              <label htmlFor="synopsis" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Synopsis
              </label>
              <textarea
                id="synopsis"
                rows={4}
                {...register('synopsis')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                placeholder="Brief description of the production..."
              />
            </div>

            {/* Intermission */}
            <div className="flex items-start gap-3">
              <input
                id="hasIntermission"
                type="checkbox"
                {...register('hasIntermission')}
                className="mt-1 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <label htmlFor="hasIntermission" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Has Intermission
                </label>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Check if the show includes an intermission</p>
              </div>
            </div>

            {hasIntermission && (
              <div className="ml-7">
                <label
                  htmlFor="intermissionLength"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Intermission Length (minutes)
                </label>
                <input
                  id="intermissionLength"
                  type="number"
                  {...register('intermissionLength')}
                  className="w-full max-w-xs px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="15"
                />
              </div>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Schedule</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="openingDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Opening Date
              </label>
              <input
                id="openingDate"
                type="date"
                {...register('openingDate')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="closingDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Closing Date
              </label>
              <input
                id="closingDate"
                type="date"
                {...register('closingDate')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Creative team */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Creative Team</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="director" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Director
              </label>
              <input
                id="director"
                type="text"
                {...register('director')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Director's name"
              />
            </div>

            <div>
              <label htmlFor="playwright" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Playwright
              </label>
              <input
                id="playwright"
                type="text"
                {...register('playwright')}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Playwright's name"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/productions"
            className="px-6 py-3 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:bg-neutral-50 dark:bg-neutral-800/50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              AI Assist
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Production'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
