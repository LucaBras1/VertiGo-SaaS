'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  User,
  Sparkles,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Clock,
  FileText,
  Loader2,
  Save,
  Tag,
  Flame,
  Wand2,
  Music,
  Smile,
  Users,
} from 'lucide-react'
import { useCreatePerformer } from '@/hooks/use-performers'
import { useToast } from '@/hooks/use-toast'

const performerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stageName: z.string().optional(),
  type: z.enum(['fire', 'magic', 'circus', 'music', 'dance', 'comedy', 'interactive']),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  setupTime: z.string().optional(),
  performanceTime: z.string().optional(),
  breakdownTime: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  standardRate: z.string().optional(),
})

type PerformerFormData = z.infer<typeof performerSchema>

const performerTypes = [
  { value: 'fire', label: 'Fire', icon: Flame, color: 'from-orange-500 to-red-600' },
  { value: 'magic', label: 'Magic', icon: Wand2, color: 'from-purple-500 to-indigo-600' },
  { value: 'circus', label: 'Circus', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
  { value: 'music', label: 'Music', icon: Music, color: 'from-blue-500 to-cyan-600' },
  { value: 'dance', label: 'Dance', icon: Users, color: 'from-teal-500 to-green-600' },
  { value: 'comedy', label: 'Comedy', icon: Smile, color: 'from-yellow-500 to-orange-600' },
  { value: 'interactive', label: 'Interactive', icon: Users, color: 'from-violet-500 to-purple-600' },
] as const

export default function NewPerformerPage() {
  const router = useRouter()
  const toast = useToast()
  const createPerformer = useCreatePerformer()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PerformerFormData>({
    resolver: zodResolver(performerSchema),
    defaultValues: {
      type: 'fire',
      setupTime: '30',
      performanceTime: '30',
      breakdownTime: '15',
    },
  })

  const performerType = watch('type')
  const selectedTypeConfig = performerTypes.find((t) => t.value === performerType)

  const onSubmit = async (data: PerformerFormData) => {
    setIsSubmitting(true)
    try {
      const specialties = data.specialties
        ? data.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      const performer = await createPerformer.mutateAsync({
        name: data.name,
        stageName: data.stageName || undefined,
        type: data.type,
        bio: data.bio || undefined,
        specialties,
        setupTime: data.setupTime ? parseInt(data.setupTime, 10) : 30,
        performanceTime: data.performanceTime ? parseInt(data.performanceTime, 10) : 30,
        breakdownTime: data.breakdownTime ? parseInt(data.breakdownTime, 10) : 15,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        standardRate: data.standardRate ? parseFloat(data.standardRate) : undefined,
      })

      toast.success('Performer created successfully')
      router.push(`/dashboard/performers/${performer.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create performer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/performers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Performers
        </Link>
        <h1 className="text-3xl font-display font-bold">Add New Performer</h1>
        <p className="text-gray-600 mt-1">Create a new performer profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="John Smith"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage Name
              </label>
              <input
                type="text"
                {...register('stageName')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="The Amazing John"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performer Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {performerTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <label
                      key={type.value}
                      className={`relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        performerType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('type')}
                        value={type.value}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-1`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{type.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialties
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  {...register('specialties')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Fire breathing, Poi spinning, Staff (comma-separated)"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Professional performer with 10 years of experience..."
              />
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Timing Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setup Time (min)
              </label>
              <input
                type="number"
                {...register('setupTime')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performance Time (min)
              </label>
              <input
                type="number"
                {...register('performanceTime')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breakdown Time (min)
              </label>
              <input
                type="number"
                {...register('breakdownTime')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="15"
              />
            </div>
          </div>
        </div>

        {/* Contact & Rate */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary-600" />
            Contact & Rate
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="performer@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  {...register('website')}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.website ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="https://performer.com"
                />
              </div>
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Rate
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  {...register('standardRate')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="500.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/performers"
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
                Create Performer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
