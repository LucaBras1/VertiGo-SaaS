/**
 * Public Package Detail Page
 * Server component - data fetching only
 */

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PackageDetailClient } from './client'

async function getPackage(slug: string) {
  const pkg = await prisma.package.findUnique({
    where: { slug, status: 'published' },
    include: {
      activities: {
        include: {
          activity: true,
        },
      },
    },
  })

  if (!pkg) {
    notFound()
  }

  return pkg
}

export default async function PackageDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const pkg = await getPackage(params.slug)

  return <PackageDetailClient pkg={JSON.parse(JSON.stringify(pkg))} />
}
