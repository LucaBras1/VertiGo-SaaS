/**
 * Packages Listing Page
 * Server component - data fetching only
 */

import { prisma } from '@/lib/prisma'
import { PackagesPageClient } from './client'

export const dynamic = 'force-dynamic'

async function getPackages(ageGroup?: string) {
  const where: any = {
    status: 'active',
  }

  if (ageGroup) {
    where.ageGroups = {
      has: ageGroup,
    }
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      activities: {
        include: {
          activity: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return packages
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ageGroup = typeof params.age === 'string' ? params.age : undefined
  const packages = await getPackages(ageGroup)

  return (
    <PackagesPageClient
      packages={JSON.parse(JSON.stringify(packages))}
      ageGroup={ageGroup}
    />
  )
}
