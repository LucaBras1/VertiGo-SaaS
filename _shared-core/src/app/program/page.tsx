import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import EventCard from '@/components/event/EventCard'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Program',
  description: 'Aktuální program a nadcházející představení Divadla Studna. Podívejte se, kde nás můžete vidět.',
}

export const revalidate = 3600 // Revalidate every hour

export default async function ProgramPage() {
  // Get today's date at midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const events = await prisma.event.findMany({
    where: {
      isPublic: true,
      date: { gte: today },
    },
    orderBy: { date: 'asc' },
    include: {
      performance: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          featuredImageUrl: true,
          featuredImageAlt: true,
        },
      },
    },
  })

  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const date = new Date(event.date)
    const monthYear = date.toLocaleDateString('cs-CZ', {
      month: 'long',
      year: 'numeric',
    })
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: monthYear,
        events: [],
      }
    }
    acc[monthKey].events.push(event)
    return acc
  }, {} as Record<string, { label: string; events: typeof events }>)

  const sortedMonths = Object.entries(eventsByMonth).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Aktuální program
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            Přehled našich nadcházejících představení. Těšíme se na setkání s vámi!
          </p>
        </div>

        {/* Events */}
        {sortedMonths.length > 0 ? (
          <div className="space-y-12">
            {sortedMonths.map(([monthKey, { label, events: monthEvents }]) => (
              <section key={monthKey}>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6 capitalize">
                  {label}
                </h2>
                <div className="space-y-4">
                  {monthEvents.map((event) => {
                    const venue = event.venue as { name?: string; city?: string; address?: string }
                    return (
                      <EventCard
                        key={event.id}
                        date={event.date.toISOString()}
                        endDate={event.endDate?.toISOString()}
                        venue={{
                          name: venue?.name || '',
                          city: venue?.city || '',
                          address: venue?.address,
                        }}
                        status={event.status as 'confirmed' | 'tentative' | 'cancelled'}
                        ticketUrl={event.ticketUrl || undefined}
                        performance={event.performance ? {
                          id: event.performance.id,
                          title: event.performance.title,
                          slug: event.performance.slug,
                          category: event.performance.category,
                          featuredImageUrl: event.performance.featuredImageUrl,
                          featuredImageAlt: event.performance.featuredImageAlt,
                        } : undefined}
                      />
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Momentálně nemáme naplánované žádné veřejné akce
            </h3>
            <p className="text-lg text-neutral-gray-200 mb-6">
              Program aktualizujeme průběžně. Sledujte nás na sociálních sítích nebo
              se ozvěte pro rezervaci zájezdu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://facebook.com/divadlostudna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-neutral-gray-700 text-white rounded-lg font-semibold hover:bg-neutral-gray-600 transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/divadlostudna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 bg-neutral-gray-800 border border-neutral-gray-600 rounded-lg p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-3">
            Chcete nás pozvat na soukromou akci?
          </h3>
          <p className="text-neutral-gray-200 mb-4">
            Přivezeme vám představení přímo k vám do školy, mateřinky, kulturního
            domu nebo na soukromou oslavu. Kontaktujte nás pro nezávaznou poptávku.
          </p>
          <a
            href="/kontakt"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Kontaktovat nás
          </a>
        </div>
      </Container>
    </div>
  )
}
