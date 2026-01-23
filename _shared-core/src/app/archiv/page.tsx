import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import PerformanceCard from '@/components/performance/PerformanceCard'
import { prisma } from '@/lib/prisma'
import { PERFORMANCE_CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Již nehrajeme',
  description: 'Představení, která jsme již ukončili a jsou po derniéře.',
}

export default async function ArchivPage() {
  const performances = await prisma.performance.findMany({
    where: { status: 'archived' },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  // Rozdělení představení podle kategorie
  const theatrePerformances = performances.filter(p => p.category === 'theatre')
  const stiltsPerformances = performances.filter(p => p.category === 'stilts')
  const musicPerformances = performances.filter(p => p.category === 'music')

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Již nehrajeme
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            Představení, která jsou již po derniéře a momentálně je nenabízíme.
            Rádi na ně vzpomínáme a děkujeme všem, kdo je s námi viděli.
          </p>
        </div>

        {/* Divadelní představení */}
        {theatrePerformances.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">
              {PERFORMANCE_CATEGORIES.theatre}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {theatrePerformances.map((performance) => (
                <PerformanceCard
                  key={performance.id}
                  title={performance.title}
                  slug={performance.slug}
                  category={performance.category}
                  excerpt={performance.excerpt || undefined}
                  duration={performance.duration}
                  ageRange={performance.ageRange as { from?: number; to?: number } | undefined}
                  featuredImageUrl={performance.featuredImageUrl}
                  featuredImageAlt={performance.featuredImageAlt}
                  featured={performance.featured}
                />
              ))}
            </div>
          </section>
        )}

        {/* Chůdová představení */}
        {stiltsPerformances.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">
              {PERFORMANCE_CATEGORIES.stilts}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {stiltsPerformances.map((performance) => (
                <PerformanceCard
                  key={performance.id}
                  title={performance.title}
                  slug={performance.slug}
                  category={performance.category}
                  excerpt={performance.excerpt || undefined}
                  duration={performance.duration}
                  ageRange={performance.ageRange as { from?: number; to?: number } | undefined}
                  featuredImageUrl={performance.featuredImageUrl}
                  featuredImageAlt={performance.featuredImageAlt}
                  featured={performance.featured}
                />
              ))}
            </div>
          </section>
        )}

        {/* Hudební produkce */}
        {musicPerformances.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">
              {PERFORMANCE_CATEGORIES.music}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {musicPerformances.map((performance) => (
                <PerformanceCard
                  key={performance.id}
                  title={performance.title}
                  slug={performance.slug}
                  category={performance.category}
                  excerpt={performance.excerpt || undefined}
                  duration={performance.duration}
                  ageRange={performance.ageRange as { from?: number; to?: number } | undefined}
                  featuredImageUrl={performance.featuredImageUrl}
                  featuredImageAlt={performance.featuredImageAlt}
                  featured={performance.featured}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pokud nejsou žádná archivovaná představení */}
        {performances.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-gray-200">
              Momentálně nemáme žádná archivovaná představení.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}
