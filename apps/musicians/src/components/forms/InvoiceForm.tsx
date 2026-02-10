'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { DatePicker } from '@/components/ui/date-picker'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button, Input, Textarea, Select, SelectOption, Label, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Popis je povinný'),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
})

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Vyberte klienta'),
  gigId: z.string().optional(),
  dueDate: z.date(),
  taxRate: z.number().min(0).max(100),
  items: z.array(invoiceItemSchema).min(1, 'Přidejte alespoň jednu položku'),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData> & { id?: string }
  clients?: { id: string; firstName: string; lastName: string; company?: string }[]
  gigs?: { id: string; title: string }[]
  onSuccess?: () => void
}

export function InvoiceForm({ initialData, clients = [], gigs = [], onSuccess }: InvoiceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!initialData?.id

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      gigId: initialData?.gigId || '',
      dueDate: initialData?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      taxRate: initialData?.taxRate ?? 21,
      items: initialData?.items || [{ description: '', quantity: 1, unitPrice: 0 }],
      notes: initialData?.notes || '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const dueDate = watch('dueDate')
  const items = watch('items')
  const taxRate = watch('taxRate')

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0)
  }, 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100))
  const total = subtotal + taxAmount

  const clientOptions: SelectOption[] = clients.map(c => ({
    value: c.id,
    label: c.company ? `${c.firstName} ${c.lastName} (${c.company})` : `${c.firstName} ${c.lastName}`,
  }))

  const gigOptions: SelectOption[] = [
    { value: '', label: 'Bez gigu' },
    ...gigs.map(g => ({ value: g.id, label: g.title })),
  ]

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        customerId: data.customerId,
        gigId: data.gigId || undefined,
        dueDate: data.dueDate.toISOString(),
        taxRate: data.taxRate,
        items: data.items.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice,
        })),
        notes: data.notes || undefined,
      }

      const url = isEdit ? `/api/invoices/${initialData.id}` : '/api/invoices'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      const invoice = await response.json()
      toast.success(isEdit ? 'Faktura aktualizována' : 'Faktura vytvořena')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/invoices/${invoice.id}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client & Gig */}
      <Card>
        <CardHeader>
          <CardTitle>Fakturační údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Klient</Label>
              <Select
                options={clientOptions}
                placeholder="Vyberte klienta"
                error={errors.customerId?.message}
                {...register('customerId')}
              />
            </div>
            <div>
              <Label>Propojit s gigem</Label>
              <Select
                options={gigOptions}
                {...register('gigId')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Datum splatnosti</Label>
              <DatePicker
                value={dueDate}
                onChange={(date) => setValue('dueDate', date || new Date())}
                minDate={new Date()}
              />
            </div>
            <div>
              <Label>Sazba DPH (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                {...register('taxRate', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Položky faktury</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Přidat položku
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1">
                <Label>Popis</Label>
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Hudební produkce"
                  error={errors.items?.[index]?.description?.message}
                />
              </div>
              <div className="w-24">
                <Label>Množství</Label>
                <Input
                  type="number"
                  min={1}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
              <div className="w-32">
                <Label>Cena/ks (Kč)</Label>
                <Input
                  type="number"
                  min={0}
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </div>
              <div className="w-32">
                <Label>Celkem</Label>
                <div className="h-10 flex items-center font-medium">
                  {formatCurrency((items[index]?.quantity || 0) * (items[index]?.unitPrice || 0))}
                </div>
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">Mezisoučet:</span>
              <span className="font-medium w-32 text-right">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">DPH ({taxRate}%):</span>
              <span className="font-medium w-32 text-right">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-end gap-8 text-lg">
              <span className="font-semibold">Celkem:</span>
              <span className="font-bold w-32 text-right">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Poznámky</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Poznámky na fakturu (např. platební údaje)..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Zrušit
        </Button>
        <Button type="submit" loading={isLoading}>
          {isEdit ? 'Uložit změny' : 'Vytvořit fakturu'}
        </Button>
      </div>
    </form>
  )
}
