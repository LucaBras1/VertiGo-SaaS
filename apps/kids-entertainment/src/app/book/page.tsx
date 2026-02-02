/**
 * Booking Page
 * Multi-step booking wizard for party reservations
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { BookingWizard } from './BookingWizard'

export const dynamic = 'force-dynamic'

async function getPackagesAndActivities() {
  const [packages, activities] = await Promise.all([
    prisma.package.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      select: {
        id: true,
        title: true,
        subtitle: true,
        excerpt: true,
        price: true,
        duration: true,
        ageGroups: true,
        maxChildren: true,
        themeName: true,
        includesCharacter: true,
        includesCake: true,
        includesGoodybags: true,
        featured: true,
      },
    }),
    prisma.activity.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      select: {
        id: true,
        title: true,
        duration: true,
        price: true,
        safetyRating: true,
        energyLevel: true,
      },
    }),
  ])

  return { packages, activities }
}

export default async function BookPage() {
  const { packages, activities } = await getPackagesAndActivities()

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

      {/* Wizard */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Rezervace <span className="text-partypal-pink-500">Oslavy</span>
            </h1>
            <p className="text-xl text-gray-600">
              Vytvořte si nezapomenutelnou oslavu pro vaše dítě
            </p>
          </div>

          <BookingWizard packages={packages} activities={activities} />
        </div>
      </section>
    </div>
  )
}
