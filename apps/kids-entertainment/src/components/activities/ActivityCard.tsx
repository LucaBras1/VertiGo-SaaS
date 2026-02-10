/**
 * Activity Card Component
 * Displays individual activity with safety and age info
 */

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Shield, Zap } from 'lucide-react'
import { formatPrice, getAgeGroupLabel, getSafetyRatingColor, getEnergyLevelEmoji } from '@/lib/utils'
import { Badge, Button, Card } from '@vertigo/ui'

interface ActivityCardProps {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  featuredImageUrl: string
  featuredImageAlt: string
  category: string
  duration: number
  ageAppropriate: string[]
  minChildren?: number
  maxChildren?: number
  safetyRating: string
  energyLevel?: string
  skillsDeveloped: string[]
  price?: number
}

export function ActivityCard({
  id,
  slug,
  title,
  subtitle,
  excerpt,
  featuredImageUrl,
  featuredImageAlt,
  category,
  duration,
  ageAppropriate,
  minChildren,
  maxChildren,
  safetyRating,
  energyLevel,
  skillsDeveloped,
  price,
}: ActivityCardProps) {
  const categoryLabels: Record<string, string> = {
    skill_game: 'Zručnostní hra',
    creative: 'Kreativní',
    active: 'Aktivní',
    educational: 'Vzdělávací',
    performance: 'Vystoupení',
  }

  const safetyLabels: Record<string, string> = {
    VERY_SAFE: 'Velmi bezpečné',
    SAFE: 'Bezpečné',
    REQUIRES_SUPERVISION: 'Vyžaduje dozor',
    ADULT_ONLY: 'Pouze dospělí',
  }

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-partypal-purple-100 to-partypal-pink-100">
        {featuredImageUrl ? (
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            🎮
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="default" size="sm" className="shadow-lg">
            {categoryLabels[category] || category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mb-3">{subtitle}</p>}

        {/* Age Groups */}
        <div className="flex flex-wrap gap-2 mb-3">
          {ageAppropriate.map((ageGroup) => (
            <Badge key={ageGroup} variant="info" size="sm">
              {getAgeGroupLabel(ageGroup)}
            </Badge>
          ))}
        </div>

        {/* Excerpt */}
        {excerpt && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{excerpt}</p>}

        {/* Details */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          {(minChildren || maxChildren) && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>
                {minChildren && maxChildren
                  ? `${minChildren}-${maxChildren} dětí`
                  : maxChildren
                  ? `až ${maxChildren} dětí`
                  : `min. ${minChildren} dětí`}
              </span>
            </div>
          )}
          {energyLevel && (
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{getEnergyLevelEmoji(energyLevel)}</span>
            </div>
          )}
        </div>

        {/* Safety */}
        <div className="mb-3">
          <Badge className={getSafetyRatingColor(safetyRating)} size="sm">
            <Shield className="h-3 w-3 mr-1" />
            {safetyLabels[safetyRating] || safetyRating}
          </Badge>
        </div>

        {/* Skills */}
        {skillsDeveloped.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Rozvíjí:</p>
            <div className="flex flex-wrap gap-1">
              {skillsDeveloped.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {price ? (
            <span className="text-lg font-bold text-partypal-pink-500">
              {formatPrice(price)}
            </span>
          ) : (
            <span className="text-sm text-gray-600">Součást balíčku</span>
          )}
          <Link href={`/activities/${slug}`}>
            <Button size="sm" variant="ghost">
              Detail
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
