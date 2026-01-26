/**
 * Sessions List Component
 * Client-side component with filters, search and delete functionality
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, CheckCircle, Clock, XCircle, FileText, Eye, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'tentative':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-700',
      tentative: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
  }

  // Filter sessions
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

  // Group sessions by status
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.date) >= new Date() && s.status !== 'cancelled' && s.status !== 'completed'
  )
  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const cancelledSessions = sessions.filter((s) => s.status === 'cancelled')

  const stats = {
    total: sessions.length,
    upcoming: upcomingSessions.length,
    completed: completedSessions.length,
    withDebrief: sessions.filter((s) => s.debriefCompleted).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage scheduled team building sessions
          </p>
        </div>
        <Link href="/admin/sessions/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Schedule Session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-brand-primary">{stats.total}</p>
        </div>
        <div className="card bg-emerald-50 border-emerald-200">
          <p className="text-sm text-gray-600 mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-brand-secondary">{stats.upcoming}</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
        </div>
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-sm text-gray-600 mb-1">With Debrief</p>
          <p className="text-2xl font-bold text-orange-600">{stats.withDebrief}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <select
            className="input-field max-w-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="tentative">Tentative</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="input-field max-w-xs"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by company..."
            className="input-field flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Team Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Debrief
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || statusFilter || programFilter
                      ? 'No sessions match your filters.'
                      : 'No sessions found. Schedule your first session to get started.'}
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const venue = session.venue as any
                  return (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <div>
                              <p className="font-semibold text-gray-900">
                                {session.companyName || 'Unnamed Session'}
                              </p>
                              {session.teamName && (
                                <p className="text-sm text-gray-600">{session.teamName}</p>
                              )}
                              {venue?.name && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📍 {venue.name}
                                  {venue.city && `, ${venue.city}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>
                          <p className="font-semibold">{formatDate(session.date, 'short')}</p>
                          {session.endDate && (
                            <p className="text-xs text-gray-500">
                              to {formatDate(session.endDate, 'short')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {session.program?.title || 'Custom Program'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {session.teamSize || 'N/A'} participants
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {session.debriefCompleted ? (
                          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/sessions/${session.id}`}
                            className="p-2 text-gray-600 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/sessions/${session.id}`}
                            className="p-2 text-gray-600 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {session.status === 'completed' && !session.debriefCompleted && (
                            <Link
                              href={`/admin/sessions/${session.id}/debrief`}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Generate Debrief"
                            >
                              <FileText className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, session })}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View - Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Next 7 Days ({upcomingSessions.slice(0, 7).length} sessions)
          </h2>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 7).map((session) => {
              const venue = session.venue as any
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="font-semibold text-gray-900">{session.companyName}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(session.date, 'long')} • {session.teamSize} participants
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/sessions/${session.id}`}
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
