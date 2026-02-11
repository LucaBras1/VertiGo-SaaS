'use client'

import { Fragment, useEffect, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const sessionSchema = z.object({
  clientId: z.string().min(1, 'Vyberte klienta'),
  scheduledAt: z.string().min(1, 'Zadejte datum a čas'),
  duration: z.coerce.number().int().min(15).max(180),
  muscleGroups: z.array(z.string()).optional(),
  price: z.coerce.number().optional(),
  notes: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

interface Client {
  id: string
  name: string
  email: string
  creditsRemaining: number
}

interface BookSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  defaultDate?: Date | null
}

const muscleGroupOptions = [
  { value: 'chest', label: 'Hrudník' },
  { value: 'back', label: 'Záda' },
  { value: 'shoulders', label: 'Ramena' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'legs', label: 'Nohy' },
  { value: 'glutes', label: 'Hýždě' },
  { value: 'core', label: 'Jádro' },
  { value: 'full_body', label: 'Celé tělo' },
]

export function BookSessionModal({
  isOpen,
  onClose,
  onSaved,
  defaultDate,
}: BookSessionModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoadingClients, setIsLoadingClients] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      duration: 60,
      muscleGroups: [],
    },
  })

  const selectedMuscleGroups = watch('muscleGroups') || []

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true)
      try {
        const response = await fetch('/api/clients?limit=100&status=active')
        const data = await response.json()
        if (response.ok) {
          setClients(data.clients)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoadingClients(false)
      }
    }

    if (isOpen) {
      fetchClients()
    }
  }, [isOpen])

  // Set default date
  useEffect(() => {
    if (defaultDate) {
      const dateTime = new Date(defaultDate)
      dateTime.setHours(9, 0, 0, 0)
      setValue('scheduledAt', format(dateTime, "yyyy-MM-dd'T'HH:mm"))
    } else {
      const now = new Date()
      now.setHours(now.getHours() + 1, 0, 0, 0)
      setValue('scheduledAt', format(now, "yyyy-MM-dd'T'HH:mm"))
    }
  }, [defaultDate, setValue, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setSelectedClient(null)
      setClientSearch('')
    }
  }, [isOpen, reset])

  const filteredClients =
    clientSearch === ''
      ? clients
      : clients.filter((client) =>
          client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          client.email.toLowerCase().includes(clientSearch.toLowerCase())
        )

  const toggleMuscleGroup = (group: string) => {
    const current = selectedMuscleGroups || []
    const updated = current.includes(group)
      ? current.filter((g) => g !== group)
      : [...current, group]
    setValue('muscleGroups', updated)
  }

  const onSubmit = async (data: SessionFormData) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Session byla vytvořena')
        onSaved()
      } else {
        toast.error(result.error || 'Chyba při vytváření session')
      }
    } catch {
      toast.error('Chyba při vytváření session')
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-lg">
                <DialogHeader onClose={onClose}>
                  <DialogTitle>
                    Nová session
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Client Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Klient *
                    </label>
                    <Combobox
                      value={selectedClient}
                      onChange={(client) => {
                        setSelectedClient(client)
                        setValue('clientId', client?.id || '')
                      }}
                    >
                      <div className="relative">
                        <div className="relative">
                          <Combobox.Input
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            displayValue={(client: Client | null) => client?.name || ''}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Vyberte klienta..."
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDown className="h-5 w-5 text-gray-400" />
                          </Combobox.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {isLoadingClients ? (
                              <div className="px-4 py-2 text-sm text-gray-500">
                                Načítám klienty...
                              </div>
                            ) : filteredClients.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-gray-500">
                                Žádní klienti nenalezeni
                              </div>
                            ) : (
                              filteredClients.map((client) => (
                                <Combobox.Option
                                  key={client.id}
                                  value={client}
                                  className={({ active }) =>
                                    cn(
                                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                                      active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                                    )
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <span
                                          className={cn(
                                            'block truncate',
                                            selected ? 'font-medium' : 'font-normal'
                                          )}
                                        >
                                          {client.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {client.creditsRemaining} kreditů
                                        </span>
                                      </div>
                                      <span className="block text-xs text-gray-500 truncate">
                                        {client.email}
                                      </span>
                                      {selected && (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                          <Check className="h-5 w-5" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                    {errors.clientId && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum a čas *
                      </label>
                      <input
                        type="datetime-local"
                        {...register('scheduledAt')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.scheduledAt && (
                        <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Délka (min)
                      </label>
                      <select
                        {...register('duration')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={30}>30 minut</option>
                        <option value={45}>45 minut</option>
                        <option value={60}>60 minut</option>
                        <option value={90}>90 minut</option>
                        <option value={120}>120 minut</option>
                      </select>
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Svalové partie
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {muscleGroupOptions.map((group) => (
                        <button
                          key={group.value}
                          type="button"
                          onClick={() => toggleMuscleGroup(group.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                            selectedMuscleGroups.includes(group.value)
                              ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          )}
                        >
                          {group.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cena (Kč)
                    </label>
                    <input
                      type="number"
                      {...register('price')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1000"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Interní poznámky k session..."
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
                      Vytvořit session
                    </button>
                  </div>
                </form>
    </Dialog>
  )
}
