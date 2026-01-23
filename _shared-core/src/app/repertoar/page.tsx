import { Metadata } from 'next'
import Container from '@/components/ui/Container'
import PerformanceCard from '@/components/performance/PerformanceCard'
import { prisma } from '@/lib/prisma'
import { PERFORMANCE_CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Repertoár',
  description: 'Prohlédněte si náš kompletní repertoár divadelních a chůdových představení pro děti i dospělé.',
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function RepertoarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const selectedCategory = resolvedParams.category

  // Fetch performances from Prisma
  const performances = await prisma.performance.findMany({
    where: { status: 'active' },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  // Fallback texty
  const heading = 'Náš repertoár'
  const subheading = 'Nabízíme více než 20 představení různých žánrů a stylů. Od klasických pohádek pro nejmenší až po komplexní produkce pro dospělé diváky.'

  // Rozdělení představení podle kategorie
  const theatrePerformances = performances.filter(p => p.category === 'theatre')
  const stiltsPerformances = performances.filter(p => p.category === 'stilts')
  const musicPerformances = performances.filter(p => p.category === 'music')

  // Pokud je vybrána kategorie, filtruj pouze tu kategorii
  const filteredPerformances = selectedCategory
    ? performances.filter(p => p.category === selectedCategory)
    : null

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {selectedCategory && selectedCategory in PERFORMANCE_CATEGORIES
              ? PERFORMANCE_CATEGORIES[selectedCategory as keyof typeof PERFORMANCE_CATEGORIES]
              : heading}
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            {selectedCategory
              ? `Prohlédněte si naše ${PERFORMANCE_CATEGORIES[selectedCategory as keyof typeof PERFORMANCE_CATEGORIES]?.toLowerCase()}.`
              : subheading}
          </p>
        </div>

        {/* Filtrovaná představení (když je vybrána kategorie) */}
        {filteredPerformances ? (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPerformances.map((performance) => (
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
            {filteredPerformances.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-neutral-gray-200">
                  V této kategorii zatím nemáme žádná představení.
                </p>
              </div>
            )}
          </section>
        ) : (
          <>
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

            {/* Pokud nejsou žádná představení */}
            {performances.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-neutral-gray-200">
                  Momentálně nemáme žádná představení v repertoáru.
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
