'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const classSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Datum a čas jsou povinné'),
  duration: z.coerce.number().min(15, 'Minimální délka je 15 minut').max(180, 'Maximální délka je 180 minut'),
  capacity: z.coerce.number().min(1, 'Minimální kapacita je 1').max(100, 'Maximální kapacita je 100'),
  location: z.string().optional(),
  price: z.coerce.number().min(0, 'Cena nemůže být záporná'),
})

type ClassFormData = z.infer<typeof classSchema>

interface ClassFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classData?: {
    id: string
    name: string
    description: string | null
    scheduledAt: string
    duration: number
    capacity: number
    location: string | null
    price: number
  } | null
}

export function ClassFormModal({ isOpen, onClose, onSuccess, classData }: ClassFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!classData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      description: '',
      scheduledAt: '',
      duration: 60,
      capacity: 10,
      location: '',
      price: 0,
    },
  })

  useEffect(() => {
    if (classData) {
      const scheduledDate = new Date(classData.scheduledAt)
      const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

      reset({
        name: classData.name,
        description: classData.description || '',
        scheduledAt: localDateTime,
        duration: classData.duration,
        capacity: classData.capacity,
        location: classData.location || '',
        price: classData.price,
      })
    } else {
      reset({
        name: '',
        description: '',
        scheduledAt: '',
        duration: 60,
        capacity: 10,
        location: '',
        price: 0,
      })
    }
  }, [classData, reset])

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEditing ? `/api/classes/${classData.id}` : '/api/classes'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      toast.success(isEditing ? 'Lekce byla upravena' : 'Lekce byla vytvořena')
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
                  <DialogTitle>
                    {isEditing ? 'Upravit lekci' : 'Nová skupinová lekce'}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Název lekce *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="např. Yoga pro začátečníky"
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
                      rows={3}
                      placeholder="Popis lekce..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum a čas *
                    </label>
                    <input
                      {...register('scheduledAt')}
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.scheduledAt && (
                      <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Délka (min) *
                      </label>
                      <input
                        {...register('duration')}
                        type="number"
                        min={15}
                        max={180}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kapacita *
                      </label>
                      <input
                        {...register('capacity')}
                        type="number"
                        min={1}
                        max={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.capacity && (
                        <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Místo konání
                    </label>
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="např. Sál A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cena (Kč)
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
                      {isEditing ? 'Uložit změny' : 'Vytvořit lekci'}
                    </button>
                  </div>
                </form>
    </Dialog>
  )
}
