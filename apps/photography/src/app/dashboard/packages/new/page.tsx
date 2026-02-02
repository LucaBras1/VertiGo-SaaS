'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useClients } from '@/hooks/useClients'
import { useCreatePackage } from '@/hooks/usePackages'

const packageSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  title: z.string().min(1, 'Package title is required'),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  shotCount: z.number().int().positive().optional().nullable(),
  deliveryDays: z.number().int().positive().optional().nullable(),
  editingHours: z.number().positive().optional().nullable(),
  styleTags: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  secondShooter: z.boolean().optional(),
  rawFilesIncluded: z.boolean().optional(),
  basePrice: z.number().int().nonnegative().optional().nullable(),
  travelCosts: z.number().int().nonnegative().optional().nullable(),
  totalPrice: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional(),
})

type PackageFormData = z.infer<typeof packageSchema>

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'family', label: 'Family' },
  { value: 'product', label: 'Product' },
  { value: 'newborn', label: 'Newborn' },
  { value: 'maternity', label: 'Maternity' },
]

export default function NewPackagePage() {
  const router = useRouter()
  const { data, isLoading: clientsLoading } = useClients()
  const clients = data?.clients ?? []
  const createPackage = useCreatePackage()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      eventType: 'wedding',
      secondShooter: false,
      rawFilesIncluded: false,
      styleTags: [],
      equipment: [],
    },
  })

  // Auto-calculate total price
  const basePrice = watch('basePrice')
  const travelCosts = watch('travelCosts')

  const onSubmit = async (data: PackageFormData) => {
    try {
      const result = await createPackage.mutateAsync({
        ...data,
        eventDate: data.eventDate || undefined,
        shotCount: data.shotCount || undefined,
        deliveryDays: data.deliveryDays || undefined,
        editingHours: data.editingHours || undefined,
        basePrice: data.basePrice || undefined,
        travelCosts: data.travelCosts || undefined,
        totalPrice: data.totalPrice || undefined,
      })
      router.push(`/dashboard/packages/${result.id}`)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/packages" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Package</h1>
        <p className="text-gray-600 mt-1">Set up a new photography package for your client</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                {...register('clientId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={clientsLoading}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
              )}
              {clients.length === 0 && !clientsLoading && (
                <p className="mt-1 text-sm text-gray-500">
                  No clients found.{' '}
                  <Link href="/dashboard/clients/new" className="text-amber-600 hover:text-amber-700">
                    Create a client first
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Title *</label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g., Wedding Photography Package"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  {...register('eventType')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  {...register('eventDate')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Photography Details */}
        <Card>
          <CardHeader>
            <CardTitle>Photography Details</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shot Count</label>
              <input
                {...register('shotCount', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Number of final photos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Days</label>
              <input
                {...register('deliveryDays', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Days until delivery"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Editing Hours</label>
              <input
                {...register('editingHours', { valueAsNumber: true })}
                type="number"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Estimated edit time"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style Tags</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="moody, bright, documentary"
                onChange={(e) => setValue('styleTags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Canon R5, 24-70mm"
                onChange={(e) => setValue('equipment', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
            </div>

            <div className="flex flex-col gap-3 justify-center">
              <label className="flex items-center">
                <input
                  {...register('secondShooter')}
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Second Shooter</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('rawFilesIncluded')}
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">RAW Files Included</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
              <input
                {...register('basePrice', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Costs ($)</label>
              <input
                {...register('travelCosts', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
              <input
                {...register('totalPrice', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={((basePrice || 0) + (travelCosts || 0)).toString()}
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <textarea
            {...register('notes')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            placeholder="Any additional notes or requirements..."
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting || createPackage.isPending}>
            {(isSubmitting || createPackage.isPending) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Create Package
          </Button>
          <Link href="/dashboard/packages">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
