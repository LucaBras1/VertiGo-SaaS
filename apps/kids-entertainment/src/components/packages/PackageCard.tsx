/**
 * Package Card Component
 * Displays package info with PartyPal styling
 */

import Link from 'next/link'
import Image from 'next/image'
import { Cake, Clock, Users, Star, Heart } from 'lucide-react'
import { formatPrice, getAgeGroupLabel } from '@/lib/utils'
import { Badge, Button, Card } from '@vertigo/ui'

interface PackageCardProps {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  featuredImageUrl: string
  featuredImageAlt: string
  price?: number
  duration: number
  ageGroups: string[]
  maxChildren?: number
  themeName?: string
  includesCharacter: boolean
  includesCake: boolean
  includesGoodybags: boolean
  featured?: boolean
}

export function PackageCard({
  id,
  slug,
  title,
  subtitle,
  excerpt,
  featuredImageUrl,
  featuredImageAlt,
  price,
  duration,
  ageGroups,
  maxChildren,
  themeName,
  includesCharacter,
  includesCake,
  includesGoodybags,
  featured = false,
}: PackageCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-partypal-pink-100 to-partypal-yellow-100">
        {featuredImageUrl ? (
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            🎉
          </div>
        )}
        {featured && (
          <div className="absolute top-4 right-4">
            <Badge size="sm" className="bg-partypal-yellow-100 text-partypal-yellow-800 shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        {themeName && (
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-partypal-pink-100 text-partypal-pink-800 shadow-lg">
              {themeName}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mb-3">{subtitle}</p>}

        {/* Age Groups */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ageGroups.map((ageGroup) => (
            <Badge key={ageGroup} variant="info" size="sm">
              {getAgeGroupLabel(ageGroup)}
            </Badge>
          ))}
        </div>

        {/* Excerpt */}
        {excerpt && <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>}

        {/* Details */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          {maxChildren && (
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>až {maxChildren} dětí</span>
            </div>
          )}
        </div>

        {/* Inclusions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {includesCharacter && (
            <Badge variant="default" size="sm">
              🎭 Postava
            </Badge>
          )}
          {includesCake && (
            <Badge variant="default" size="sm">
              🎂 Dort
            </Badge>
          )}
          {includesGoodybags && (
            <Badge variant="default" size="sm">
              🎁 Dárečky
            </Badge>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {price ? (
            <div>
              <span className="text-2xl font-bold text-partypal-pink-500">
                {formatPrice(price)}
              </span>
              <span className="text-sm text-gray-600 ml-1">/ oslava</span>
            </div>
          ) : (
            <span className="text-gray-600">Cena na vyžádání</span>
          )}
          <Link href={`/packages/${slug}`}>
            <Button size="sm">Zobrazit detail</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
