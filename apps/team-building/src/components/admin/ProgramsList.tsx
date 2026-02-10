/**
 * Programs List Component
 * Client-side component with filters, search and delete functionality
 *
 * Uses the VertiGo design system with motion animations,
 * card-based layout, dark mode support, and shared UI primitives.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Clock, Users, Layers, Star, Calendar, Package } from 'lucide-react'
import { staggerContainer, staggerItem, hoverLift } from '@vertigo/ui'
import { formatDuration, getObjectiveLabel } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge, ActionButtons, SearchFilterBar, ListPageHeader } from '@vertigo/admin'
import toast from 'react-hot-toast'

interface Program {
  id: string
  title: string
  subtitle: string | null
  status: string
  featured: boolean
  duration: number | null
  minTeamSize: number | null
  maxTeamSize: number | null
  teamSize: number | null
  objectives: string[] | null
  activityLinks: { activity: { title: string } }[]
  _count: { sessions: number; orderItems: number }
}

interface ProgramsListProps {
  initialPrograms: Program[]
}

export function ProgramsList({ initialPrograms }: ProgramsListProps) {
  const router = useRouter()
  const [programs, setPrograms] = useState(initialPrograms)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; program: Program | null }>({
    isOpen: false,
    program: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter programs
  const filteredPrograms = programs.filter((program) => {
    const matchesStatus = !statusFilter || program.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleDelete = async () => {
    if (!deleteDialog.program) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/programs/${deleteDialog.program.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodařilo se smazat program')
      }

      setPrograms(programs.filter((p) => p.id !== deleteDialog.program!.id))
      toast.success('Program byl úspěšně smazán')
      setDeleteDialog({ isOpen: false, program: null })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při mazání programu')
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = {
    total: programs.length,
    active: programs.filter((p) => p.status === 'active').length,
    sessions: programs.reduce((sum, p) => sum + p._count.sessions, 0),
    featured: programs.filter((p) => p.featured).length,
  }

  const getTeamSizeLabel = (program: Program) => {
    if (program.minTeamSize && program.maxTeamSize) {
      return `${program.minTeamSize}-${program.maxTeamSize}`
    }
    return program.teamSize ? String(program.teamSize) : 'N/A'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ListPageHeader
        title="Programs"
        description="Manage your team building programs and packages"
        actionLabel="Create Program"
        actionHref="/admin/programs/new"
        actionIcon={Plus}
      />

      {/* Stats */}
      {programs.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          <motion.div variants={staggerItem}>
            <Card hover={false} animated={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{stats.total}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card hover={false} animated={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-600 dark:bg-success-950/50 dark:text-success-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{stats.active}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card hover={false} animated={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-50 text-info-600 dark:bg-info-950/50 dark:text-info-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Sessions</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{stats.sessions}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card hover={false} animated={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-950/50 dark:text-warning-400">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Featured</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{stats.featured}</p>
                </div>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      )}

      {/* Search & Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search programs..."
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
        ]}
      />

      {/* Programs List */}
      {filteredPrograms.length === 0 ? (
        <Card hover={false} animated={false}>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <Package className="h-6 w-6" />
            </div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {searchQuery || statusFilter
                ? 'No programs match your filters'
                : 'No programs yet'}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {searchQuery || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first program to get started.'}
            </p>
            {!searchQuery && !statusFilter && (
              <div className="mt-5">
                <Link href="/admin/programs/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Create Program
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredPrograms.map((program) => (
            <motion.div key={program.id} variants={staggerItem} {...hoverLift}>
              <Card className="overflow-hidden p-0">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  {/* Program Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/programs/${program.id}`}
                        className="text-base font-semibold text-neutral-900 transition-colors hover:text-brand-600 dark:text-neutral-50 dark:hover:text-brand-400"
                      >
                        {program.title}
                      </Link>
                      {program.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-700 ring-1 ring-inset ring-warning-600/20 dark:bg-warning-950/50 dark:text-warning-400 dark:ring-warning-400/20">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      )}
                      <StatusBadge status={program.status} />
                    </div>

                    {program.subtitle && (
                      <p className="mt-1 line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {program.subtitle}
                      </p>
                    )}

                    {/* Objectives Tags */}
                    {program.objectives && program.objectives.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(program.objectives as string[]).slice(0, 3).map((obj: string) => (
                          <span
                            key={obj}
                            className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/50 dark:text-brand-400"
                          >
                            {getObjectiveLabel(obj)}
                          </span>
                        ))}
                        {(program.objectives as string[]).length > 3 && (
                          <span className="inline-flex items-center px-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                            +{(program.objectives as string[]).length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meta columns */}
                  <div className="flex flex-shrink-0 items-center gap-4 text-sm sm:gap-6">
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400" title="Duration">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{program.duration ? formatDuration(program.duration) : 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400" title="Team Size">
                      <Users className="h-3.5 w-3.5" />
                      <span>{getTeamSizeLabel(program)}</span>
                    </div>

                    <div className="hidden items-center gap-1.5 text-neutral-500 dark:text-neutral-400 sm:flex" title="Activities">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{program.activityLinks.length}</span>
                    </div>

                    <div className="hidden items-center gap-1.5 text-neutral-500 dark:text-neutral-400 sm:flex" title="Sessions">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{program._count.sessions}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <ActionButtons
                    viewHref={`/admin/programs/${program.id}`}
                    editHref={`/admin/programs/${program.id}`}
                    onDelete={() => setDeleteDialog({ isOpen: true, program })}
                    className="flex-shrink-0"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Result count */}
      {(searchQuery || statusFilter) && filteredPrograms.length > 0 && (
        <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
          Showing {filteredPrograms.length} of {programs.length} programs
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, program: null })}
        onConfirm={handleDelete}
        title="Smazat program"
        message={`Opravdu chcete smazat program "${deleteDialog.program?.title}"? Tato akce je nevratná.`}
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
