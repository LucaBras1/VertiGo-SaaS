'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const packageSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  type: z.enum(['sessions', 'classes', 'monthly']),
  price: z.coerce.number().min(0, 'Cena nemůže být záporná'),
  credits: z.coerce.number().min(1, 'Minimálně 1 kredit'),
  validityDays: z.coerce.number().min(1, 'Minimálně 1 den platnosti'),
  features: z.array(z.object({ value: z.string() })),
  isActive: z.boolean(),
})

type PackageFormData = z.infer<typeof packageSchema>

interface PackageFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  packageData?: {
    id: string
    name: string
    description: string | null
    type: string
    price: number
    credits: number
    validityDays: number
    features: string[]
    isActive: boolean
  } | null
}

export function PackageFormModal({ isOpen, onClose, onSuccess, packageData }: PackageFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!packageData

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'sessions',
      price: 0,
      credits: 10,
      validityDays: 30,
      features: [],
      isActive: true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  })

  useEffect(() => {
    if (packageData) {
      reset({
        name: packageData.name,
        description: packageData.description || '',
        type: packageData.type as 'sessions' | 'classes' | 'monthly',
        price: packageData.price,
        credits: packageData.credits,
        validityDays: packageData.validityDays,
        features: packageData.features.map(f => ({ value: f })),
        isActive: packageData.isActive,
      })
    } else {
      reset({
        name: '',
        description: '',
        type: 'sessions',
        price: 0,
        credits: 10,
        validityDays: 30,
        features: [],
        isActive: true,
      })
    }
  }, [packageData, reset])

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/packages/${packageData.id}` : '/api/packages'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          features: data.features.map(f => f.value).filter(Boolean),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      toast.success(isEditing ? 'Balíček byl upraven' : 'Balíček byl vytvořen')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-lg">
      <DialogHeader onClose={onClose}>
        <DialogTitle>{isEditing ? 'Upravit balíček' : 'Nový balíček'}</DialogTitle>
      </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Název balíčku *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="např. Základní balíček"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Popis
                    </label>
                    <textarea
                      {...register('description')}
                      rows={2}
                      placeholder="Popis balíčku..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typ balíčku *
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="sessions">Individuální tréninky</option>
                      <option value="classes">Skupinové lekce</option>
                      <option value="monthly">Měsíční členství</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cena (Kč) *
                      </label>
                      <input
                        {...register('price')}
                        type="number"
                        min={0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kredity *
                      </label>
                      <input
                        {...register('credits')}
                        type="number"
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.credits && (
                        <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platnost (dní) *
                      </label>
                      <input
                        {...register('validityDays')}
                        type="number"
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.validityDays && (
                        <p className="mt-1 text-sm text-red-600">{errors.validityDays.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Výhody balíčku
                    </label>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <input
                            {...register(`features.${index}.value`)}
                            type="text"
                            placeholder="např. Přístup do posilovny"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => append({ value: '' })}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Přidat výhodu
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      id="isActive"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Aktivní (viditelný pro klienty)
                    </label>
                  </div>

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
                      {isEditing ? 'Uložit změny' : 'Vytvořit balíček'}
                    </button>
                  </div>
                </form>
      </Dialog>
  )
}
