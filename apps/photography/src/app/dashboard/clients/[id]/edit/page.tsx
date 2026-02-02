'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useClient, useUpdateClient } from '@/hooks/useClients'

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

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const { data: client, isLoading: isFetching, error } = useClient(clientId)
  const updateClientMutation = useUpdateClient()

  const {
    register,
    handleSubmit,
    reset,
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

  // Pre-fill form when client data loads
  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        type: (client.type as 'individual' | 'couple' | 'business') || 'individual',
        tags: client.tags?.join(', ') || '',
        notes: client.notes || '',
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    const payload = {
      id: clientId,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      type: data.type,
      tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: data.notes || undefined,
    }

    updateClientMutation.mutate(payload, {
      onSuccess: () => {
        router.push(`/dashboard/clients/${clientId}`)
      }
    })
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Client not found</p>
        <Link href="/dashboard/clients">
          <Button className="mt-4">Back to Clients</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href={`/dashboard/clients/${clientId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Client
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Client</h1>
        <p className="text-gray-600 mt-1">Update client profile</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              helperText="Comma-separated tags for organizing clients"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={4}
                placeholder="Any additional notes about this client..."
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isSubmitting || updateClientMutation.isPending}>
            Update Client
          </Button>
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
