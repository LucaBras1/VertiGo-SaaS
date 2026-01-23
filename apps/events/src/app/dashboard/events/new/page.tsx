'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Music
} from 'lucide-react'
import Link from 'next/link'

type EventFormData = {
  name: string
  type: string
  date: string
  startTime: string
  endTime: string
  venueId: string
  clientId: string
  guestCount: string
  budget: string
  description: string
  performers: string[]
  status: string
}

const EVENT_TYPES = [
  'Corporate',
  'Gala',
  'Festival',
  'Product Launch',
  'Conference',
  'Wedding',
  'Birthday Party',
  'Networking Event',
  'Concert',
  'Other'
]

const MOCK_VENUES = [
  { id: '1', name: 'Grand Hotel Ballroom', capacity: 500 },
  { id: '2', name: 'Riverside Park', capacity: 1000 },
  { id: '3', name: 'Convention Center', capacity: 2000 },
  { id: '4', name: 'Innovation Hub', capacity: 300 },
]

const MOCK_CLIENTS = [
  { id: '1', name: 'Tech Solutions Inc.', contact: 'Sarah Johnson' },
  { id: '2', name: 'Global Marketing Corp', contact: 'Michael Chen' },
  { id: '3', name: 'StartUp Ventures', contact: 'Emily Rodriguez' },
  { id: '4', name: 'Healthcare Alliance', contact: 'Dr. James Wilson' },
]

const MOCK_PERFORMERS = [
  { id: '1', name: 'Fire Phoenix', type: 'Fire' },
  { id: '2', name: 'Alex Wonder', type: 'Magic' },
  { id: '3', name: 'Aerial Silk Duo', type: 'Circus' },
  { id: '4', name: 'DJ Rhythm', type: 'Music' },
]

export default function NewEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedVenue = searchParams.get('venue')
  const preselectedClient = searchParams.get('client')

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'Corporate',
    date: '',
    startTime: '',
    endTime: '',
    venueId: preselectedVenue || '',
    clientId: preselectedClient || '',
    guestCount: '',
    budget: '',
    description: '',
    performers: [],
    status: 'planning'
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addPerformer = (performerId: string) => {
    if (!formData.performers.includes(performerId)) {
      setFormData(prev => ({
        ...prev,
        performers: [...prev.performers, performerId]
      }))
    }
  }

  const removePerformer = (performerId: string) => {
    setFormData(prev => ({
      ...prev,
      performers: prev.performers.filter(id => id !== performerId)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    console.log('Event data:', formData)
    router.push('/dashboard/events')
  }

  const selectedVenue = MOCK_VENUES.find(v => v.id === formData.venueId)
  const selectedClient = MOCK_CLIENTS.find(c => c.id === formData.clientId)
  const budgetEstimate = formData.performers.length * 600 + 2000

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/events" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="e.g., Tech Summit 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="input"
                  required
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input"
                >
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
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

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Venue *
                </label>
                <select
                  value={formData.venueId}
                  onChange={(e) => handleInputChange('venueId', e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a venue</option>
                  {MOCK_VENUES.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} (Capacity: {venue.capacity})
                    </option>
                  ))}
                </select>
                {selectedVenue && (
                  <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm font-semibold text-primary-900">{selectedVenue.name}</p>
                    <p className="text-xs text-primary-700">Capacity: {selectedVenue.capacity} guests</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UserCircle2 className="w-4 h-4 inline mr-1" />
                  Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a client</option>
                  {MOCK_CLIENTS.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.contact}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">{selectedClient.name}</p>
                    <p className="text-xs text-green-700">Contact: {selectedClient.contact}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Expected Guest Count *
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => handleInputChange('guestCount', e.target.value)}
                  className="input"
                  placeholder="e.g., 200"
                  min="1"
                  required
                />
                {selectedVenue && formData.guestCount && parseInt(formData.guestCount) > selectedVenue.capacity && (
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
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="input"
                  placeholder="e.g., 15000"
                  min="0"
                />
              </div>
            </div>
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

              <div className="grid md:grid-cols-2 gap-4">
                {MOCK_PERFORMERS.map(performer => {
                  const isSelected = formData.performers.includes(performer.id)
                  return (
                    <div
                      key={performer.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => isSelected ? removePerformer(performer.id) : addPerformer(performer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{performer.name}</p>
                          <p className="text-sm text-gray-600">{performer.type}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <Plus className="w-4 h-4 text-white rotate-45" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {formData.performers.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Selected Performers ({formData.performers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.performers.map(performerId => {
                      const performer = MOCK_PERFORMERS.find(p => p.id === performerId)
                      return (
                        <span
                          key={performerId}
                          className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{performer?.name}</span>
                          <button
                            type="button"
                            onClick={() => removePerformer(performerId)}
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
                  <p className="text-primary-100 text-sm mb-1">Performers ({formData.performers.length})</p>
                  <p className="text-3xl font-bold">${formData.performers.length * 600}</p>
                </div>
                <div>
                  <p className="text-primary-100 text-sm mb-1">Total Estimate</p>
                  <p className="text-3xl font-bold">${budgetEstimate.toLocaleString()}</p>
                </div>
              </div>
              {formData.budget && parseInt(formData.budget) < budgetEstimate && (
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
              <button type="submit" className="btn-primary inline-flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Create Event
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
