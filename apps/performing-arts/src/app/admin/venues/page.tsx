import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Building2, MapPin, Users, Maximize } from 'lucide-react'
import type { Venue } from '@/types'

export default async function VenuesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.tenantId) {
    return null
  }

  const venues = await prisma.venue.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          performances: true,
          rehearsals: true,
        },
      },
    },
  }) as Venue[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Venues</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage performance and rehearsal spaces</p>
        </div>
        <Link
          href="/admin/venues/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Venue
        </Link>
      </div>

      {/* Venues list */}
      {venues.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue: Venue) => (
            <Link
              key={venue.id}
              href={`/admin/venues/${venue.id}`}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-primary-300 hover:shadow-sm transition-all group"
            >
              {/* Header */}
              <div className="h-32 bg-gradient-to-br from-backstage-700 to-backstage-800 flex items-center justify-center relative">
                {venue.images?.[0] ? (
                  <Image
                    src={venue.images[0]}
                    alt={venue.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-backstage-500" />
                )}
                {!venue.isActive && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                    Inactive
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-primary-600 transition-colors">
                  {venue.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 capitalize">{venue.type.replace('_', ' ')}</p>

                <div className="space-y-2 text-sm">
                  {venue.city && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <MapPin className="w-4 h-4" />
                      <span>{venue.city}{venue.country ? `, ${venue.country}` : ''}</span>
                    </div>
                  )}
                  {venue.seatingCapacity && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <Users className="w-4 h-4" />
                      <span>{venue.seatingCapacity} seats</span>
                    </div>
                  )}
                  {venue.stageWidth && venue.stageDepth && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <Maximize className="w-4 h-4" />
                      <span>{venue.stageWidth}m x {venue.stageDepth}m stage</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{venue._count?.performances ?? 0} performances</span>
                  <span>{venue._count?.rehearsals ?? 0} rehearsals</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No venues yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Add theaters, rehearsal halls, and other performance spaces.
          </p>
          <Link
            href="/admin/venues/new"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Venue
          </Link>
        </div>
      )}
    </div>
  )
}
