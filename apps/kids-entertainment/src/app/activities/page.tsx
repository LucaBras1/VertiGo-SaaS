/**
 * Activities Listing Page
 * Browse all available activities
 */

import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getActivities(category?: string, energyLevel?: string) {
  const where: any = {
    status: 'active',
  }

  if (category) {
    where.category = category
  }

  if (energyLevel) {
    where.energyLevel = energyLevel
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return activities
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const energyLevel = typeof params.energy === 'string' ? params.energy : undefined
  const activities = await getActivities(category, energyLevel)

  const categories = [
    { value: 'creative', label: 'Kreativn\u00ed' },
    { value: 'active', label: 'Aktivn\u00ed' },
    { value: 'skill_game', label: 'Zru\u010dnostn\u00ed' },
    { value: 'educational', label: 'Vzd\u011bl\u00e1vac\u00ed' },
    { value: 'performance', label: 'P\u0159edstaven\u00ed' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-purple-50 via-white to-partypal-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-partypal-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-partypal-pink-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zp\u011bt na hlavn\u00ed str\u00e1nku</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Na\u0161e <span className="text-partypal-purple-500">Aktivity</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Objevte \u0161irok\u00fd v\u00fdb\u011br aktivit pro ka\u017ed\u00fd typ oslavy. Od kreativn\u00edch workshop\u016f po
              ak\u010dn\u00ed hry!
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/activities">
              <Button variant={!category ? 'outline' : 'ghost'} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                V\u0161echny kategorie
              </Button>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.value} href={`/activities?category=${cat.value}`}>
                <Button
                  variant={category === cat.value ? 'default' : 'ghost'}
                  size="sm"
                >
                  {cat.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Activities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                slug={activity.slug}
                title={activity.title}
                subtitle={activity.subtitle || undefined}
                excerpt={activity.excerpt || undefined}
                featuredImageUrl={activity.featuredImageUrl}
                featuredImageAlt={activity.featuredImageAlt}
                category={activity.category}
                duration={activity.duration}
                ageAppropriate={activity.ageAppropriate}
                minChildren={activity.minChildren || undefined}
                maxChildren={activity.maxChildren || undefined}
                safetyRating={activity.safetyRating}
                energyLevel={activity.energyLevel || undefined}
                skillsDeveloped={activity.skillsDeveloped}
                price={activity.price || undefined}
              />
            ))}
          </div>

          {/* Empty State */}
          {activities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-6">
                {category
                  ? 'Pro tuto kategorii nem\u00e1me \u017e\u00e1dn\u00e9 aktivity.'
                  : 'Moment\u00e1ln\u011b nem\u00e1me \u017e\u00e1dn\u00e9 aktivity k dispozici.'}
              </p>
              {category && (
                <Link href="/activities">
                  <Button variant="outline" className="mr-4">
                    Zobrazit v\u0161echny aktivity
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button>Zp\u011bt na hlavn\u00ed str\u00e1nku</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sestavte si vlastn\u00ed program
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            M\u016f\u017eete si vybrat jednotliv\u00e9 aktivity a vytvo\u0159it si bal\u00ed\u010dek p\u0159esn\u011b podle va\u0161ich p\u0159edstav.
          </p>
          <Link href="/book">
            <Button size="lg">Za\u010d\u00edt rezervaci</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
