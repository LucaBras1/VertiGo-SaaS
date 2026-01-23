/**
 * Public Activity Detail Page
 */

import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  Users,
  Zap,
  Shield,
  Palette,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

async function getActivity(slug: string) {
  const activity = await prisma.activity.findUnique({
    where: { slug, status: 'published' },
  })

  if (!activity) {
    notFound()
  }

  return activity
}

export default async function ActivityDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const activity = await getActivity(params.slug)

  const getSafetyColor = (rating: string) => {
    const colors: Record<string, string> = {
      VERY_SAFE: 'text-green-600',
      SAFE: 'text-blue-600',
      REQUIRES_SUPERVISION: 'text-yellow-600',
      ADULT_ONLY: 'text-red-600',
    }
    return colors[rating] || 'text-gray-600'
  }

  const getEnergyLevel = (level?: string) => {
    if (!level) return null
    const icons = { CALM: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 }
    const count = icons[level as keyof typeof icons] || 0
    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <Zap
            key={i}
            className="w-5 h-5 fill-partypal-yellow-500 text-partypal-yellow-500"
          />
        ))}
        {Array.from({ length: 4 - count }).map((_, i) => (
          <Zap key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-sky-500 to-partypal-pink-500">
        {activity.featuredImageUrl && (
          <img
            src={activity.featuredImageUrl}
            alt={activity.featuredImageAlt}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-4">
              {activity.featured && (
                <Badge variant="yellow" size="lg">
                  ⭐ Doporučujeme
                </Badge>
              )}
              <Badge variant="info" size="lg">
                {activity.category}
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-4">{activity.title}</h1>
            {activity.subtitle && (
              <p className="text-2xl text-white/90">{activity.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {activity.excerpt && (
              <Card>
                <CardContent className="p-8">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {activity.excerpt}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Materials Needed */}
            {activity.materials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Palette className="w-6 h-6 mr-2 text-sky-600" />
                    Potřebné materiály
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activity.materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-sky-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-sky-600 flex-shrink-0" />
                        <span className="text-gray-700">{material}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Developed */}
            {activity.skillsDeveloped.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Lightbulb className="w-6 h-6 mr-2 text-partypal-yellow-600" />
                    Rozvíjené dovednosti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {activity.skillsDeveloped.map((skill, index) => (
                      <Badge key={index} variant="success" size="lg">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {activity.educationalValue && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <strong>Vzdělávací hodnota:</strong>{' '}
                        {activity.educationalValue}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Safety Information */}
            {(activity.safetyNotes ||
              activity.allergensInvolved.length > 0 ||
              activity.choking_hazard) && (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-yellow-900">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Bezpečnostní informace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-6 h-6 ${getSafetyColor(activity.safetyRating)}`} />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Bezpečnost: {activity.safetyRating}
                      </p>
                    </div>
                  </div>

                  {activity.safetyNotes && (
                    <p className="text-gray-700">{activity.safetyNotes}</p>
                  )}

                  {activity.choking_hazard && (
                    <div className="p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                      <p className="text-red-800 font-semibold flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Varování: Riziko udušení
                      </p>
                    </div>
                  )}

                  {activity.allergensInvolved.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">
                        Možné alergeny:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activity.allergensInvolved.map((allergen) => (
                          <Badge key={allergen} variant="danger">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Rychlé informace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" />
                    <span>Trvání</span>
                  </div>
                  <span className="font-semibold">{activity.duration} min</span>
                </div>

                {activity.setupTime && (
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" />
                      <span>Příprava</span>
                    </div>
                    <span className="font-semibold">
                      {activity.setupTime} min
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-gray-400" />
                    <span>Dětí</span>
                  </div>
                  <span className="font-semibold">
                    {activity.minChildren || 1} - {activity.maxChildren}
                  </span>
                </div>

                {activity.energyLevel && (
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-gray-400" />
                      <span>Energie</span>
                    </div>
                    {getEnergyLevel(activity.energyLevel)}
                  </div>
                )}

                {activity.ageAppropriate.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Věkové skupiny:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activity.ageAppropriate.map((age) => (
                        <Badge key={age} variant="info" size="sm">
                          {age.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {activity.price && activity.price > 0 && (
                  <div className="pt-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600 mb-1">Cena</p>
                    <p className="text-3xl font-bold text-partypal-pink-600">
                      {activity.price.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <Button size="lg" className="w-full">
                    Objednat aktivitu
                  </Button>

                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="w-full">
                      Zeptat se
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
