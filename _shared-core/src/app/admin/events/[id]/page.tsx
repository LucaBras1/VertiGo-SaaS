/**
 * Edit Event Page
 *
 * Edit an existing event
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EventForm } from '@/components/admin/EventForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getEvent(id: string) {
  try {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        performance: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  // Convert dates to ISO strings for client component
  const eventData = {
    ...event,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    date: event.date.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
  }

  // Get linked item title for display
  const linkedTitle = event.performance
    ? `🎭 ${event.performance.title}`
    : event.game
    ? `🎮 ${event.game.title}`
    : 'Vlastní akce'

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs entityTitle={linkedTitle} className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit akci</h1>
        <p className="mt-2 text-sm text-gray-600">{linkedTitle}</p>
      </div>

      <EventForm event={eventData} />
    </div>
  )
}
