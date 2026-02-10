/**
 * Packages Listing Page
 * Browse all available party packages
 */

import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { PackageCard } from '@/components/packages/PackageCard'
import { prisma } from '@/lib/prisma'
import { Button } from '@vertigo/ui'

export const dynamic = 'force-dynamic'

async function getPackages(ageGroup?: string) {
  const where: any = {
    status: 'active',
  }

  if (ageGroup) {
    where.ageGroups = {
      has: ageGroup,
    }
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      activities: {
        include: {
          activity: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return packages
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ageGroup = typeof params.age === 'string' ? params.age : undefined
  const packages = await getPackages(ageGroup)

  const ageGroups = [
    { value: 'TODDLER_3_5', label: '3-5 let' },
    { value: 'KIDS_6_9', label: '6-9 let' },
    { value: 'TWEENS_10_12', label: '10-12 let' },
    { value: 'TEENS_13_PLUS', label: '13+ let' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 via-white to-partypal-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-partypal-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-partypal-pink-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zpět na hlavní stránku</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Naše <span className="text-partypal-pink-500">Balíčky</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Připravili jsme kompletní balíčky pro nezapomenutelné oslavy. Vyberte si ten
              nejlepší pro vaše dítě!
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/packages">
              <Button variant={!ageGroup ? 'outline' : 'ghost'} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Všechny věkové skupiny
              </Button>
            </Link>
            {ageGroups.map((group) => (
              <Link key={group.value} href={`/packages?age=${group.value}`}>
                <Button
                  variant={ageGroup === group.value ? 'default' : 'ghost'}
                  size="sm"
                >
                  {group.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                slug={pkg.slug}
                title={pkg.title}
                subtitle={pkg.subtitle || undefined}
                excerpt={pkg.excerpt || undefined}
                featuredImageUrl={pkg.featuredImageUrl}
                featuredImageAlt={pkg.featuredImageAlt}
                price={pkg.price || undefined}
                duration={pkg.duration}
                ageGroups={pkg.ageGroups}
                maxChildren={pkg.maxChildren || undefined}
                themeName={pkg.themeName || undefined}
                includesCharacter={pkg.includesCharacter}
                includesCake={pkg.includesCake}
                includesGoodybags={pkg.includesGoodybags}
                featured={pkg.featured}
              />
            ))}
          </div>

          {/* Empty State */}
          {packages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-6">
                {ageGroup
                  ? 'Pro tuto věkovou skupinu nemáme žádné balíčky.'
                  : 'Momentálně nemáme žádné balíčky k dispozici.'}
              </p>
              {ageGroup && (
                <Link href="/packages">
                  <Button variant="outline" className="mr-4">
                    Zobrazit všechny balíčky
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button>Zpět na hlavní stránku</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Nenašli jste perfektní balíček?
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Kontaktujte nás a vytvoříme balíček přímo pro vás!
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Kontaktovat nás
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
