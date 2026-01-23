'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Music, Clock, Users, Calendar, Loader2 } from 'lucide-react'

export default function GenerateSetlistPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    eventType: 'wedding' as const,
    duration: 180,
    numberOfSets: 2,
    breakDuration: 15,
    mood: 'mixed' as const,
    audienceAge: '25-45',
    venueType: 'indoor' as const,
    specialRequests: [] as string[],
  })

  // Mock repertoire - in real app, this would come from database
  const mockRepertoire = [
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', duration: 281, mood: 'romantic', bpm: 79, key: 'D' },
    { title: 'Uptown Funk', artist: 'Bruno Mars', duration: 270, mood: 'energetic', bpm: 115, key: 'Dm' },
    { title: 'Perfect', artist: 'Ed Sheeran', duration: 263, mood: 'romantic', bpm: 95, key: 'Ab' },
    { title: 'Shape of You', artist: 'Ed Sheeran', duration: 234, mood: 'party', bpm: 96, key: 'C#m' },
    { title: 'Can\'t Stop the Feeling', artist: 'Justin Timberlake', duration: 236, mood: 'party', bpm: 113, key: 'C' },
    { title: 'All of Me', artist: 'John Legend', duration: 269, mood: 'romantic', bpm: 120, key: 'Ab' },
    { title: 'Happy', artist: 'Pharrell Williams', duration: 232, mood: 'energetic', bpm: 160, key: 'F' },
    { title: 'Marry You', artist: 'Bruno Mars', duration: 230, mood: 'party', bpm: 144, key: 'F' },
    { title: 'A Thousand Years', artist: 'Christina Perri', duration: 285, mood: 'romantic', bpm: 108, key: 'Bb' },
    { title: 'Sugar', artist: 'Maroon 5', duration: 235, mood: 'energetic', bpm: 120, key: 'C#' },
  ]

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch('/api/ai/setlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          repertoire: mockRepertoire,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate setlist')
      }

      const result = await response.json()

      // In real app, save to database and redirect to detail page
      console.log('Generated setlist:', result.data)

      // For now, redirect to setlists list
      router.push('/dashboard/setlists')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate setlist')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary-600" />
          Generate AI Setlist
        </h1>
        <p className="text-gray-600 mt-2">
          Let AI create the perfect setlist for your event based on mood, duration, and your repertoire
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value as any })
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate Event</option>
              <option value="party">Private Party</option>
              <option value="concert">Concert</option>
              <option value="festival">Festival</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Total Duration (minutes)
              </label>
              <Input
                type="number"
                min="30"
                max="480"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Music className="w-4 h-4 inline mr-1" />
                Number of Sets
              </label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.numberOfSets}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfSets: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Mood
              </label>
              <select
                value={formData.mood}
                onChange={(e) =>
                  setFormData({ ...formData, mood: e.target.value as any })
                }
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="energetic">Energetic</option>
                <option value="romantic">Romantic</option>
                <option value="chill">Chill</option>
                <option value="party">Party</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Audience Age
              </label>
              <Input
                placeholder="e.g., 25-45"
                value={formData.audienceAge}
                onChange={(e) =>
                  setFormData({ ...formData, audienceAge: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type
            </label>
            <select
              value={formData.venueType}
              onChange={(e) =>
                setFormData({ ...formData, venueType: e.target.value as any })
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="club">Club</option>
              <option value="theater">Theater</option>
              <option value="restaurant">Restaurant</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Repertoire Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Your Repertoire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Using {mockRepertoire.length} songs from your repertoire
          </p>
          <div className="text-sm text-gray-500">
            Songs will be selected based on mood, tempo, and energy flow to create the perfect setlist.
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex-1"
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          className="flex-1"
          disabled={isGenerating}
          isLoading={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Setlist
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
