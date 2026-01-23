import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/ui/Card'

// Support both string and object formats for ageRange
type AgeRangeProps = string | { from?: number; to?: number } | undefined

// Support both string and object formats for participants
type ParticipantsProps = string | { min?: number; max?: number } | undefined

// Support both string and number formats for duration
type DurationProps = string | number | undefined

interface GameCardProps {
  title: string
  slug: string
  excerpt?: string
  ageRange?: AgeRangeProps
  participants?: ParticipantsProps
  duration?: DurationProps
  // Prisma format - direct URLs
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  featured?: boolean
}

// Format age range for display
function formatAgeRange(ageRange: AgeRangeProps): string | undefined {
  if (!ageRange) return undefined
  if (typeof ageRange === 'string') return ageRange
  if (typeof ageRange === 'object') {
    const { from, to } = ageRange
    if (from && to) return `${from}-${to} let`
    if (from) return `od ${from} let`
    if (to) return `do ${to} let`
  }
  return undefined
}

// Format participants for display
function formatParticipants(participants: ParticipantsProps): string | undefined {
  if (!participants) return undefined
  if (typeof participants === 'string') return participants
  if (typeof participants === 'object') {
    const { min, max } = participants
    if (min && max) return `${min}-${max} hráčů`
    if (min) return `min. ${min} hráčů`
    if (max) return `max. ${max} hráčů`
  }
  return undefined
}

// Format duration for display
function formatDuration(duration: DurationProps): string | undefined {
  if (!duration) return undefined
  if (typeof duration === 'string') return duration
  if (typeof duration === 'number') return `${duration} min`
  return undefined
}

export default function GameCard({
  title,
  slug,
  excerpt,
  ageRange,
  participants,
  duration,
  featuredImageUrl,
  featuredImageAlt,
  featured,
}: GameCardProps) {
  const imageUrl = featuredImageUrl || null
  const imageAlt = featuredImageAlt || title

  return (
    <Link href={`/hry/${slug}`} className="block">
      <Card hover padding="none" className="overflow-hidden h-full">
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Doporučujeme
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 bg-neutral-gray-700">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-gray-500 text-6xl">
              🎮
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-serif font-bold text-white mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-neutral-gray-200 text-sm mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-sm text-neutral-gray-300">
            {formatAgeRange(ageRange) && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{formatAgeRange(ageRange)}</span>
              </div>
            )}
            {formatParticipants(participants) && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>{formatParticipants(participants)}</span>
              </div>
            )}
            {formatDuration(duration) && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatDuration(duration)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
