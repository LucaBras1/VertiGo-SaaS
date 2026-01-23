'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Popis je povinný'),
  quantity: z.coerce.number().min(1, 'Minimálně 1'),
  unitPrice: z.coerce.number().min(0, 'Cena nemůže být záporná'),
})

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Vyberte klienta'),
  dueDate: z.string().min(1, 'Datum splatnosti je povinné'),
  items: z.array(invoiceItemSchema).min(1, 'Přidejte alespoň jednu položku'),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface Client {
  id: string
  name: string
  email: string
}

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InvoiceFormModal({ isOpen, onClose, onSuccess }: InvoiceFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      dueDate: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchItems = watch('items')

  const subtotal = watchItems?.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0)
  }, 0) || 0

  const tax = subtotal * 0.21 // 21% DPH
  const total = subtotal + tax

  useEffect(() => {
    if (isOpen) {
      fetchClients()
      // Set default due date to 14 days from now
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)
      reset({
        clientId: '',
        dueDate: dueDate.toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        notes: '',
      })
    }
  }, [isOpen, reset])

  const fetchClients = async () => {
    setIsLoadingClients(true)
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      if (response.ok) {
        setClients(data.clients || [])
      }
    } catch {
      toast.error('Chyba při načítání klientů')
    } finally {
      setIsLoadingClients(false)
    }
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subtotal,
          tax,
          total,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při vytváření faktury')
      }

      toast.success('Faktura byla vytvořena')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při vytváření faktury')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(amount)
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                    Nová faktura
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Klient *
                      </label>
                      <select
                        {...register('clientId')}
                        disabled={isLoadingClients}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                      >
                        <option value="">Vyberte klienta</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </option>
                        ))}
                      </select>
                      {errors.clientId && (
                        <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum splatnosti *
                      </label>
                      <input
                        {...register('dueDate')}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Položky faktury *
                    </label>
                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <input
                              {...register(`items.${index}.description`)}
                              type="text"
                              placeholder="Popis položky"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            {errors.items?.[index]?.description && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.items[index]?.description?.message}
                              </p>
                            )}
                          </div>
                          <div className="w-24">
                            <input
                              {...register(`items.${index}.quantity`)}
                              type="number"
                              min={1}
                              placeholder="Počet"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <div className="w-32">
                            <input
                              {...register(`items.${index}.unitPrice`)}
                              type="number"
                              min={0}
                              placeholder="Cena/ks"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <div className="w-28 py-2 text-right text-sm font-medium text-gray-700">
                            {formatCurrency((watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0))}
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Plus className="h-4 w-4" />
                        Přidat položku
                      </button>
                    </div>
                    {errors.items && !Array.isArray(errors.items) && (
                      <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Volitelné poznámky k faktuře..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mezisoučet:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">DPH (21%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                      <span>Celkem:</span>
                      <span className="text-primary-600">{formatCurrency(total)}</span>
                    </div>
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
                      Vytvořit fakturu
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
