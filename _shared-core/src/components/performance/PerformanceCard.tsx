import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import { PERFORMANCE_CATEGORIES } from '@/lib/constants'

interface PerformanceCardProps {
  title: string
  slug: string
  category: string
  excerpt?: string
  duration?: number
  ageRange?: { from?: number; to?: number }
  // Prisma fields
  featuredImageUrl?: string
  featuredImageAlt?: string
  featured?: boolean
}

export default function PerformanceCard({
  title,
  slug,
  category,
  excerpt,
  duration,
  ageRange,
  featuredImageUrl,
  featuredImageAlt,
  featured,
}: PerformanceCardProps) {
  const categoryLabel = PERFORMANCE_CATEGORIES[category as keyof typeof PERFORMANCE_CATEGORIES] || category

  return (
    <Link href={`/repertoar/${slug}`} className="block">
      <Card hover padding="none" className="overflow-hidden h-full">
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Doporučujeme
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 bg-neutral-gray-700">
          {featuredImageUrl ? (
            <Image
              src={featuredImageUrl}
              alt={featuredImageAlt || title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-gray-500 text-6xl">
              🎭
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <div className="text-sm text-primary font-semibold mb-2">
            {categoryLabel}
          </div>

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
            {duration && (
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
                <span>{duration} min</span>
              </div>
            )}
            {ageRange && (ageRange.from !== undefined || ageRange.to !== undefined) && (
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
                <span>
                  {ageRange.from !== undefined && ageRange.to !== undefined
                    ? `${ageRange.from}–${ageRange.to} let`
                    : ageRange.from !== undefined
                      ? `od ${ageRange.from} let`
                      : `do ${ageRange.to} let`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
