'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const exerciseSchema = z.object({
  name: z.string().min(1, 'Název cviku je povinný'),
  sets: z.number().min(1).optional(),
  reps: z.string().optional(),
  weight: z.string().optional(),
  duration: z.number().optional(),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
})

const templateSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
  category: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(15).max(180),
  exercises: z.array(exerciseSchema).min(1, 'Přidejte alespoň jeden cvik'),
  muscleGroups: z.array(z.string()),
  equipment: z.array(z.string()),
  isPublic: z.boolean().optional().default(false),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface WorkoutTemplate {
  id: string
  name: string
  description?: string | null
  category: string
  difficulty: string
  duration: number
  exercises: Array<{
    name: string
    sets?: number
    reps?: string
    weight?: string
    duration?: number
    restSeconds?: number
    notes?: string
  }>
  muscleGroups: string[]
  equipment: string[]
  isPublic: boolean
}

interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  template?: WorkoutTemplate | null
}

const MUSCLE_GROUPS = [
  'Hrudník', 'Záda', 'Ramena', 'Biceps', 'Triceps',
  'Břicho', 'Nohy', 'Lýtka', 'Hýždě', 'Core',
]

const EQUIPMENT = [
  'Žádné', 'Činky', 'Kettlebell', 'Odporové gumy', 'TRX',
  'Činková tyč', 'Stroje', 'Medicinbal', 'Bosu', 'Skákací švihadlo',
]

export function TemplateFormModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: TemplateFormModalProps) {
  const isEditing = !!template
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'beginner',
      duration: 60,
      exercises: [{ name: '', sets: 3, reps: '10' }],
      muscleGroups: [],
      equipment: [],
      isPublic: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  })

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description || '',
        category: template.category as TemplateFormData['category'],
        difficulty: template.difficulty as TemplateFormData['difficulty'],
        duration: template.duration,
        exercises: template.exercises.length > 0 ? template.exercises : [{ name: '', sets: 3, reps: '10' }],
        muscleGroups: template.muscleGroups,
        equipment: template.equipment,
        isPublic: template.isPublic,
      })
      setSelectedMuscleGroups(template.muscleGroups)
      setSelectedEquipment(template.equipment)
    } else {
      reset({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'beginner',
        duration: 60,
        exercises: [{ name: '', sets: 3, reps: '10' }],
        muscleGroups: [],
        equipment: [],
        isPublic: false,
      })
      setSelectedMuscleGroups([])
      setSelectedEquipment([])
    }
  }, [template, reset])

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const payload = {
        ...data,
        muscleGroups: selectedMuscleGroups,
        equipment: selectedEquipment,
      }

      const url = isEditing ? `/api/workout-templates/${template.id}` : '/api/workout-templates'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání šablony')
      }

      toast.success(isEditing ? 'Šablona byla upravena' : 'Šablona byla vytvořena')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání šablony')
    }
  }

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )
  }

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <DialogTitle>{isEditing ? 'Upravit šablonu' : 'Nová šablona tréninku'}</DialogTitle>
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
                        placeholder="Např. Full Body Strength"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategorie
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="strength">Síla</option>
                        <option value="cardio">Kardio</option>
                        <option value="hiit">HIIT</option>
                        <option value="flexibility">Flexibilita</option>
                        <option value="mixed">Mix</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Obtížnost
                      </label>
                      <select
                        {...register('difficulty')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="beginner">Začátečník</option>
                        <option value="intermediate">Pokročilý</option>
                        <option value="advanced">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Délka (min)
                      </label>
                      <input
                        type="number"
                        {...register('duration', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Popis
                      </label>
                      <textarea
                        {...register('description')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Krátký popis šablony..."
                      />
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Svalové skupiny
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map((group) => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => toggleMuscleGroup(group)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedMuscleGroups.includes(group)
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } border`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vybavení
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleEquipment(item)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedEquipment.includes(item)
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } border`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercises */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cviky *
                      </label>
                      <button
                        type="button"
                        onClick={() => append({ name: '', sets: 3, reps: '10' })}
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                        Přidat cvik
                      </button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <GripVertical className="h-5 w-5 text-gray-400 mt-2 flex-shrink-0" />
                          <div className="flex-1 grid grid-cols-12 gap-2">
                            <div className="col-span-5">
                              <input
                                {...register(`exercises.${index}.name`)}
                                placeholder="Název cviku"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                {...register(`exercises.${index}.sets`, { valueAsNumber: true })}
                                placeholder="Série"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                {...register(`exercises.${index}.reps`)}
                                placeholder="Opak."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                {...register(`exercises.${index}.weight`)}
                                placeholder="Váha"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.exercises && (
                      <p className="mt-1 text-sm text-red-600">{errors.exercises.message}</p>
                    )}
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
