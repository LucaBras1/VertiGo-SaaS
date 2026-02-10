'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, Card, CardHeader, CardTitle, Input } from '@vertigo/ui'

interface Package {
  id: string
  title: string
  eventType: string
  client: {
    name: string
  }
}

export default function NewShotListPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    packageId: '',
    name: '',
    eventType: 'wedding',
    useAI: true,
    // AI generation options
    startTime: '10:00',
    endTime: '22:00',
    venueType: 'mixed',
    brideGettingReady: true,
    groomGettingReady: true,
    firstLook: false,
    ceremony: true,
    reception: true,
    mustHaveShots: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const handleGenerateWithAI = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/shot-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: formData.eventType,
          startTime: formData.startTime,
          endTime: formData.endTime,
          venue: { type: formData.venueType },
          weddingDetails: formData.eventType === 'wedding' ? {
            brideGettingReady: formData.brideGettingReady,
            groomGettingReady: formData.groomGettingReady,
            firstLook: formData.firstLook,
            ceremony: formData.ceremony,
            reception: formData.reception
          } : undefined,
          mustHaveShots: formData.mustHaveShots ? formData.mustHaveShots.split('\n').filter(Boolean) : []
        })
      })

      if (!res.ok) throw new Error('Failed to generate shot list')

      const generatedData = await res.json()

      // Create the shot list with generated data
      const createRes = await fetch('/api/shot-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: formData.packageId || null,
          name: formData.name || `${formData.eventType} Shot List`,
          eventType: formData.eventType,
          aiGenerated: true,
          sections: generatedData.sections,
          totalShots: generatedData.summary.totalShots,
          mustHaveCount: generatedData.summary.mustHaveCount,
          estimatedTime: generatedData.summary.estimatedTime,
          equipmentList: generatedData.equipmentSuggestions,
          lightingPlan: generatedData.lightingPlan,
          backupPlans: generatedData.backupPlans
        })
      })

      if (!createRes.ok) throw new Error('Failed to save shot list')

      const savedList = await createRes.json()
      toast.success('Shot list generated successfully!')
      router.push(`/admin/shot-lists/${savedList.id}`)
    } catch (error) {
      toast.error('Failed to generate shot list')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.useAI) {
      await handleGenerateWithAI()
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/shot-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: formData.packageId || null,
          name: formData.name,
          eventType: formData.eventType,
          aiGenerated: false,
          sections: [],
          totalShots: 0,
          mustHaveCount: 0
        })
      })

      if (!res.ok) throw new Error('Failed to create shot list')

      const data = await res.json()
      toast.success('Shot list created!')
      router.push(`/admin/shot-lists/${data.id}`)
    } catch (error) {
      toast.error('Failed to create shot list')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/admin/shot-lists" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shot Lists
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Create Shot List</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Generate with AI or create manually</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Package (optional)</label>
              <select
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No package selected</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} - {pkg.client.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Shot List Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Smith Wedding Shot List"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="portrait">Portrait</option>
                <option value="family">Family</option>
                <option value="corporate">Corporate</option>
                <option value="product">Product</option>
                <option value="newborn">Newborn</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Generation Method */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Method</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center flex-1 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <input
                  type="radio"
                  checked={formData.useAI}
                  onChange={() => setFormData({ ...formData, useAI: true })}
                  className="mr-3"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">AI Generated</span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Let AI create a comprehensive shot list</p>
                </div>
              </label>

              <label className="flex items-center flex-1 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <input
                  type="radio"
                  checked={!formData.useAI}
                  onChange={() => setFormData({ ...formData, useAI: false })}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Manual</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Create from scratch</p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* AI Options */}
        {formData.useAI && (
          <Card>
            <CardHeader>
              <CardTitle>AI Generation Options</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
                <Input
                  type="time"
                  label="End Time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Venue Type</label>
                <select
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {formData.eventType === 'wedding' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Coverage</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'brideGettingReady', label: 'Bride Getting Ready' },
                      { key: 'groomGettingReady', label: 'Groom Getting Ready' },
                      { key: 'firstLook', label: 'First Look' },
                      { key: 'ceremony', label: 'Ceremony' },
                      { key: 'reception', label: 'Reception' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData[item.key as keyof typeof formData] as boolean}
                          onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                          className="mr-2 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Must-Have Shots</label>
                <textarea
                  value={formData.mustHaveShots}
                  onChange={(e) => setFormData({ ...formData, mustHaveShots: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="One shot per line..."
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter specific shots you don't want to miss</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={isLoading || isGenerating} disabled={isLoading || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : formData.useAI ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            ) : (
              'Create Shot List'
            )}
          </Button>
          <Link href="/admin/shot-lists">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
