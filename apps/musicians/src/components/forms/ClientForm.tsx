'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const clientSchema = z.object({
  firstName: z.string().min(1, 'Jméno je povinné'),
  lastName: z.string().min(1, 'Příjmení je povinné'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  initialData?: Partial<ClientFormData> & { id?: string }
  onSuccess?: () => void
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!initialData?.id

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {},
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        address: (data.street || data.city || data.zip) ? {
          street: data.street,
          city: data.city,
          zip: data.zip,
        } : undefined,
        notes: data.notes || undefined,
      }

      const url = isEdit ? `/api/clients/${initialData.id}` : '/api/clients'
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

      const client = await response.json()
      toast.success(isEdit ? 'Klient aktualizován' : 'Klient vytvořen')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/clients/${client.id}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Základní údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Jméno</Label>
              <Input
                {...register('firstName')}
                placeholder="Jan"
                error={errors.firstName?.message}
              />
            </div>
            <div>
              <Label required>Příjmení</Label>
              <Input
                {...register('lastName')}
                placeholder="Novák"
                error={errors.lastName?.message}
              />
            </div>
          </div>

          <div>
            <Label>Firma</Label>
            <Input
              {...register('company')}
              placeholder="Firma s.r.o."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Email</Label>
              <Input
                type="email"
                {...register('email')}
                placeholder="jan@example.com"
                error={errors.email?.message}
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                {...register('phone')}
                placeholder="+420 123 456 789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Adresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Ulice</Label>
            <Input
              {...register('street')}
              placeholder="Hlavní 123"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Město</Label>
              <Input
                {...register('city')}
                placeholder="Praha"
              />
            </div>
            <div>
              <Label>PSČ</Label>
              <Input
                {...register('zip')}
                placeholder="110 00"
              />
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
            placeholder="Poznámky ke klientovi..."
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
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Uložit změny' : 'Vytvořit klienta'}
        </Button>
      </div>
    </form>
  )
}
