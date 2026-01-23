/**
 * Activities Listing Page
 * Browse all available activities
 */

import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { Button } from '@/components/ui/Button'

// Mock data - replace with actual database query
const mockActivities = [
  {
    id: '1',
    slug: 'face-painting',
    title: 'Face Painting',
    subtitle: 'Professional artistic designs',
    excerpt: 'Transform kids into their favorite characters with professional face painting',
    featuredImageUrl: '',
    featuredImageAlt: 'Face Painting',
    category: 'creative',
    duration: 60,
    ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9'],
    minChildren: 5,
    maxChildren: 15,
    safetyRating: 'VERY_SAFE',
    energyLevel: 'CALM',
    skillsDeveloped: ['patience', 'creativity', 'self-expression'],
    price: 150000,
  },
  {
    id: '2',
    slug: 'balloon-animals',
    title: 'Balloon Animal Workshop',
    subtitle: 'Learn to twist and create',
    excerpt: 'Kids learn to make their own balloon animals with expert guidance',
    featuredImageUrl: '',
    featuredImageAlt: 'Balloon Animals',
    category: 'skill_game',
    duration: 45,
    ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
    minChildren: 6,
    maxChildren: 12,
    safetyRating: 'SAFE',
    energyLevel: 'MODERATE',
    skillsDeveloped: ['fine motor skills', 'patience', 'creativity'],
    price: 120000,
  },
  {
    id: '3',
    slug: 'treasure-hunt',
    title: 'Treasure Hunt Adventure',
    subtitle: 'Exciting outdoor exploration',
    excerpt: 'Follow clues and solve puzzles to find hidden treasure',
    featuredImageUrl: '',
    featuredImageAlt: 'Treasure Hunt',
    category: 'active',
    duration: 60,
    ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
    maxChildren: 20,
    safetyRating: 'REQUIRES_SUPERVISION',
    energyLevel: 'HIGH',
    skillsDeveloped: ['teamwork', 'problem-solving', 'physical activity'],
  },
]

export default function ActivitiesPage() {
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
            <span>Zpět na hlavní stránku</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Naše <span className="text-partypal-purple-500">Aktivity</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Objevte wide výběr aktivit pro každý typ oslavy. Od kreativních workshopů po
              akční hry!
            </p>
          </div>

          {/* Filters (placeholder) */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Všechny kategorie
            </Button>
            <Button variant="ghost" size="sm">
              Kreativní
            </Button>
            <Button variant="ghost" size="sm">
              Aktivní
            </Button>
            <Button variant="ghost" size="sm">
              Zručnostní
            </Button>
            <Button variant="ghost" size="sm">
              Vzdělávací
            </Button>
          </div>

          {/* Activities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((activity) => (
              <ActivityCard key={activity.id} {...activity} />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sestavte si vlastní program
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Můžete si vybrat jednotlivé aktivity a vytvořit si balíček přesně podle vašich představ.
          </p>
          <Link href="/contact">
            <Button size="lg">Kontaktovat nás</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
