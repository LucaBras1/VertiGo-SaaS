'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, ListChecks, Camera, Clock,
  CheckCircle, Circle, Sparkles, Printer, Eye, Pencil
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ShotListEditor, ShotCategory } from '@/components/shot-lists/ShotListEditor'
import toast from 'react-hot-toast'

interface Shot {
  id: string
  description: string
  priority: 'must-have' | 'nice-to-have' | 'optional'
  subjects?: string[]
  technicalNotes?: string
  suggestedSettings?: {
    aperture?: string
    lens?: string
    lighting?: string
  }
  composition?: string
  timing?: string
}

interface Section {
  name: string
  timeSlot?: string
  location?: string
  shots: Shot[]
  notes?: string
}

interface ShotList {
  id: string
  name: string
  status: 'DRAFT' | 'FINALIZED' | 'COMPLETED'
  eventType: string
  aiGenerated: boolean
  sections: Section[]
  totalShots: number
  mustHaveCount: number
  estimatedTime: number | null
  equipmentList: Array<{ item: string; reason: string }> | null
  lightingPlan: { naturalLight: string[]; flashRequired: string[]; goldenHour?: string } | null
  backupPlans: Array<{ scenario: string; solution: string }> | null
  createdAt: string
  package: {
    id: string
    title: string
    client: {
      name: string
    }
  } | null
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'gray' as const },
  FINALIZED: { label: 'Finalized', color: 'blue' as const },
  COMPLETED: { label: 'Completed', color: 'green' as const }
}

const priorityConfig = {
  'must-have': { label: 'Must Have', color: 'red' as const },
  'nice-to-have': { label: 'Nice to Have', color: 'yellow' as const },
  'optional': { label: 'Optional', color: 'gray' as const }
}

// Color mapping for categories
const categoryColors: Record<string, string> = {
  'getting-ready': 'bg-pink-500',
  'přípravy': 'bg-pink-500',
  'ceremony': 'bg-purple-500',
  'obřad': 'bg-purple-500',
  'portraits': 'bg-blue-500',
  'portréty': 'bg-blue-500',
  'reception': 'bg-green-500',
  'hostina': 'bg-green-500',
  'details': 'bg-amber-500',
  'detaily': 'bg-amber-500'
}

// Convert API Section format to Editor ShotCategory format
function sectionsToCategories(sections: Section[]): ShotCategory[] {
  return sections.map((section, idx) => ({
    id: `section-${idx}`,
    name: section.name,
    color: categoryColors[section.name.toLowerCase()] || 'bg-neutral-50 dark:bg-neutral-8000',
    items: section.shots.map(shot => ({
      id: shot.id,
      title: shot.description,
      description: shot.technicalNotes || '',
      priority: shot.priority === 'optional' ? 'creative' as const : shot.priority === 'must-have' ? 'must-have' as const : 'nice-to-have' as const,
      timeSlot: shot.timing || section.timeSlot || '',
      notes: shot.composition || ''
    }))
  }))
}

// Convert Editor ShotCategory format back to API Section format
function categoriesToSections(categories: ShotCategory[]): Section[] {
  return categories.map(cat => ({
    name: cat.name,
    shots: cat.items.map(item => ({
      id: item.id,
      description: item.title,
      priority: item.priority === 'creative' ? 'optional' as const : item.priority as 'must-have' | 'nice-to-have',
      technicalNotes: item.description,
      timing: item.timeSlot,
      composition: item.notes
    }))
  }))
}

export default function ShotListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shotList, setShotList] = useState<ShotList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [completedShots, setCompletedShots] = useState<Set<string>>(new Set())
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    fetchShotList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchShotList = async () => {
    try {
      const res = await fetch(`/api/shot-lists/${params.id}`)
      if (!res.ok) throw new Error('Shot list not found')
      const data = await res.json()
      setShotList(data)
    } catch (error) {
      console.error('Failed to fetch shot list:', error)
      toast.error('Shot list not found')
      router.push('/admin/shot-lists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!shotList) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/shot-lists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setShotList({ ...shotList, status: newStatus as ShotList['status'] })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/shot-lists/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete shot list')
      toast.success('Shot list deleted')
      router.push('/admin/shot-lists')
    } catch (error) {
      toast.error('Failed to delete shot list')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const toggleShot = (shotId: string) => {
    setCompletedShots(prev => {
      const newSet = new Set(prev)
      if (newSet.has(shotId)) {
        newSet.delete(shotId)
      } else {
        newSet.add(shotId)
      }
      return newSet
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSaveEdits = useCallback(async (categories: ShotCategory[]) => {
    if (!shotList) return

    const sections = categoriesToSections(categories)
    const totalShots = sections.reduce((sum, s) => sum + s.shots.length, 0)
    const mustHaveCount = sections.reduce(
      (sum, s) => sum + s.shots.filter(shot => shot.priority === 'must-have').length,
      0
    )

    try {
      const res = await fetch(`/api/shot-lists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          totalShots,
          mustHaveCount
        })
      })

      if (!res.ok) throw new Error('Failed to save changes')

      const updated = await res.json()
      setShotList(prev => prev ? { ...prev, sections, totalShots, mustHaveCount } : null)
      toast.success('Changes saved')
    } catch (error) {
      toast.error('Failed to save changes')
      throw error
    }
  }, [shotList, params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!shotList) return null

  const completedCount = completedShots.size
  const progress = shotList.totalShots > 0 ? (completedCount / shotList.totalShots) * 100 : 0

  // Edit Mode View
  if (isEditMode) {
    const categories = sectionsToCategories(shotList.sections)

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => setIsEditMode(false)}
              className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to View Mode
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{shotList.name}</h1>
              <Badge variant="info">
                <Pencil className="w-3 h-3 mr-1" />
                Edit Mode
              </Badge>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {shotList.package?.client.name || 'Unassigned'} &bull; {shotList.eventType}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setIsEditMode(false)}>
            <Eye className="w-4 h-4 mr-2" />
            View Mode
          </Button>
        </div>

        {/* Editor */}
        <ShotListEditor
          initialCategories={categories}
          onSave={handleSaveEdits}
        />
      </div>
    )
  }

  // View Mode (Original)
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link href="/admin/shot-lists" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shot Lists
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{shotList.name}</h1>
            <Badge variant={statusConfig[shotList.status].color}>
              {statusConfig[shotList.status].label}
            </Badge>
            {shotList.aiGenerated && (
              <Badge variant="info">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {shotList.package?.client.name || 'Unassigned'} &bull; {shotList.eventType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsEditMode(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Shots
          </Button>
          <Link href={`/admin/shot-lists/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Info
            </Button>
          </Link>
          <Button variant="ghost" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{shotList.name}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{shotList.package?.client.name} &bull; {shotList.eventType}</p>
      </div>

      {/* Status & Progress */}
      <Card className="p-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Status:</span>
            <select
              value={shotList.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="FINALIZED">Finalized</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{completedCount}</span>
              <span className="text-neutral-500 dark:text-neutral-400"> / {shotList.totalShots} shots completed</span>
            </div>
            <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{shotList.totalShots}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Shots</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{shotList.mustHaveCount}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Must Have</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {shotList.estimatedTime ? Math.round(shotList.estimatedTime / 60) : '-'}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Est. Hours</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{shotList.sections.length}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Sections</p>
        </Card>
      </div>

      {/* Shot List Sections */}
      <div className="space-y-6">
        {shotList.sections.map((section, sectionIdx) => (
          <Card key={sectionIdx} className="print:break-inside-avoid">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{section.name}</CardTitle>
                  {section.timeSlot && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {section.timeSlot}
                    </p>
                  )}
                </div>
                <Badge variant="default">{section.shots.length} shots</Badge>
              </div>
            </CardHeader>

            <div className="space-y-2">
              {section.shots.map((shot) => (
                <div
                  key={shot.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    completedShots.has(shot.id) ? 'bg-green-50 border-green-200' : 'hover:bg-neutral-50 dark:bg-neutral-800'
                  }`}
                  onClick={() => toggleShot(shot.id)}
                >
                  <div className="pt-0.5 print:hidden">
                    {completedShots.has(shot.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="hidden print:block w-4 h-4 border border-gray-400 rounded" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium ${completedShots.has(shot.id) ? 'line-through text-neutral-500 dark:text-neutral-400' : ''}`}>
                        {shot.description}
                      </p>
                      <Badge variant={priorityConfig[shot.priority].color} size="sm">
                        {priorityConfig[shot.priority].label}
                      </Badge>
                    </div>
                    {shot.technicalNotes && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{shot.technicalNotes}</p>
                    )}
                    {shot.suggestedSettings && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {shot.suggestedSettings.aperture && (
                          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                            {shot.suggestedSettings.aperture}
                          </span>
                        )}
                        {shot.suggestedSettings.lens && (
                          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                            {shot.suggestedSettings.lens}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {section.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-800">{section.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Equipment & Tips */}
      {(shotList.equipmentList || shotList.lightingPlan || shotList.backupPlans) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3">
          {shotList.equipmentList && shotList.equipmentList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {shotList.equipmentList.map((item, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="font-medium">{item.item}</span>
                    <span className="text-neutral-500 dark:text-neutral-400"> - {item.reason}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {shotList.lightingPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Lighting Plan</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-sm">
                {shotList.lightingPlan.naturalLight.length > 0 && (
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Natural Light:</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{shotList.lightingPlan.naturalLight.join(', ')}</p>
                  </div>
                )}
                {shotList.lightingPlan.flashRequired.length > 0 && (
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Flash Required:</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{shotList.lightingPlan.flashRequired.join(', ')}</p>
                  </div>
                )}
                {shotList.lightingPlan.goldenHour && (
                  <div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Golden Hour:</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{shotList.lightingPlan.goldenHour}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {shotList.backupPlans && shotList.backupPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Backup Plans</CardTitle>
              </CardHeader>
              <ul className="space-y-3">
                {shotList.backupPlans.map((plan, idx) => (
                  <li key={idx} className="text-sm">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">{plan.scenario}</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{plan.solution}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Shot List">
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete "{shotList.name}"?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Shot List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
