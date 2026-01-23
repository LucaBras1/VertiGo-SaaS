import { Metadata } from 'next'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import GameCard from '@/components/game/GameCard'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Doprovodný program',
  description: 'Úžasný svět her a další služby pro vaše akce - interaktivní hry pro děti, jednokolkový trenažér, divadelní ateliér a andělská pošta.',
}

export const revalidate = 3600 // Revalidate every hour

export default async function HryPage() {
  // Načíst hry z Prisma
  const games = await prisma.game.findMany({
    where: { status: 'active' },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  })

  // Načíst služby z Prisma
  const services = await prisma.service.findMany({
    where: { status: 'active' },
    orderBy: [{ order: 'asc' }, { title: 'asc' }],
  })

  // Fallback texty
  const heading = 'Doprovodný program'
  const subheading = 'Nabízíme nejen divadelní představení, ale i spoustu interaktivních her a dalších služeb pro vaše akce.'

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {heading}
          </h1>
          <p className="text-lg text-neutral-gray-200 max-w-3xl">
            {subheading}
          </p>
        </div>

        {/* Interaktivní hry */}
        <section id="hry" className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              Interaktivní hry
            </h2>
            <p className="text-lg text-neutral-gray-200">
              {games.length} interaktivních her pro děti všech věkových kategorií. Ideální doplněk vašich akcí, oslav a festivalů.
            </p>
          </div>

          {games.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  slug={game.slug}
                  excerpt={game.excerpt || undefined}
                  ageRange={game.ageRange as { from?: number; to?: number } | undefined}
                  participants={game.minPlayers && game.maxPlayers
                    ? { min: game.minPlayers, max: game.maxPlayers }
                    : undefined
                  }
                  duration={game.duration}
                  featuredImageUrl={game.featuredImageUrl}
                  featuredImageAlt={game.featuredImageAlt}
                  featured={game.featured}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-gray-800 border border-neutral-gray-600 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-neutral-gray-200">
                Pracujeme na přidání her do systému. Brzy zde najdete kompletní nabídku.
              </p>
            </div>
          )}
        </section>

        {/* Doplňkové atrakce */}
        <section id="sluzby">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              Doplňkové atrakce
            </h2>
            <p className="text-lg text-neutral-gray-200">
              Jedinečné služby a atrakce, které obohatí vaše akce a vytvoří nezapomenutelné zážitky.
            </p>
          </div>

          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <GameCard
                  key={service.id}
                  title={service.title}
                  slug={service.slug}
                  excerpt={service.excerpt || undefined}
                  featuredImageUrl={service.featuredImageUrl || undefined}
                  featuredImageAlt={service.featuredImageAlt || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-gray-800 border border-neutral-gray-600 rounded-lg p-8 text-center">
              <div className="text-4xl mb-3">🎪</div>
              <p className="text-neutral-gray-200">
                Pracujeme na přidání doplňkových atrakcí do systému. Brzy zde najdete kompletní nabídku.
              </p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-lg p-8 md:p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Zajímají vás naše hry nebo služby?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Kontaktujte nás pro nezávaznou poptávku a domluvíme se na detailech vaší akce.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              Kontaktovat nás
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
