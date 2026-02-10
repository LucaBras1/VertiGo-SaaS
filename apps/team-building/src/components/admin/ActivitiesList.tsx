/**
 * Activities List Component
 * Client-side component with filters, search and delete functionality
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { formatDuration, getObjectiveLabel, getPhysicalLevelLabel } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge, ListPageHeader, SearchFilterBar, ActionButtons } from '@vertigo/admin'
import { staggerContainer, staggerItem, hoverLift } from '@vertigo/ui'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  title: string
  excerpt: string | null
  status: string
  featured: boolean
  duration: number
  minParticipants: number | null
  maxParticipants: number | null
  physicalDemand: string | null
  indoorOutdoor: string | null
  objectives: string[] | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  programLinks: { program: { title: string } }[]
  _count: { programLinks: number; orderItems: number }
}

interface ActivitiesListProps {
  initialActivities: Activity[]
}

export function ActivitiesList({ initialActivities }: ActivitiesListProps) {
  const router = useRouter()
  const [activities, setActivities] = useState(initialActivities)
  const [statusFilter, setStatusFilter] = useState('')
  const [physicalLevelFilter, setPhysicalLevelFilter] = useState('')
  const [indoorOutdoorFilter, setIndoorOutdoorFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; activity: Activity | null }>({
    isOpen: false,
    activity: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredActivities = activities.filter((activity) => {
    const matchesStatus = !statusFilter || activity.status === statusFilter
    const matchesPhysicalLevel = !physicalLevelFilter || activity.physicalDemand === physicalLevelFilter
    const matchesIndoorOutdoor = !indoorOutdoorFilter || activity.indoorOutdoor === indoorOutdoorFilter
    const matchesSearch =
      !searchQuery ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesPhysicalLevel && matchesIndoorOutdoor && matchesSearch
  })

  const handleDelete = async () => {
    if (!deleteDialog.activity) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/activities/${deleteDialog.activity.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepoda\u0159ilo se smazat aktivitu')
      }

      setActivities(activities.filter((a) => a.id !== deleteDialog.activity!.id))
      toast.success('Aktivita byla \u00fasp\u011b\u0161n\u011b smaz\u00e1na')
      setDeleteDialog({ isOpen: false, activity: null })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba p\u0159i maz\u00e1n\u00ed aktivity')
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = {
    total: activities.length,
    active: activities.filter((a) => a.status === 'active').length,
    inPrograms: activities.reduce((sum, a) => sum + a._count.programLinks, 0),
    featured: activities.filter((a) => a.featured).length,
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Activities"
        description="Manage your team building activities catalog"
        actionLabel="Add Activity"
        actionHref="/admin/activities/new"
        actionIcon={Plus}
      />

      {/* Stats */}
      {activities.length > 0 && (
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Total', value: stats.total, color: 'text-brand-600' },
            { label: 'Active', value: stats.active, color: 'text-success-600' },
            { label: 'In Programs', value: stats.inPrograms, color: 'text-violet-600' },
            { label: 'Featured', value: stats.featured, color: 'text-amber-600' },
          ].map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <Card className="py-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search activities..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Draft', value: 'draft' },
            ],
            onChange: setStatusFilter,
          },
          {
            label: 'Physical',
            value: physicalLevelFilter,
            options: [
              { label: 'All Levels', value: '' },
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ],
            onChange: setPhysicalLevelFilter,
          },
          {
            label: 'Location',
            value: indoorOutdoorFilter,
            options: [
              { label: 'All Locations', value: '' },
              { label: 'Indoor', value: 'INDOOR' },
              { label: 'Outdoor', value: 'OUTDOOR' },
              { label: 'Both', value: 'BOTH' },
              { label: 'Flexible', value: 'FLEXIBLE' },
            ],
            onChange: setIndoorOutdoorFilter,
          },
        ]}
      />

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {searchQuery || statusFilter || physicalLevelFilter || indoorOutdoorFilter
              ? 'No activities match your filters.'
              : 'No activities found. Add your first activity to get started.'}
          </p>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredActivities.map((activity) => (
            <motion.div key={activity.id} variants={staggerItem}>
              <motion.div {...hoverLift}>
                <Card className="group overflow-hidden p-0">
                  {/* Image */}
                  {activity.featuredImageUrl ? (
                    <img
                      src={activity.featuredImageUrl}
                      alt={activity.featuredImageAlt || activity.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30">
                      <span className="text-4xl font-bold text-neutral-300 dark:text-neutral-600">
                        {activity.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 p-5">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {activity.title}
                      </h3>
                      <StatusBadge status={activity.status} />
                    </div>

                    {activity.excerpt && (
                      <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{activity.excerpt}</p>
                    )}

                    {/* Objectives */}
                    {activity.objectives && activity.objectives.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(activity.objectives as string[]).slice(0, 2).map((obj: string) => (
                          <span
                            key={obj}
                            className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                          >
                            {getObjectiveLabel(obj)}
                          </span>
                        ))}
                        {(activity.objectives as string[]).length > 2 && (
                          <span className="text-xs text-neutral-400">
                            +{(activity.objectives as string[]).length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-neutral-400 dark:text-neutral-500">Duration</p>
                        <p className="font-medium text-neutral-700 dark:text-neutral-200">
                          {formatDuration(activity.duration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 dark:text-neutral-500">Participants</p>
                        <p className="font-medium text-neutral-700 dark:text-neutral-200">
                          {activity.minParticipants && activity.maxParticipants
                            ? `${activity.minParticipants}-${activity.maxParticipants}`
                            : 'Flexible'}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <span className="text-xs text-neutral-500">{activity._count.programLinks} programs</span>
                      <ActionButtons
                        viewHref={`/admin/activities/${activity.id}`}
                        editHref={`/admin/activities/${activity.id}`}
                        onDelete={() => setDeleteDialog({ isOpen: true, activity })}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, activity: null })}
        onConfirm={handleDelete}
        title="Smazat aktivitu"
        message={`Opravdu chcete smazat aktivitu "${deleteDialog.activity?.title}"? Tato akce je nevratn\u00e1.`}
        confirmText="Smazat"
        cancelText="Zru\u0161it"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
