'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

interface AIGalleryCurationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (result: CurationResult) => void
  galleryId: string
  images: {
    id: string
    url: string
    filename: string
  }[]
  eventType: string
}

interface CurationResult {
  selected: {
    imageId: string
    score: number
    category: string
    isHighlight: boolean
  }[]
  rejected: {
    imageId: string
    reason: string
  }[]
  summary: {
    totalImages: number
    selectedCount: number
    highlightCount: number
    averageQualityScore: number
  }
  recommendations: string[]
}

type Step = 'config' | 'processing' | 'review' | 'error'

export function AIGalleryCurationModal({
  isOpen,
  onClose,
  onComplete,
  galleryId,
  images,
  eventType
}: AIGalleryCurationModalProps) {
  const [step, setStep] = useState<Step>('config')
  const [targetPercentage, setTargetPercentage] = useState(20)
  const [prioritizeEmotions, setPrioritizeEmotions] = useState(true)
  const [result, setResult] = useState<CurationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (step === 'processing') {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 95))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleStartCuration = async () => {
    setStep('processing')
    setProgress(0)
    setError(null)

    try {
      const response = await fetch('/api/ai/gallery/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            filename: img.filename
          })),
          eventType,
          preferences: {
            selectionPercentage: targetPercentage,
            prioritizeEmotions,
            includeVariety: true
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to curate gallery')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Curation failed')
      }

      setProgress(100)
      setResult(data.data)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('error')
    }
  }

  const handleApply = () => {
    if (result) {
      onComplete(result)
      handleClose()
    }
  }

  const handleClose = () => {
    setStep('config')
    setResult(null)
    setError(null)
    setProgress(0)
    onClose()
  }

  const handleRetry = () => {
    setStep('config')
    setError(null)
  }

  return (
    <Modal open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleClose() }}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>AI Gallery Curation</ModalTitle>
          </ModalHeader>
          <ModalBody>
      {step === 'config' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-800">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI-Powered Photo Selection</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              Our AI will analyze {images.length} photos and select the best ones based on
              technical quality and emotional impact.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selection Target: {targetPercentage}% ({Math.ceil(images.length * targetPercentage / 100)} photos)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10% (tight selection)</span>
              <span>50% (loose selection)</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Curation Priority
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="priority"
                  checked={prioritizeEmotions}
                  onChange={() => setPrioritizeEmotions(true)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Emotional Impact</p>
                  <p className="text-sm text-gray-500">Prioritize genuine emotions and storytelling moments</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="priority"
                  checked={!prioritizeEmotions}
                  onChange={() => setPrioritizeEmotions(false)}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <p className="font-medium text-gray-900">Technical Quality</p>
                  <p className="text-sm text-gray-500">Prioritize sharpness, exposure, and composition</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What AI will analyze:</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Focus & sharpness
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Exposure & lighting
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Composition
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Facial expressions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Duplicate detection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Category coverage
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleStartCuration}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start AI Curation
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analyzing Your Photos</h3>
          <p className="text-gray-600 mt-2">
            Processing {images.length} images with AI vision analysis...
          </p>
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>Analyzing technical quality...</p>
            <p>Detecting facial expressions...</p>
            <p>Categorizing moments...</p>
          </div>
        </div>
      )}

      {step === 'review' && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Curation complete!</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{result.summary.selectedCount}</p>
              <p className="text-sm text-blue-600">Selected</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-amber-700">{result.summary.highlightCount}</p>
              <p className="text-sm text-amber-600">Highlights</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <ThumbsDown className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-700">{result.rejected.length}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Highlight Photos
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {result.selected.filter(s => s.isHighlight).slice(0, 8).map((photo, idx) => {
                const image = images.find(i => i.id === photo.imageId)
                return (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
                  >
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      {photo.score}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {result.recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleRetry}>
              Re-analyze
            </Button>
            <Button onClick={handleApply}>
              Apply Selection
            </Button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Curation Failed</h3>
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
