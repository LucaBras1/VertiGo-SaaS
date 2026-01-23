/**
 * Admin - Activities List Page
 */

import Link from 'next/link'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { prisma } from '@/lib/db'
import { formatDuration, getObjectiveLabel, getPhysicalLevelLabel } from '@/lib/utils'

export default async function ActivitiesPage() {
  // Fetch activities from database
  const activities = await prisma.activity.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    include: {
      programLinks: {
        include: {
          program: {
            select: {
              title: true,
            },
          },
        },
      },
      _count: {
        select: {
          programLinks: true,
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
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">
            Manage your team building activities catalog
          </p>
        </div>
        <Link href="/admin/activities/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Activity
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
            <option value="">All Physical Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select className="input-field max-w-xs">
            <option value="">All Locations</option>
            <option value="INDOOR">Indoor</option>
            <option value="OUTDOOR">Outdoor</option>
            <option value="BOTH">Both</option>
            <option value="FLEXIBLE">Flexible</option>
          </select>
          <input
            type="text"
            placeholder="Search activities..."
            className="input-field flex-1"
          />
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-500">
              No activities found. Add your first activity to get started.
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="card hover:shadow-xl transition-shadow group">
              {/* Image */}
              {activity.featuredImageUrl ? (
                <img
                  src={activity.featuredImageUrl}
                  alt={activity.featuredImageAlt || activity.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-300">
                    {activity.title.charAt(0)}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                {/* Title & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {activity.title}
                    </h3>
                    {activity.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold flex-shrink-0">
                        ⭐
                      </span>
                    )}
                  </div>
                  {activity.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.excerpt}</p>
                  )}
                </div>

                {/* Objectives */}
                {activity.objectives && (
                  <div className="flex flex-wrap gap-1">
                    {(activity.objectives as string[]).slice(0, 2).map((obj: string) => (
                      <span
                        key={obj}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {getObjectiveLabel(obj)}
                      </span>
                    ))}
                    {(activity.objectives as string[]).length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{(activity.objectives as string[]).length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {formatDuration(activity.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Participants</p>
                    <p className="font-semibold text-gray-900">
                      {activity.minParticipants && activity.maxParticipants
                        ? `${activity.minParticipants}-${activity.maxParticipants}`
                        : 'Flexible'}
                    </p>
                  </div>
                  {activity.physicalDemand && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Physical Demand</p>
                      <p className="font-semibold text-gray-900">
                        {getPhysicalLevelLabel(activity.physicalDemand)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                  <span>{activity._count.programLinks} programs</span>
                  <span className="text-gray-300">•</span>
                  <span
                    className={`font-semibold ${
                      activity.status === 'active'
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/admin/activities/${activity.id}`}
                    className="flex-1 text-center py-2 text-sm font-semibold text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/activities/${activity.id}/edit`}
                    className="flex-1 text-center py-2 text-sm font-semibold text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Activities</p>
            <p className="text-2xl font-bold text-brand-primary">{activities.length}</p>
          </div>
          <div className="card bg-emerald-50 border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-brand-secondary">
              {activities.filter((a) => a.status === 'active').length}
            </p>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">In Programs</p>
            <p className="text-2xl font-bold text-purple-600">
              {activities.reduce((sum, a) => sum + a._count.programLinks, 0)}
            </p>
          </div>
          <div className="card bg-orange-50 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Featured</p>
            <p className="text-2xl font-bold text-orange-600">
              {activities.filter((a) => a.featured).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
