'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Save,
  ArrowLeft,
  Plus,
  X,
  UserCircle2,
  Building2,
  Music,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useCreateEvent, type EventType } from '@/hooks/use-events'
import { useVenues } from '@/hooks/use-venues'
import { useClients } from '@/hooks/use-clients'
import { usePerformers } from '@/hooks/use-performers'
import { useToast } from '@/hooks/use-toast'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'gala', label: 'Gala' },
  { value: 'festival', label: 'Festival' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'private_party', label: 'Private Party' },
  { value: 'concert', label: 'Concert' },
]

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  type: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'gala', 'concert', 'product_launch']),
  date: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venueId: z.string().optional(),
  clientId: z.string().optional(),
  guestCount: z.string().optional(),
  budget: z.string().optional(),
  description: z.string().optional(),
})

type EventFormData = z.infer<typeof eventSchema>

function NewEventContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const preselectedVenue = searchParams.get('venue')
  const preselectedClient = searchParams.get('client')

  const createEvent = useCreateEvent()
  const { data: venues = [], isLoading: venuesLoading } = useVenues()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: performers = [], isLoading: performersLoading } = usePerformers()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPerformers, setSelectedPerformers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 3

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'corporate',
      venueId: preselectedVenue || '',
      clientId: preselectedClient || '',
    },
  })

  const watchedVenueId = watch('venueId')
  const watchedClientId = watch('clientId')
  const watchedGuestCount = watch('guestCount')
  const watchedBudget = watch('budget')

  const selectedVenue = venues.find((v) => v.id === watchedVenueId)
  const selectedClient = clients.find((c) => c.id === watchedClientId)
  const budgetEstimate = selectedPerformers.length * 600 + 2000

  const addPerformer = (performerId: string) => {
    if (!selectedPerformers.includes(performerId)) {
      setSelectedPerformers((prev) => [...prev, performerId])
    }
  }

  const removePerformer = (performerId: string) => {
    setSelectedPerformers((prev) => prev.filter((id) => id !== performerId))
  }

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      const event = await createEvent.mutateAsync({
        name: data.name,
        type: data.type,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        venueId: data.venueId || undefined,
        clientId: data.clientId || undefined,
        guestCount: data.guestCount ? parseInt(data.guestCount) : undefined,
        totalBudget: data.budget ? parseFloat(data.budget) : undefined,
        description: data.description || undefined,
      })

      toast.success('Event created successfully')
      router.push(`/admin/events/${event.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = venuesLoading || clientsLoading || performersLoading

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/events" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Create New Event</h1>
            <p className="text-gray-600">Fill in the details to plan your next event</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex items-center space-x-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${step <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Venue & Client'}
                    {step === 3 && 'Performers & Budget'}
                  </p>
                </div>
              </div>
              {step < totalSteps && (
                <div className={`h-1 flex-1 mx-4 rounded ${step < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="card space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span>Basic Information</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Tech Summit 2024"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select {...register('type')} className="input">
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className={`input ${errors.date ? 'border-red-500' : ''}`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('startTime')}
                    className={`input ${errors.startTime ? 'border-red-500' : ''}`}
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('endTime')}
                    className={`input ${errors.endTime ? 'border-red-500' : ''}`}
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe the event, special requirements, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Venue & Client */}
        {currentStep === 2 && (
          <div className="card space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span>Venue & Client Selection</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Venue
                  </label>
                  <select {...register('venueId')} className="input">
                    <option value="">Select a venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} {venue.capacity ? `(Capacity: ${venue.capacity})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedVenue && (
                    <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                      <p className="text-sm font-semibold text-primary-900">{selectedVenue.name}</p>
                      {selectedVenue.capacity && (
                        <p className="text-xs text-primary-700">Capacity: {selectedVenue.capacity} guests</p>
                      )}
                      {selectedVenue.city && (
                        <p className="text-xs text-primary-700">{selectedVenue.city}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <UserCircle2 className="w-4 h-4 inline mr-1" />
                    Client
                  </label>
                  <select {...register('clientId')} className="input">
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `- ${client.company}` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedClient && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-900">{selectedClient.name}</p>
                      {selectedClient.company && (
                        <p className="text-xs text-green-700">{selectedClient.company}</p>
                      )}
                      {selectedClient.email && (
                        <p className="text-xs text-green-700">{selectedClient.email}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Expected Guest Count
                  </label>
                  <input
                    type="number"
                    {...register('guestCount')}
                    className="input"
                    placeholder="e.g., 200"
                    min="1"
                  />
                  {selectedVenue?.capacity && watchedGuestCount && parseInt(watchedGuestCount) > selectedVenue.capacity && (
                    <p className="text-sm text-red-600 mt-2">
                      Warning: Guest count exceeds venue capacity
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget
                  </label>
                  <input
                    type="number"
                    {...register('budget')}
                    className="input"
                    placeholder="e.g., 15000"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Performers & Budget */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Music className="w-5 h-5 text-primary-600" />
                  <span>Select Performers</span>
                </h2>
              </div>

              {performersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : performers.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No performers available</p>
                  <Link href="/admin/performers/new" className="text-primary-600 hover:text-primary-700 font-medium">
                    Add your first performer
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {performers.map((performer) => {
                    const isSelected = selectedPerformers.includes(performer.id)
                    return (
                      <div
                        key={performer.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => (isSelected ? removePerformer(performer.id) : addPerformer(performer.id))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {performer.stageName || performer.name}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">{performer.type}</p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Plus className="w-4 h-4 text-white rotate-45" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedPerformers.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Selected Performers ({selectedPerformers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerformers.map((performerId) => {
                      const performer = performers.find((p) => p.id === performerId)
                      return (
                        <span
                          key={performerId}
                          className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{performer?.stageName || performer?.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removePerformer(performerId)
                            }}
                            className="hover:bg-primary-700 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Estimate */}
            <div className="card bg-gradient-to-br from-primary-600 to-accent-500 text-white">
              <h3 className="text-xl font-semibold mb-4">Budget Estimate</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Venue & Setup</p>
                  <p className="text-3xl font-bold">$2,000</p>
                </div>
                <div>
                  <p className="text-primary-100 text-sm mb-1">Performers ({selectedPerformers.length})</p>
                  <p className="text-3xl font-bold">${selectedPerformers.length * 600}</p>
                </div>
                <div>
                  <p className="text-primary-100 text-sm mb-1">Total Estimate</p>
                  <p className="text-3xl font-bold">${budgetEstimate.toLocaleString()}</p>
                </div>
              </div>
              {watchedBudget && parseInt(watchedBudget) < budgetEstimate && (
                <p className="mt-4 text-yellow-200 text-sm">
                  Note: Your budget is lower than the estimated cost
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="card">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="btn-primary inline-flex items-center"
              >
                Next
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      <div className="h-20 bg-gray-200 rounded"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  )
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewEventContent />
    </Suspense>
  )
}
