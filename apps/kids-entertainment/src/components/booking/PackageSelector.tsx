/**
 * Package Selector Component
 * Step 1: Select a package or individual activities
 */

'use client'

import { useState } from 'react'
import { Check, Clock, Users, Star, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface Package {
  id: string
  title: string
  subtitle?: string
  excerpt?: string
  price?: number
  duration: number
  ageGroups: string[]
  maxChildren?: number
  themeName?: string
  includesCharacter: boolean
  includesCake: boolean
  includesGoodybags: boolean
  featured: boolean
}

interface Activity {
  id: string
  title: string
  duration: number
  price?: number
  safetyRating: string
  energyLevel?: string
}

interface PackageSelectorProps {
  packages: Package[]
  activities: Activity[]
  selectedPackageId?: string
  selectedActivityIds: string[]
  onSelectPackage: (packageId: string | undefined) => void
  onToggleActivity: (activityId: string) => void
  onNext: () => void
}

const ageGroupLabels: Record<string, string> = {
  'TODDLER_3_5': '3-5 let',
  'KIDS_6_9': '6-9 let',
  'TWEENS_10_12': '10-12 let',
  'TEENS_13_PLUS': '13+ let',
}

export function PackageSelector({
  packages,
  activities,
  selectedPackageId,
  selectedActivityIds,
  onSelectPackage,
  onToggleActivity,
  onNext,
}: PackageSelectorProps) {
  const [mode, setMode] = useState<'package' | 'custom'>(
    selectedPackageId ? 'package' : selectedActivityIds.length > 0 ? 'custom' : 'package'
  )

  const canProceed = selectedPackageId || selectedActivityIds.length > 0

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-4">
        <Button
          variant={mode === 'package' ? 'default' : 'outline'}
          onClick={() => {
            setMode('package')
            onToggleActivity('') // Clear activities
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Hotový balíček
        </Button>
        <Button
          variant={mode === 'custom' ? 'default' : 'outline'}
          onClick={() => {
            setMode('custom')
            onSelectPackage(undefined)
          }}
        >
          <Star className="h-4 w-4 mr-2" />
          Vlastní výběr aktivit
        </Button>
      </div>

      {mode === 'package' ? (
        <>
          <h3 className="text-xl font-semibold text-center text-gray-800">
            Vyberte si kompletní balíček
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                variant="outlined"
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg relative',
                  selectedPackageId === pkg.id
                    ? 'ring-2 ring-partypal-pink-500 border-partypal-pink-500'
                    : ''
                )}
                onClick={() => onSelectPackage(pkg.id)}
              >
                {selectedPackageId === pkg.id && (
                  <div className="absolute top-3 right-3 bg-partypal-pink-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                {pkg.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="pink" size="sm">
                      <Star className="h-3 w-3 mr-1" />
                      Doporučeno
                    </Badge>
                  </div>
                )}
                <div className="p-5 pt-8">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    {pkg.title}
                  </h4>
                  {pkg.subtitle && (
                    <p className="text-sm text-gray-500 mb-3">{pkg.subtitle}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {pkg.duration} min
                    </span>
                    {pkg.maxChildren && (
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        max {pkg.maxChildren}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {pkg.ageGroups.slice(0, 2).map((age) => (
                      <Badge key={age} variant="info" size="sm">
                        {ageGroupLabels[age] || age}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.includesCharacter && (
                      <Badge variant="success" size="sm">Postava</Badge>
                    )}
                    {pkg.includesCake && (
                      <Badge variant="success" size="sm">Dort</Badge>
                    )}
                    {pkg.includesGoodybags && (
                      <Badge variant="success" size="sm">Dárky</Badge>
                    )}
                  </div>

                  {pkg.price && (
                    <p className="text-xl font-bold text-partypal-pink-600">
                      {(pkg.price / 100).toLocaleString('cs-CZ')} Kč
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-center text-gray-800">
            Vyberte aktivity pro vaši oslavu
          </h3>
          <p className="text-center text-gray-600 mb-4">
            Vybráno: {selectedActivityIds.length} aktivit
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => {
              const isSelected = selectedActivityIds.includes(activity.id)
              return (
                <Card
                  key={activity.id}
                  variant="outlined"
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md relative p-4',
                    isSelected
                      ? 'ring-2 ring-partypal-pink-500 border-partypal-pink-500 bg-partypal-pink-50'
                      : ''
                  )}
                  onClick={() => onToggleActivity(activity.id)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-partypal-pink-500 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1 pr-6">
                    {activity.title}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {activity.duration} min
                    </span>
                    {activity.price && (
                      <span className="font-medium text-partypal-pink-600">
                        {(activity.price / 100).toLocaleString('cs-CZ')} Kč
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          disabled={!canProceed}
          onClick={onNext}
        >
          Pokračovat
        </Button>
      </div>
    </div>
  )
}
