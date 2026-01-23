/**
 * Packages Listing Page
 * Browse all available party packages
 */

import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { PackageCard } from '@/components/packages/PackageCard'
import { Button } from '@/components/ui/Button'

// Mock data - replace with actual database query
const mockPackages = [
  {
    id: '1',
    slug: 'princess-party-premium',
    title: 'Princess Party Premium',
    subtitle: 'Magical fairy tale experience',
    excerpt: 'Complete princess experience with costume, activities, and royal treats',
    featuredImageUrl: '',
    featuredImageAlt: 'Princess Party',
    price: 899000, // 8990 CZK in cents
    duration: 180,
    ageGroups: ['TODDLER_3_5', 'KIDS_6_9'],
    maxChildren: 15,
    themeName: 'Princezny',
    includesCharacter: true,
    includesCake: true,
    includesGoodybags: true,
    featured: true,
  },
  {
    id: '2',
    slug: 'superhero-adventure',
    title: 'Superhero Adventure',
    subtitle: 'Action-packed superhero training',
    excerpt: 'Become a superhero with exciting challenges and missions',
    featuredImageUrl: '',
    featuredImageAlt: 'Superhero Party',
    price: 849000,
    duration: 180,
    ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
    maxChildren: 20,
    themeName: 'Superhrdinové',
    includesCharacter: true,
    includesCake: false,
    includesGoodybags: true,
    featured: true,
  },
  {
    id: '3',
    slug: 'science-lab-party',
    title: 'Science Lab Party',
    subtitle: 'Fun experiments and discoveries',
    excerpt: 'Hands-on science experiments that amaze and educate',
    featuredImageUrl: '',
    featuredImageAlt: 'Science Party',
    price: 799000,
    duration: 150,
    ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
    maxChildren: 12,
    themeName: 'Věda',
    includesCharacter: false,
    includesCake: false,
    includesGoodybags: true,
    featured: false,
  },
]

export default function PackagesPage() {
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

          {/* Filters (placeholder) */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Všechny věkové skupiny
            </Button>
            <Button variant="ghost" size="sm">
              3-5 let
            </Button>
            <Button variant="ghost" size="sm">
              6-9 let
            </Button>
            <Button variant="ghost" size="sm">
              10-12 let
            </Button>
            <Button variant="ghost" size="sm">
              13+ let
            </Button>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockPackages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>

          {/* Empty State */}
          {mockPackages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-6">
                Momentálně nemáme žádné balíčky k dispozici.
              </p>
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
