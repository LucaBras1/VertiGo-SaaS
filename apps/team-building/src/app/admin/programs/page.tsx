/**
 * Admin - Programs List Page
 */

import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react'
import { prisma } from '@/lib/db'
import { formatDuration, getObjectiveLabel } from '@/lib/utils'

export default async function ProgramsPage() {
  // Fetch programs from database
  const programs = await prisma.program.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    include: {
      activityLinks: {
        include: {
          activity: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          sessions: true,
          orderItems: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600 mt-1">
            Manage your team building programs and packages
          </p>
        </div>
        <Link href="/admin/programs/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Program
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <select className="input-field max-w-xs">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <select className="input-field max-w-xs">
            <option value="">All Categories</option>
            <option value="team-building">Team Building</option>
            <option value="leadership">Leadership</option>
            <option value="communication">Communication</option>
          </select>
          <input
            type="text"
            placeholder="Search programs..."
            className="input-field flex-1"
          />
        </div>
      </div>

      {/* Programs Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Team Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Activities
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No programs found. Create your first program to get started.
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{program.title}</p>
                          {program.featured && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                        {program.subtitle && (
                          <p className="text-sm text-gray-600 mt-1">{program.subtitle}</p>
                        )}
                        {program.objectives && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(program.objectives as string[]).slice(0, 3).map((obj: string) => (
                              <span
                                key={obj}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                              >
                                {getObjectiveLabel(obj)}
                              </span>
                            ))}
                            {(program.objectives as string[]).length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{(program.objectives as string[]).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDuration(program.duration)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {program.minTeamSize && program.maxTeamSize
                        ? `${program.minTeamSize}-${program.maxTeamSize}`
                        : program.teamSize || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {program.activityLinks.length} activities
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {program._count.sessions} sessions
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          program.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : program.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/programs/${program.id}`}
                          className="p-2 text-gray-600 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/programs/${program.id}/edit`}
                          className="p-2 text-gray-600 hover:text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Programs</p>
            <p className="text-2xl font-bold text-brand-primary">{programs.length}</p>
          </div>
          <div className="card bg-emerald-50 border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Active Programs</p>
            <p className="text-2xl font-bold text-brand-secondary">
              {programs.filter((p) => p.status === 'active').length}
            </p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
            <p className="text-2xl font-bold text-purple-600">
              {programs.reduce((sum, p) => sum + p._count.sessions, 0)}
            </p>
          </div>
          <div className="card bg-orange-50 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Featured</p>
            <p className="text-2xl font-bold text-orange-600">
              {programs.filter((p) => p.featured).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
