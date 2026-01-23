import Link from 'next/link'
import Image from 'next/image'

interface PostCardProps {
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  featuredImageUrl?: string
  featuredImageAlt?: string
  tags?: string[]
}

const tagLabels: Record<string, string> = {
  news: 'Novinka',
  performance: 'Představení',
  festival: 'Festival',
  award: 'Ocenění',
  'behind-scenes': 'Zákulisí',
}

export default function PostCard({
  title,
  slug,
  publishedAt,
  excerpt,
  featuredImageUrl,
  featuredImageAlt,
  tags = [],
}: PostCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Link
      href={`/aktuality/${slug}`}
      className="group block bg-neutral-gray-800 rounded-lg overflow-hidden shadow-base hover:shadow-lg transition-all duration-300 border border-neutral-gray-600 hover:border-primary"
    >
      {/* Image */}
      {featuredImageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-gray-700">
          <Image
            src={featuredImageUrl}
            alt={featuredImageAlt || title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full"
              >
                {tagLabels[tag] || tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <time className="block text-sm text-neutral-gray-300 mb-2">{formattedDate}</time>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-neutral-gray-200 line-clamp-3 mb-4">{excerpt}</p>
        )}

        {/* Read More Link */}
        <span className="inline-flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
          Přečíst celý článek
          <svg
            className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  )
}
