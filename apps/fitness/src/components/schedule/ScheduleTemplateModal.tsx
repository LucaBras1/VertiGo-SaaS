'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { Loader2, Plus, Trash2, Clock, Calendar } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formát HH:mm'),
  duration: z.number().min(15).max(180),
  type: z.enum(['session', 'class', 'break']),
  title: z.string().optional(),
  notes: z.string().optional(),
})

const templateSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  slots: z.array(slotSchema),
  isActive: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

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
}

interface ScheduleTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template?: ScheduleTemplate | null
}

const DAYS = [
  { value: 1, label: 'Pondělí' },
  { value: 2, label: 'Úterý' },
  { value: 3, label: 'Středa' },
  { value: 4, label: 'Čtvrtek' },
  { value: 5, label: 'Pátek' },
  { value: 6, label: 'Sobota' },
  { value: 0, label: 'Neděle' },
]

const SLOT_TYPES = [
  { value: 'session', label: 'Trénink', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'class', label: 'Lekce', color: 'bg-blue-100 text-blue-700' },
  { value: 'break', label: 'Přestávka', color: 'bg-gray-100 text-gray-600' },
]

export function ScheduleTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: ScheduleTemplateModalProps) {
  const isEditing = !!template

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      slots: [{ dayOfWeek: 1, startTime: '09:00', duration: 60, type: 'session' }],
      isActive: true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slots',
  })

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description || '',
        slots:
          template.slots.length > 0
            ? template.slots
            : [{ dayOfWeek: 1, startTime: '09:00', duration: 60, type: 'session' }],
        isActive: template.isActive,
      })
    } else {
      reset({
        name: '',
        description: '',
        slots: [{ dayOfWeek: 1, startTime: '09:00', duration: 60, type: 'session' }],
        isActive: true,
      })
    }
  }, [template, reset])

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const url = isEditing
        ? `/api/schedule-templates/${template.id}`
        : '/api/schedule-templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      toast.success(isEditing ? 'Šablona byla upravena' : 'Šablona byla vytvořena')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    }
  }

  const addSlot = () => {
    append({ dayOfWeek: 1, startTime: '09:00', duration: 60, type: 'session' })
  }

  // Group slots by day for preview
  const slots = watch('slots')
  const slotsByDay = DAYS.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.dayOfWeek === day.value),
  }))

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-3xl">
      <DialogHeader onClose={onClose}>
        <DialogTitle>{isEditing ? 'Upravit šablonu rozvrhu' : 'Nová šablona rozvrhu'}</DialogTitle>
      </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Název šablony *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Např. Standardní týden"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Popis
                      </label>
                      <textarea
                        {...register('description')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Volitelný popis šablony..."
                      />
                    </div>
                  </div>

                  {/* Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Časové sloty
                      </label>
                      <button
                        type="button"
                        onClick={addSlot}
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                        Přidat slot
                      </button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          {/* Day */}
                          <select
                            {...register(`slots.${index}.dayOfWeek`, { valueAsNumber: true })}
                            className="w-32 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            {DAYS.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>

                          {/* Time */}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <input
                              type="time"
                              {...register(`slots.${index}.startTime`)}
                              className="w-24 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          {/* Duration */}
                          <select
                            {...register(`slots.${index}.duration`, { valueAsNumber: true })}
                            className="w-24 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                            <option value={90}>90 min</option>
                            <option value={120}>120 min</option>
                          </select>

                          {/* Type */}
                          <select
                            {...register(`slots.${index}.type`)}
                            className="w-28 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            {SLOT_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>

                          {/* Title (optional) */}
                          <input
                            type="text"
                            {...register(`slots.${index}.title`)}
                            placeholder="Název (volitelné)"
                            className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Week Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Náhled týdne</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {slotsByDay.map((day) => (
                        <div key={day.value} className="text-center">
                          <div className="text-xs font-medium text-gray-500 mb-2">
                            {day.label.slice(0, 2)}
                          </div>
                          <div className="space-y-1 min-h-[60px]">
                            {day.slots.map((slot, idx) => {
                              const typeConfig = SLOT_TYPES.find((t) => t.value === slot.type)
                              return (
                                <div
                                  key={idx}
                                  className={`text-xs px-1 py-0.5 rounded ${typeConfig?.color || ''}`}
                                >
                                  {slot.startTime}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Aktivní šablona
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isEditing ? 'Uložit změny' : 'Vytvořit šablonu'}
                    </button>
                  </div>
                </form>
      </Dialog>
  )
}
