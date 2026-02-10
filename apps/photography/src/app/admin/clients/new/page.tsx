'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateClient } from '@/hooks/useClients'
import { Button, Card, CardHeader, CardTitle, Input } from '@vertigo/ui'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['individual', 'couple', 'business']).default('individual'),
  tags: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function NewClientPage() {
  const router = useRouter()
  const createClientMutation = useCreateClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'individual',
      name: '',
      email: '',
      phone: '',
      address: '',
      tags: '',
      notes: '',
    }
  })

  const onSubmit = async (data: ClientFormData) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      phone: data.phone || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
    }

    createClientMutation.mutate(payload, {
      onSuccess: (newClient) => {
        router.push(`/admin/clients/${newClient.id}`)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/admin/clients" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Add New Client</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Create a new client profile</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Input
                label="Full Name"
                {...register('name')}
                placeholder="John & Jane Smith"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Input
                type="email"
                label="Email Address"
                {...register('email')}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <Input
              type="tel"
              label="Phone Number"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
            />

            <Input
              label="Address"
              {...register('address')}
              placeholder="123 Main St, City, State"
            />
          </div>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Client Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="individual">Individual</option>
                <option value="couple">Couple</option>
                <option value="business">Business</option>
              </select>
            </div>

            <Input
              label="Tags"
              {...register('tags')}
              placeholder="wedding, vip, referral"
              hint="Comma-separated tags for organizing clients"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={4}
                placeholder="Any additional notes about this client..."
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={isSubmitting || createClientMutation.isPending}>
            Create Client
          </Button>
          <Link href="/admin/clients">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
