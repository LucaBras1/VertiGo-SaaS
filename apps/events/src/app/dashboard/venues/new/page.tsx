'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  FileText,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react'
import { useCreateVenue } from '@/hooks/use-venues'
import { useToast } from '@/hooks/use-toast'

const venueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['indoor', 'outdoor', 'mixed']),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.string().optional(),
  setupAccessTime: z.string().optional(),
  curfew: z.string().optional(),
  restrictions: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

type VenueFormData = z.infer<typeof venueSchema>

export default function NewVenuePage() {
  const router = useRouter()
  const toast = useToast()
  const createVenue = useCreateVenue()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      type: 'indoor',
    },
  })

  const venueType = watch('type')

  const typeConfig = {
    indoor: { label: 'Indoor', color: 'from-blue-500 to-blue-600', icon: Building2 },
    outdoor: { label: 'Outdoor', color: 'from-green-500 to-green-600', icon: MapPin },
    mixed: { label: 'Mixed', color: 'from-purple-500 to-purple-600', icon: Building2 },
  }

  const onSubmit = async (data: VenueFormData) => {
    setIsSubmitting(true)
    try {
      const restrictions = data.restrictions
        ? data.restrictions.split(',').map((r) => r.trim()).filter(Boolean)
        : []

      const venue = await createVenue.mutateAsync({
        name: data.name,
        type: data.type,
        address: data.address || undefined,
        city: data.city || undefined,
        capacity: data.capacity ? parseInt(data.capacity, 10) : undefined,
        setupAccessTime: data.setupAccessTime || undefined,
        curfew: data.curfew || undefined,
        restrictions,
        contactName: data.contactName || undefined,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        notes: data.notes || undefined,
      })

      toast.success('Venue created successfully')
      router.push(`/dashboard/venues/${venue.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create venue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/venues"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Venues
        </Link>
        <h1 className="text-3xl font-display font-bold">Add New Venue</h1>
        <p className="text-gray-600 mt-1">Create a new venue for your events</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Grand Ballroom"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['indoor', 'outdoor', 'mixed'] as const).map((type) => {
                  const config = typeConfig[type]
                  const Icon = config.icon
                  return (
                    <label
                      key={type}
                      className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        venueType === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('type')}
                        value={type}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white mb-2`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{config.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  {...register('capacity')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timing & Restrictions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Timing & Restrictions
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setup Access Time
              </label>
              <input
                type="time"
                {...register('setupAccessTime')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">When vendors can start setup</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curfew
              </label>
              <input
                type="time"
                {...register('curfew')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">When event must end</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restrictions
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  {...register('restrictions')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="No open flames, No confetti, Noise limit after 10pm (comma-separated)"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Separate multiple restrictions with commas</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Venue Contact
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                {...register('contactName')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  {...register('contactEmail')}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.contactEmail ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="venue@example.com"
                />
              </div>
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  {...register('contactPhone')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Additional Notes
          </h2>

          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Additional information about the venue, parking, loading dock access, etc..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/venues"
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Venue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
