/**
 * Activities Listing Page
 * Server component - data fetching only
 */

import { prisma } from '@/lib/prisma'
import { ActivitiesPageClient } from './client'

export const dynamic = 'force-dynamic'

async function getActivities(category?: string, energyLevel?: string) {
  const where: any = {
    status: 'active',
  }

  if (category) {
    where.category = category
  }

  if (energyLevel) {
    where.energyLevel = energyLevel
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return activities
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}


export default async function ActivitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const energyLevel = typeof params.energy === 'string' ? params.energy : undefined
  const activities = await getActivities(category, energyLevel)

  return (
    <ActivitiesPageClient
      activities={JSON.parse(JSON.stringify(activities))}
      category={category}
      energyLevel={energyLevel}
    />
  )
}
