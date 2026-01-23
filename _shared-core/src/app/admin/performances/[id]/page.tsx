/**
 * Edit Performance Page
 *
 * Edit an existing performance
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PerformanceForm } from '@/components/admin/PerformanceForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getPerformance(id: string) {
  try {
    const performance = await prisma.performance.findUnique({
      where: { id },
    })
    return performance
  } catch (error) {
    console.error('Error fetching performance:', error)
    return null
  }
}

export default async function EditPerformancePage({ params }: { params: { id: string } }) {
  const performance = await getPerformance(params.id)

  if (!performance) {
    notFound()
  }

  // Convert Date objects to ISO strings for client component
  const performanceData = {
    ...performance,
    premiere: performance.premiere?.toISOString() || null,
    createdAt: performance.createdAt.toISOString(),
    updatedAt: performance.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={performance.title} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit inscenaci</h1>
        <p className="mt-2 text-sm text-gray-600">{performance.title}</p>
      </div>

      <PerformanceForm performance={performanceData} />
    </div>
  )
}
