import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import PerformanceCard from '@/components/performance/PerformanceCard'
import { prisma } from '@/lib/prisma'

export default async function FeaturedPerformances() {
  const featuredPerformances = await prisma.performance.findMany({
    where: {
      status: 'active',
      featured: true,
    },
    orderBy: { order: 'asc' },
    take: 3,
  })

  if (featuredPerformances.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-neutral-black">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              Doporučená představení
            </h2>
            <p className="text-lg text-neutral-gray-200">
              Naše nejoblíbenější produkce, které si diváci zamilovali
            </p>
          </div>
          <Button href="/repertoar" variant="outline" className="mt-6 md:mt-0">
            Zobrazit všechna představení →
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredPerformances.map((performance) => (
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
      </Container>
    </section>
  )
}
