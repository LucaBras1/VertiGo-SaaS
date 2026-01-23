'use client'

import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const clientSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  goals: z.array(z.string()).optional(),
  currentWeight: z.coerce.number().positive().optional().or(z.literal('')),
  targetWeight: z.coerce.number().positive().optional().or(z.literal('')),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  fitnessLevel: z.string().optional(),
  injuryHistory: z.string().optional(),
  dietaryNotes: z.string().optional(),
  medicalNotes: z.string().optional(),
  membershipType: z.string().optional(),
  creditsRemaining: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  client?: {
    id: string
    name: string
    email: string
    phone: string | null
    dateOfBirth?: string | null
    gender?: string | null
    goals?: string[]
    currentWeight?: number | null
    targetWeight?: number | null
    height?: number | null
    fitnessLevel?: string | null
    injuryHistory?: string | null
    dietaryNotes?: string | null
    medicalNotes?: string | null
    membershipType?: string | null
    creditsRemaining?: number
    notes?: string | null
  } | null
}

const goalOptions = [
  { value: 'weight_loss', label: 'Hubnutí' },
  { value: 'muscle_gain', label: 'Nárůst svalů' },
  { value: 'strength', label: 'Síla' },
  { value: 'endurance', label: 'Vytrvalost' },
  { value: 'flexibility', label: 'Flexibilita' },
]

export function ClientFormModal({ isOpen, onClose, onSaved, client }: ClientFormModalProps) {
  const isEditing = !!client?.id

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      goals: [],
      creditsRemaining: 0,
    },
  })

  const selectedGoals = watch('goals') || []

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
        gender: client.gender || '',
        goals: client.goals || [],
        currentWeight: client.currentWeight || '',
        targetWeight: client.targetWeight || '',
        height: client.height || '',
        fitnessLevel: client.fitnessLevel || '',
        injuryHistory: client.injuryHistory || '',
        dietaryNotes: client.dietaryNotes || '',
        medicalNotes: client.medicalNotes || '',
        membershipType: client.membershipType || '',
        creditsRemaining: client.creditsRemaining || 0,
        notes: client.notes || '',
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        goals: [],
        creditsRemaining: 0,
      })
    }
  }, [client, reset])

  const toggleGoal = (goal: string) => {
    const current = selectedGoals || []
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal]
    setValue('goals', updated)
  }

  const onSubmit = async (data: ClientFormData) => {
    try {
      const url = isEditing ? `/api/clients/${client.id}` : '/api/clients'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          currentWeight: data.currentWeight || undefined,
          targetWeight: data.targetWeight || undefined,
          height: data.height || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Klient byl aktualizován' : 'Klient byl vytvořen')
        onSaved()
      } else {
        toast.error(result.error || 'Chyba při ukládání klienta')
      }
    } catch {
      toast.error('Chyba při ukládání klienta')
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Upravit klienta' : 'Nový klient'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Základní informace</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jméno *
                        </label>
                        <input
                          type="text"
                          {...register('name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Jan Novák"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="jan@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="+420 123 456 789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Datum narození
                        </label>
                        <input
                          type="date"
                          {...register('dateOfBirth')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fitness Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Fitness údaje</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Váha (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('currentWeight')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cílová váha (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          {...register('targetWeight')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="70"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Výška (cm)
                        </label>
                        <input
                          type="number"
                          {...register('height')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="175"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Úroveň kondice
                      </label>
                      <select
                        {...register('fitnessLevel')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Vyberte...</option>
                        <option value="beginner">Začátečník</option>
                        <option value="intermediate">Pokročilý</option>
                        <option value="advanced">Expert</option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cíle
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {goalOptions.map((goal) => (
                          <button
                            key={goal.value}
                            type="button"
                            onClick={() => toggleGoal(goal.value)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                              selectedGoals.includes(goal.value)
                                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                            )}
                          >
                            {goal.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Membership */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Členství</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typ členství
                        </label>
                        <select
                          {...register('membershipType')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Vyberte...</option>
                          <option value="monthly">Měsíční</option>
                          <option value="yearly">Roční</option>
                          <option value="package">Balíček</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kredity
                        </label>
                        <input
                          type="number"
                          {...register('creditsRemaining')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Interní poznámky o klientovi..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                      {isEditing ? 'Uložit změny' : 'Vytvořit klienta'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
