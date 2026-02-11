'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const measurementSchema = z.object({
  date: z.string().min(1, 'Datum je povinné'),
  weight: z.coerce.number().min(20).max(300).optional().or(z.literal('')),
  bodyFat: z.coerce.number().min(1).max(60).optional().or(z.literal('')),
  notes: z.string().optional(),
})

type MeasurementFormData = z.infer<typeof measurementSchema>

interface CustomMeasurement {
  key: string
  value: string
}

interface MeasurementFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clientId: string
  clientName: string
}

const COMMON_MEASUREMENTS = [
  { key: 'chest', label: 'Hrudník (cm)' },
  { key: 'waist', label: 'Pas (cm)' },
  { key: 'hips', label: 'Boky (cm)' },
  { key: 'bicepsLeft', label: 'Biceps L (cm)' },
  { key: 'bicepsRight', label: 'Biceps P (cm)' },
  { key: 'thighLeft', label: 'Stehno L (cm)' },
  { key: 'thighRight', label: 'Stehno P (cm)' },
  { key: 'calfLeft', label: 'Lýtko L (cm)' },
  { key: 'calfRight', label: 'Lýtko P (cm)' },
]

export function MeasurementFormModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: MeasurementFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customMeasurements, setCustomMeasurements] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        notes: '',
      })
      setCustomMeasurements({})
    }
  }, [isOpen, reset])

  const handleMeasurementChange = (key: string, value: string) => {
    setCustomMeasurements((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const onSubmit = async (data: MeasurementFormData) => {
    setIsSubmitting(true)
    try {
      // Filter out empty custom measurements
      const validMeasurements = Object.entries(customMeasurements).reduce(
        (acc, [key, value]) => {
          if (value && !isNaN(parseFloat(value))) {
            acc[key] = parseFloat(value)
          }
          return acc
        },
        {} as Record<string, number>
      )

      const response = await fetch(`/api/clients/${clientId}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          weight: data.weight || null,
          bodyFat: data.bodyFat || null,
          measurements: Object.keys(validMeasurements).length > 0 ? validMeasurements : null,
          notes: data.notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      toast.success('Měření bylo uloženo')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Nové měření</DialogTitle>
      </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Measurements */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Základní údaje</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum *
                      </label>
                      <input
                        {...register('date')}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Váha (kg)
                        </label>
                        <input
                          {...register('weight')}
                          type="number"
                          step="0.1"
                          placeholder="např. 75.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tělesný tuk (%)
                        </label>
                        <input
                          {...register('bodyFat')}
                          type="number"
                          step="0.1"
                          placeholder="např. 18.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Measurements */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Tělesné míry</h3>

                    <div className="grid grid-cols-2 gap-3">
                      {COMMON_MEASUREMENTS.map((measurement) => (
                        <div key={measurement.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {measurement.label}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={customMeasurements[measurement.key] || ''}
                            onChange={(e) =>
                              handleMeasurementChange(measurement.key, e.target.value)
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Dodatečné poznámky k měření..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Uložit měření
                    </button>
                  </div>
                </form>
      </Dialog>
  )
}
