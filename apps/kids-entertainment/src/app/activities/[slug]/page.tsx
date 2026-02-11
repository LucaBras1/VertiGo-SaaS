/**
 * Public Activity Detail Page
 * Server component - data fetching only
 */

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ActivityDetailClient } from './client'

async function getActivity(slug: string) {
  const activity = await prisma.activity.findUnique({
    where: { slug, status: 'published' },
  })

  if (!activity) {
    notFound()
  }

  return activity
}

export default async function ActivityDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const activity = await getActivity(params.slug)

  return <ActivityDetailClient activity={JSON.parse(JSON.stringify(activity))} />
}
