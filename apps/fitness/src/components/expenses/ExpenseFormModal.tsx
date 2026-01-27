'use client'

import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Loader2, Receipt, Calendar, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const expenseSchema = z.object({
  description: z.string().min(1, 'Popis je povinný'),
  amount: z.number().positive('Částka musí být kladná'),
  currency: z.string().default('CZK'),
  date: z.string().min(1, 'Datum je povinné'),
  categoryId: z.string().min(1, 'Vyberte kategorii'),
  vendor: z.string().optional(),
  taxAmount: z.number().optional(),
  isTaxDeductible: z.boolean().default(false),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseCategory {
  id: string
  name: string
  description?: string | null
}

interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  date: string
  categoryId: string
  vendor?: string | null
  taxAmount?: number | null
  isTaxDeductible: boolean
  notes?: string | null
}

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  expense?: Expense | null
  categories: ExpenseCategory[]
}

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
  categories,
}: ExpenseFormModalProps) {
  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      currency: 'CZK',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      vendor: '',
      taxAmount: undefined,
      isTaxDeductible: false,
      notes: '',
    },
  })

  const isTaxDeductible = watch('isTaxDeductible')
  const amount = watch('amount')

  // Calculate VAT amount (21%) when tax deductible
  useEffect(() => {
    if (isTaxDeductible && amount > 0) {
      const vatAmount = Math.round((amount * 21) / 121) // VAT from gross amount
      setValue('taxAmount', vatAmount)
    } else if (!isTaxDeductible) {
      setValue('taxAmount', undefined)
    }
  }, [isTaxDeductible, amount, setValue])

  useEffect(() => {
    if (expense) {
      reset({
        description: expense.description,
        amount: Number(expense.amount),
        currency: expense.currency,
        date: new Date(expense.date).toISOString().split('T')[0],
        categoryId: expense.categoryId,
        vendor: expense.vendor || '',
        taxAmount: expense.taxAmount ? Number(expense.taxAmount) : undefined,
        isTaxDeductible: expense.isTaxDeductible,
        notes: expense.notes || '',
      })
    } else {
      reset({
        description: '',
        amount: 0,
        currency: 'CZK',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        vendor: '',
        taxAmount: undefined,
        isTaxDeductible: false,
        notes: '',
      })
    }
  }, [expense, reset])

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const url = isEditing ? `/api/expenses/${expense.id}` : '/api/expenses'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání výdaje')
      }

      toast.success(isEditing ? 'Výdaj byl upraven' : 'Výdaj byl přidán')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání výdaje')
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
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                    {isEditing ? 'Upravit výdaj' : 'Nový výdaj'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Popis *
                    </label>
                    <input
                      type="text"
                      {...register('description')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Např. Nákup vybavení"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Amount and Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Částka *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          {...register('amount', { valueAsNumber: true })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Měna
                      </label>
                      <select
                        {...register('currency')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="CZK">CZK</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        {...register('date')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie *
                    </label>
                    <select
                      {...register('categoryId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Vyberte kategorii</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Vendor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dodavatel
                    </label>
                    <input
                      type="text"
                      {...register('vendor')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Název dodavatele"
                    />
                  </div>

                  {/* Tax Deductible */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isTaxDeductible"
                      {...register('isTaxDeductible')}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="isTaxDeductible"
                        className="text-sm font-medium text-gray-700"
                      >
                        Daňově uznatelný výdaj
                      </label>
                      <p className="text-xs text-gray-500">
                        Automaticky vypočítá DPH (21%)
                      </p>
                    </div>
                    {isTaxDeductible && (
                      <div className="text-right">
                        <span className="text-xs text-gray-500">DPH</span>
                        <p className="text-sm font-medium text-emerald-600">
                          {Math.round((amount * 21) / 121)} Kč
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poznámky
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Dodatečné poznámky..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
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
                      {isEditing ? 'Uložit' : 'Přidat výdaj'}
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
