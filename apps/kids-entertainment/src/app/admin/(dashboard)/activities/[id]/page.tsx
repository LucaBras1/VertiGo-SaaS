/**
 * Edit Activity Page
 */

export const dynamic = 'force-dynamic'

import ActivityForm from '@/components/admin/ActivityForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

async function getActivity(id: string) {
  const activity = await prisma.activity.findUnique({
    where: { id },
  })

  if (!activity) {
    notFound()
  }

  return activity
}

export default async function EditActivityPage({
  params,
}: {
  params: { id: string }
}) {
  const activity = await getActivity(params.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upravit aktivitu</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">{activity.title}</p>
      </div>

      <ActivityForm initialData={activity} activityId={activity.id} />
    </div>
  )
}
