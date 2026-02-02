import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  FileText,
  Edit,
  MoreVertical,
  Plus,
} from 'lucide-react'
import {
  formatDate,
  formatDuration,
  formatEnumValue,
  getProductionStatusColor,
} from '@/lib/utils'
import type { Rehearsal, CastMember, ProductionWithDetails } from '@/types'

export default async function ProductionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.tenantId) {
    return null
  }

  const production = await prisma.production.findFirst({
    where: {
      id: params.id,
      tenantId: session.user.tenantId,
    },
    include: {
      castMembers: {
        orderBy: { characterName: 'asc' },
        take: 10,
      },
      crewMembers: {
        orderBy: { department: 'asc' },
        take: 10,
      },
      rehearsals: {
        where: {
          date: { gte: new Date() },
          isCancelled: false,
        },
        orderBy: { date: 'asc' },
        take: 5,
      },
      performances: {
        where: {
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: 5,
      },
      techRider: true,
      _count: {
        select: {
          performances: true,
          castMembers: true,
          crewMembers: true,
          rehearsals: true,
          scenes: true,
        },
      },
    },
  }) as ProductionWithDetails | null

  if (!production) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/productions"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Productions
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{production.name}</h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProductionStatusColor(
                production.status
              )}`}
            >
              {formatEnumValue(production.status)}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-gray-500">
            <span>{formatEnumValue(production.type)}</span>
            {production.duration && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{formatDuration(production.duration)}</span>
              </>
            )}
            {production.openingDate && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>Opens {formatDate(production.openingDate, 'MMM d, yyyy')}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/productions/${production.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button className="p-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {production._count.performances}
              </p>
              <p className="text-sm text-gray-500">Performances</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {production._count.rehearsals}
              </p>
              <p className="text-sm text-gray-500">Rehearsals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {production._count.castMembers}
              </p>
              <p className="text-sm text-gray-500">Cast Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {production._count.crewMembers}
              </p>
              <p className="text-sm text-gray-500">Crew Members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis */}
          {production.synopsis && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Synopsis</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{production.synopsis}</p>
            </div>
          )}

          {/* Upcoming rehearsals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Rehearsals</h2>
              <Link
                href={`/dashboard/rehearsals/new?productionId=${production.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </Link>
            </div>

            {production.rehearsals.length > 0 ? (
              <div className="space-y-3">
                {production.rehearsals.map((rehearsal: Rehearsal) => (
                  <div
                    key={rehearsal.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {rehearsal.title || formatEnumValue(rehearsal.type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(rehearsal.date, 'EEE, MMM d')} at{' '}
                        {formatDate(rehearsal.startTime, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming rehearsals</p>
            )}
          </div>

          {/* Cast */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cast</h2>
              <Link
                href={`/dashboard/productions/${production.id}/cast`}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </Link>
            </div>

            {production.castMembers.length > 0 ? (
              <div className="space-y-3">
                {production.castMembers.map((member: CastMember) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                      {(member.performerName || 'U').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.characterName}</p>
                      <p className="text-sm text-gray-500">
                        {member.performerName || 'Unassigned'} ({member.role})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No cast members yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creative team */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Creative Team</h2>
            <div className="space-y-3">
              {[
                { label: 'Director', value: production.director },
                { label: 'Playwright', value: production.playwright },
                { label: 'Choreographer', value: production.choreographer },
                { label: 'Musical Director', value: production.musicalDirector },
                { label: 'Set Designer', value: production.setDesigner },
                { label: 'Costume Designer', value: production.costumeDesigner },
                { label: 'Lighting Designer', value: production.lightingDesigner },
                { label: 'Sound Designer', value: production.soundDesigner },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              {!production.director &&
                !production.playwright &&
                !production.choreographer && (
                  <p className="text-gray-500 text-center">Not specified</p>
                )}
            </div>
          </div>

          {/* Tech rider */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tech Rider</h2>
            </div>

            {production.techRider ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium">{production.techRider.version}</span>
                </div>
                <Link
                  href={`/dashboard/tech-riders/${production.techRider.id}`}
                  className="inline-flex items-center gap-2 w-full justify-center py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Tech Rider
                </Link>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-500 mb-3">No tech rider generated</p>
                <Link
                  href={`/dashboard/tech-riders/generate?productionId=${production.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Generate
                </Link>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-3">
              {production.openingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Opening</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(production.openingDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {production.closingDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Closing</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(production.closingDate, 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {production.hasIntermission && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Intermission</span>
                  <span className="font-medium text-gray-900">
                    {production.intermissionLength || 15} min
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
