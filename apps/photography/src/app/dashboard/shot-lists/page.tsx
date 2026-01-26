'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, ListChecks, FileText, CheckCircle, Sparkles, Clock, Edit } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { GenerateShotListModal } from '@/components/modals'

interface ShotList {
  id: string
  name: string
  status: 'DRAFT' | 'FINALIZED' | 'COMPLETED'
  eventType: string
  aiGenerated: boolean
  totalShots: number
  mustHaveCount: number
  estimatedTime: number | null
  createdAt: string
  package: {
    title: string
    client: {
      name: string
    }
  } | null
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'gray' as const, icon: Edit },
  FINALIZED: { label: 'Finalized', color: 'blue' as const, icon: FileText },
  COMPLETED: { label: 'Completed', color: 'green' as const, icon: CheckCircle }
}

export default function ShotListsPage() {
  const router = useRouter()
  const [shotLists, setShotLists] = useState<ShotList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchShotLists()
  }, [])

  const fetchShotLists = async () => {
    try {
      const res = await fetch('/api/shot-lists')
      const data = await res.json()
      setShotLists(data)
    } catch (error) {
      console.error('Failed to fetch shot lists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredShotLists = shotLists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.package?.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGenerated = async (result: {
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
  }) => {
    setIsCreating(true)
    try {
      // Transform categories to sections format expected by the API
      const sections = result.categories.map(category => ({
        name: category.name,
        shots: category.shots.map(shot => ({
          title: shot.title,
          description: shot.description,
          priority: shot.priority,
          timeSlot: shot.timeSlot
        }))
      }))

      // Count must-have shots
      const mustHaveCount = result.categories.reduce(
        (count, category) =>
          count + category.shots.filter(shot => shot.priority === 'must_have').length,
        0
      )

      // Determine event type from first category name or default
      const eventType = result.categories[0]?.name.toLowerCase().includes('wedding')
        ? 'wedding'
        : result.categories[0]?.name.toLowerCase().includes('portrait')
        ? 'portrait'
        : 'event'

      const response = await fetch('/api/shot-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          eventType,
          sections,
          totalShots: result.totalShots,
          mustHaveCount,
          aiGenerated: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create shot list')
      }

      const newShotList = await response.json()
      router.push(`/dashboard/shot-lists/${newShotList.id}`)
    } catch (error) {
      console.error('Failed to create shot list:', error)
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shot Lists</h1>
          <p className="text-gray-600 mt-1">Organize your shots for every session</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGenerateModal(true)} disabled={isCreating}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Link href="/dashboard/shot-lists/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Shot List
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shot lists..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Shot Lists */}
      {filteredShotLists.length === 0 ? (
        <Card className="p-12 text-center">
          <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shot lists yet</h3>
          <p className="text-gray-600 mb-4">Create your first shot list or let AI generate one for you</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowGenerateModal(true)} disabled={isCreating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
            <Link href="/dashboard/shot-lists/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Manually
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShotLists.map(list => {
            const StatusIcon = statusConfig[list.status].icon
            return (
              <Link key={list.id} href={`/dashboard/shot-lists/${list.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <ListChecks className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{list.name}</h3>
                          {list.aiGenerated && (
                            <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {list.package?.client?.name || 'Unassigned'} &bull; {list.eventType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{list.totalShots} shots</p>
                        <p className="text-xs text-gray-500">{list.mustHaveCount} must-have</p>
                      </div>

                      {list.estimatedTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 hidden md:flex">
                          <Clock className="w-4 h-4" />
                          {Math.round(list.estimatedTime / 60)}h
                        </div>
                      )}

                      <Badge variant={statusConfig[list.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[list.status].label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <GenerateShotListModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={handleGenerated}
      />
    </div>
  )
}
