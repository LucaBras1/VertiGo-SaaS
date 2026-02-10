import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Calendar, Users, MapPin } from 'lucide-react'
import { formatDate, getRehearsalTypeLabel } from '@/lib/utils'
import type { Rehearsal } from '@/types'

export default async function RehearsalsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.tenantId) {
    return null
  }

  const rehearsals = await prisma.rehearsal.findMany({
    where: {
      production: { tenantId: session.user.tenantId },
    },
    orderBy: { date: 'asc' },
    include: {
      production: {
        select: { id: true, name: true },
      },
      venue: {
        select: { id: true, name: true },
      },
    },
  }) as Rehearsal[]

  const upcomingRehearsals = rehearsals.filter(
    (r: Rehearsal) => new Date(r.date) >= new Date() && !r.isCancelled
  )
  const pastRehearsals = rehearsals.filter(
    (r: Rehearsal) => new Date(r.date) < new Date() || r.isCancelled
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Rehearsals</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Schedule and manage rehearsals</p>
        </div>
        <Link
          href="/admin/rehearsals/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Rehearsal
        </Link>
      </div>

      {/* Upcoming */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Upcoming Rehearsals ({upcomingRehearsals.length})
          </h2>
        </div>

        {upcomingRehearsals.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {upcomingRehearsals.map((rehearsal: Rehearsal) => (
              <Link
                key={rehearsal.id}
                href={`/admin/rehearsals/${rehearsal.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:bg-neutral-800/50 transition-colors"
              >
                <div className="w-14 h-14 bg-accent-100 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-accent-600 uppercase">
                    {formatDate(rehearsal.date, 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-accent-700">
                    {formatDate(rehearsal.date, 'd')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {rehearsal.title || getRehearsalTypeLabel(rehearsal.type)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{rehearsal.production?.name}</p>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(rehearsal.startTime, 'h:mm a')} -{' '}
                    {formatDate(rehearsal.endTime, 'h:mm a')}
                  </span>
                  {(rehearsal.venue || rehearsal.location) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {rehearsal.venue?.name || rehearsal.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {rehearsal.callList.length}
                  </span>
                </div>

                <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {getRehearsalTypeLabel(rehearsal.type)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">No upcoming rehearsals</p>
            <Link
              href="/admin/rehearsals/new"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-500 font-medium"
            >
              <Plus className="w-4 h-4" />
              Schedule a rehearsal
            </Link>
          </div>
        )}
      </div>

      {/* Past rehearsals */}
      {pastRehearsals.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Past Rehearsals ({pastRehearsals.length})
            </h2>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {pastRehearsals.slice(0, 10).map((rehearsal: Rehearsal) => (
              <Link
                key={rehearsal.id}
                href={`/admin/rehearsals/${rehearsal.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:bg-neutral-800/50 transition-colors opacity-60"
              >
                <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                    {formatDate(rehearsal.date, 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
                    {formatDate(rehearsal.date, 'd')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    {rehearsal.title || getRehearsalTypeLabel(rehearsal.type)}
                  </p>
                  <p className="text-sm text-neutral-400">{rehearsal.production?.name}</p>
                </div>

                {rehearsal.isCancelled && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    Cancelled
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
