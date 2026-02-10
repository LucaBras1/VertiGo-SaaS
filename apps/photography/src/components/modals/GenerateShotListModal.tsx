'use client'

import { useState } from 'react'
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

interface GenerateShotListModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerated: (shotList: ShotListResult) => void
  packageId?: string
  eventType?: string
  eventDate?: string
  venue?: string
}

interface ShotListResult {
  name: string
  categories: {
    name: string
    shots: {
      title: string
      description: string
      priority: 'must_have' | 'nice_to_have' | 'creative'
      timeSlot?: string
    }[]
  }[]
  totalShots: number
}

type Step = 'form' | 'generating' | 'preview' | 'error'

export function GenerateShotListModal({
  isOpen,
  onClose,
  onGenerated,
  packageId,
  eventType: initialEventType,
  eventDate: initialEventDate,
  venue: initialVenue
}: GenerateShotListModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [eventType, setEventType] = useState(initialEventType || 'wedding')
  const [eventDate, setEventDate] = useState(initialEventDate || '')
  const [venue, setVenue] = useState(initialVenue || '')
  const [guestCount, setGuestCount] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [result, setResult] = useState<ShotListResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setStep('generating')
    setError(null)

    try {
      const response = await fetch('/api/ai/shot-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventDate,
          venue,
          guestCount: guestCount ? parseInt(guestCount) : undefined,
          specialRequests: specialRequests || undefined,
          packageId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate shot list')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data.data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('error')
    }
  }

  const handleUse = () => {
    if (result) {
      onGenerated(result)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep('form')
    setResult(null)
    setError(null)
    onClose()
  }

  const handleRetry = () => {
    setStep('form')
    setError(null)
  }

  return (
    <Modal open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleClose() }}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>AI Shot List Generator</ModalTitle>
          </ModalHeader>
          <ModalBody>
      {step === 'form' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI-Powered Generation</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Describe your event and we'll create a comprehensive shot list tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement Session</option>
                <option value="portrait">Portrait Session</option>
                <option value="family">Family Session</option>
                <option value="corporate">Corporate Event</option>
                <option value="product">Product Photography</option>
                <option value="newborn">Newborn Session</option>
                <option value="maternity">Maternity Session</option>
                <option value="event">Event Coverage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date
              </label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue / Location
            </label>
            <Input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Outdoor garden, Church ceremony + Ballroom reception"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Count
            </label>
            <Input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="Approximate number of guests"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests or Details
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any specific shots, people to include, cultural traditions, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Shot List
            </Button>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Generating Your Shot List</h3>
          <p className="text-gray-600 mt-2">
            Our AI is crafting a comprehensive shot list for your {eventType}...
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Shot list generated successfully!</span>
          </div>

          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {result.categories.map((category, idx) => (
              <div key={idx} className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">{category.name}</h4>
                <ul className="space-y-2">
                  {category.shots.slice(0, 5).map((shot, shotIdx) => (
                    <li key={shotIdx} className="flex items-start gap-2 text-sm">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                        shot.priority === 'must_have'
                          ? 'bg-red-100 text-red-700'
                          : shot.priority === 'nice_to_have'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {shot.priority === 'must_have' ? '!' : shot.priority === 'nice_to_have' ? '+' : '*'}
                      </span>
                      <span className="text-gray-700">{shot.title}</span>
                    </li>
                  ))}
                  {category.shots.length > 5 && (
                    <li className="text-sm text-gray-500 pl-7">
                      +{category.shots.length - 5} more shots
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{result.totalShots}</span> total shots across{' '}
              <span className="font-medium">{result.categories.length}</span> categories
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleRetry}>
              Regenerate
            </Button>
            <Button onClick={handleUse}>
              Use This Shot List
            </Button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Generation Failed</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </ModalBody>
        </ModalContent>
      </Modal>
  )
}
