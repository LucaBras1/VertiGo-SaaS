/**
 * Admin - Activities List Page
 * Server component that fetches data and passes to client component
 */

// Force dynamic rendering - database queries at runtime
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { ActivitiesList } from '@/components/admin/ActivitiesList'

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

  // Transform data for client component
  const transformedActivities = activities.map((activity: any) => ({
    id: activity.id,
    title: activity.title,
    excerpt: activity.excerpt,
    status: activity.status,
    featured: activity.featured,
    duration: activity.duration,
    minParticipants: activity.minParticipants,
    maxParticipants: activity.maxParticipants,
    physicalDemand: activity.physicalDemand,
    indoorOutdoor: activity.indoorOutdoor,
    objectives: activity.objectives,
    featuredImageUrl: activity.featuredImageUrl,
    featuredImageAlt: activity.featuredImageAlt,
    programLinks: activity.programLinks,
    _count: activity._count,
  }))

  return <ActivitiesList initialActivities={transformedActivities} />
}
