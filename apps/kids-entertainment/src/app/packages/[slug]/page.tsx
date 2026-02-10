/**
 * Public Package Detail Page
 */

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  Users,
  PartyPopper,
  Cake,
  Camera,
  Gift,
  AlertCircle,
  CheckCircle,
  Home,
  TreePine,
} from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

async function getPackage(slug: string) {
  const pkg = await prisma.package.findUnique({
    where: { slug, status: 'published' },
    include: {
      activities: {
        include: {
          activity: true,
        },
      },
    },
  })

  if (!pkg) {
    notFound()
  }

  return pkg
}

export default async function PackageDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const pkg = await getPackage(params.slug)

  const getEnvironmentIcon = () => {
    if (pkg.indoorOutdoor === 'indoor') return <Home className="w-4 h-4" />
    if (pkg.indoorOutdoor === 'outdoor') return <TreePine className="w-4 h-4" />
    return <Home className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-partypal-pink-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-partypal-pink-500 to-partypal-yellow-500">
        {pkg.featuredImageUrl && (
          <img
            src={pkg.featuredImageUrl}
            alt={pkg.featuredImageAlt}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-4">
              {pkg.featured && (
                <Badge size="lg" className="bg-partypal-yellow-100 text-partypal-yellow-800">
                  ⭐ Doporučujeme
                </Badge>
              )}
              <Badge size="lg" className="bg-partypal-pink-100 text-partypal-pink-800">
                {pkg.category}
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-4">{pkg.title}</h1>
            {pkg.subtitle && (
              <p className="text-2xl text-white/90">{pkg.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {pkg.excerpt && (
              <Card>
                <CardContent className="p-8">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {pkg.excerpt}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Co je zahrnuto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.includesCharacter && (
                    <div className="flex items-center space-x-3 p-4 bg-partypal-pink-50 rounded-xl">
                      <PartyPopper className="w-6 h-6 text-partypal-pink-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Postava/Maskot
                        </p>
                        {pkg.characterName && (
                          <p className="text-sm text-gray-600">
                            {pkg.characterName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {pkg.includesCake && (
                    <div className="flex items-center space-x-3 p-4 bg-partypal-pink-50 rounded-xl">
                      <Cake className="w-6 h-6 text-partypal-pink-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Dort</p>
                      </div>
                    </div>
                  )}

                  {pkg.includesPhotos && (
                    <div className="flex items-center space-x-3 p-4 bg-partypal-pink-50 rounded-xl">
                      <Camera className="w-6 h-6 text-partypal-pink-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Fotografie</p>
                      </div>
                    </div>
                  )}

                  {pkg.includesGoodybags && (
                    <div className="flex items-center space-x-3 p-4 bg-partypal-pink-50 rounded-xl">
                      <Gift className="w-6 h-6 text-partypal-pink-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Dárkové tašky
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activities */}
            {pkg.activities && pkg.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Aktivity v balíčku</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pkg.activities.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {item.activity.title}
                        </h4>
                        {item.activity.excerpt && (
                          <p className="text-sm text-gray-600">
                            {item.activity.excerpt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Information */}
            {(pkg.safetyNotes || pkg.allergens.length > 0) && (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-yellow-900">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Důležité bezpečnostní informace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pkg.safetyNotes && (
                    <p className="text-gray-700 mb-4">{pkg.safetyNotes}</p>
                  )}

                  {pkg.allergens.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">
                        Alergeny:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.allergens.map((allergen) => (
                          <Badge key={allergen} variant="warning">
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
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-6">
                {pkg.price && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Od</p>
                    <p className="text-4xl font-bold text-partypal-pink-600">
                      {pkg.price.toLocaleString('cs-CZ')} Kč
                    </p>
                    {pkg.pricePerChild && pkg.pricePerChild > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        + {pkg.pricePerChild} Kč / dítě
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" />
                      <span>Trvání</span>
                    </div>
                    <span className="font-semibold">{pkg.duration} min</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-400" />
                      <span>Kapacita</span>
                    </div>
                    <span className="font-semibold">
                      až {pkg.maxChildren} dětí
                    </span>
                  </div>

                  {pkg.indoorOutdoor && (
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center">
                        {getEnvironmentIcon()}
                        <span className="ml-2">Prostředí</span>
                      </div>
                      <span className="font-semibold capitalize">
                        {pkg.indoorOutdoor === 'indoor' && 'Uvnitř'}
                        {pkg.indoorOutdoor === 'outdoor' && 'Venku'}
                        {pkg.indoorOutdoor === 'both' && 'Obojí'}
                      </span>
                    </div>
                  )}

                  {pkg.ageGroups.length > 0 && (
                    <div className="pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Věkové skupiny:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.ageGroups.map((age) => (
                          <Badge key={age} variant="info" size="sm">
                            {age.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full">
                  Rezervovat oslavup
                </Button>

                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full">
                    Kontaktovat nás
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
