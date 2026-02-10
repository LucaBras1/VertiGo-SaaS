/**
 * Sessions List Component
 * Client-side component with filters, search and delete functionality
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Calendar, CheckCircle, Clock, XCircle, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge, ListPageHeader, SearchFilterBar, ActionButtons } from '@vertigo/admin'
import { staggerContainer, staggerItem } from '@vertigo/ui'
import toast from 'react-hot-toast'

interface Program {
  title: string
}

interface Session {
  id: string
  companyName: string | null
  teamName: string | null
  date: Date
  endDate: Date | null
  status: string
  teamSize: number | null
  debriefCompleted: boolean
  venue: any
  program: Program | null
  programId: string | null
}

interface SessionsListProps {
  initialSessions: Session[]
  programs: Array<{ id: string; title: string }>
}

export function SessionsList({ initialSessions, programs }: SessionsListProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [statusFilter, setStatusFilter] = useState('')
  const [programFilter, setProgramFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; session: Session | null }>({
    isOpen: false,
    session: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = !statusFilter || session.status === statusFilter
    const matchesProgram = !programFilter || session.programId === programFilter
    const matchesSearch =
      !searchQuery ||
      session.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesProgram && matchesSearch
  })

  const handleDelete = async () => {
    if (!deleteDialog.session) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sessions/${deleteDialog.session.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete session')
      }

      setSessions(sessions.filter((s) => s.id !== deleteDialog.session!.id))
      toast.success('Session was successfully deleted')
      setDeleteDialog({ isOpen: false, session: null })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting session')
    } finally {
      setIsDeleting(false)
    }
  }

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.date) >= new Date() && s.status !== 'cancelled' && s.status !== 'completed'
  )

  const stats = {
    total: sessions.length,
    upcoming: upcomingSessions.length,
    completed: sessions.filter((s) => s.status === 'completed').length,
    withDebrief: sessions.filter((s) => s.debriefCompleted).length,
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Sessions"
        description="Manage scheduled team building sessions"
        actionLabel="Schedule Session"
        actionHref="/admin/sessions/new"
        actionIcon={Plus}
      />

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Total', value: stats.total, color: 'text-brand-600' },
          { label: 'Upcoming', value: stats.upcoming, color: 'text-success-600' },
          { label: 'Completed', value: stats.completed, color: 'text-violet-600' },
          { label: 'With Debrief', value: stats.withDebrief, color: 'text-amber-600' },
        ].map((s) => (
          <motion.div key={s.label} variants={staggerItem}>
            <Card className="py-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by company..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Tentative', value: 'tentative' },
              { label: 'Completed', value: 'completed' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
            onChange: setStatusFilter,
          },
          {
            label: 'Program',
            value: programFilter,
            options: [
              { label: 'All Programs', value: '' },
              ...programs.map((p) => ({ label: p.title, value: p.id })),
            ],
            onChange: setProgramFilter,
          },
        ]}
      />

      {/* Sessions Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/50">
                <th className="sticky left-0 z-10 bg-neutral-50/95 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 backdrop-blur-sm dark:bg-neutral-800/95 dark:text-neutral-400">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Debrief
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                    {searchQuery || statusFilter || programFilter
                      ? 'No sessions match your filters.'
                      : 'No sessions found. Schedule your first session to get started.'}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const venue = session.venue as any
                  return (
                    <tr key={session.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="sticky left-0 z-10 bg-white/95 px-6 py-4 backdrop-blur-sm dark:bg-neutral-900/95">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {session.companyName || 'Unnamed Session'}
                          </p>
                          {session.teamName && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{session.teamName}</p>
                          )}
                          {venue?.name && (
                            <p className="mt-0.5 text-xs text-neutral-400">
                              {venue.name}{venue.city && `, ${venue.city}`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-neutral-700 dark:text-neutral-200">{formatDate(session.date, 'short')}</p>
                        {session.endDate && (
                          <p className="text-xs text-neutral-400">to {formatDate(session.endDate, 'short')}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                        {session.program?.title || 'Custom Program'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                        {session.teamSize || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={session.status} />
                      </td>
                      <td className="px-6 py-4">
                        {session.debriefCompleted ? (
                          <span className="inline-flex items-center gap-1 text-sm text-success-600">
                            <CheckCircle className="h-4 w-4" />
                            Done
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-400">&mdash;</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          viewHref={`/admin/sessions/${session.id}`}
                          editHref={`/admin/sessions/${session.id}`}
                          onDelete={() => setDeleteDialog({ isOpen: true, session })}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming Preview */}
      {upcomingSessions.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Next 7 Days ({upcomingSessions.slice(0, 7).length} sessions)
          </h2>
          <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="visible">
            {upcomingSessions.slice(0, 7).map((session) => (
              <motion.div key={session.id} variants={staggerItem}>
                <div className="flex items-center justify-between rounded-lg bg-brand-50/50 p-4 dark:bg-brand-950/20">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{session.companyName}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatDate(session.date, 'long')} &bull; {session.teamSize} participants
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/sessions/${session.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, session: null })}
        onConfirm={handleDelete}
        title="Delete session"
        message={`Are you sure you want to delete session "${deleteDialog.session?.companyName || 'this session'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
