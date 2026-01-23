import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { PortableText } from '@portabletext/react'
import ImageGallery from '@/components/ImageGallery'
import VideoEmbed from '@/components/VideoEmbed'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Revalidate every hour

// Prisma Game type for detail page
interface PrismaGameDetail {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  subtitle: string | null
  excerpt: string | null
  description: any // JSON field - can be Portable Text or plain text
  duration: number
  ageRange: { from?: number; to?: number } | null
  minPlayers: number | null
  maxPlayers: number | null
  technicalRequirements: any // JSON field
  featuredImageUrl: string
  featuredImageAlt: string
  galleryImages: Array<{ url: string; alt?: string; caption?: string }> | null
  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
  videoUrl?: string | null
}

// Prisma Service type for detail page
interface PrismaServiceDetail {
  id: string
  title: string
  slug: string
  category: string
  status: string
  excerpt: string | null
  description: any // JSON field
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
}

// Format age range for display
function formatAgeRange(ageRange: { from?: number; to?: number } | null): string | undefined {
  if (!ageRange) return undefined
  const { from, to } = ageRange
  if (from && to) return `${from}-${to} let`
  if (from) return `od ${from} let`
  if (to) return `do ${to} let`
  return undefined
}

// Format participants for display
function formatParticipants(min: number | null, max: number | null): string | undefined {
  if (min && max) return `${min}-${max} hráčů`
  if (min) return `min. ${min} hráčů`
  if (max) return `max. ${max} hráčů`
  return undefined
}

// Format duration for display
function formatDuration(duration: number | null): string | undefined {
  if (!duration) return undefined
  return `${duration} min`
}

export async function generateStaticParams() {
  // Fetch games from Prisma
  const games = await prisma.game.findMany({
    where: { status: 'active' },
    select: { slug: true },
  })

  // Fetch services from Prisma
  const services = await prisma.service.findMany({
    where: { status: 'active' },
    select: { slug: true },
  })

  return [
    ...games.map((game) => ({ slug: game.slug })),
    ...services.map((service) => ({ slug: service.slug })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  // Try to fetch game from Prisma first
  const game = await prisma.game.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      featuredImageUrl: true,
      seo: true,
    },
  }) as { title: string; excerpt: string | null; featuredImageUrl: string; seo: any } | null

  // If not a game, try service from Prisma
  const service = !game ? await prisma.service.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      featuredImageUrl: true,
      seo: true,
    },
  }) as { title: string; excerpt: string | null; featuredImageUrl: string | null; seo: any } | null : null

  const item = game || service

  if (!item) {
    return {
      title: 'Položka nenalezena',
    }
  }

  const isGame = !!game

  // Handle SEO data
  const seo = item.seo as { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null
  const title = seo?.metaTitle || item.title
  const description = seo?.metaDescription || item.excerpt || `${item.title} - ${isGame ? 'interaktivní hra' : 'služba'} pro děti od Divadla Studna`
  const ogImage = seo?.ogImageUrl || item.featuredImageUrl || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Try to fetch game from Prisma first
  const game = await prisma.game.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      featured: true,
      subtitle: true,
      excerpt: true,
      description: true,
      duration: true,
      ageRange: true,
      minPlayers: true,
      maxPlayers: true,
      technicalRequirements: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      galleryImages: true,
      seo: true,
    },
  }) as PrismaGameDetail | null

  // Only show active games
  if (game && game.status !== 'active') {
    notFound()
  }

  // If not a game (or inactive), try service from Prisma
  const service = !game ? await prisma.service.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      excerpt: true,
      description: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      seo: true,
    },
  }) as PrismaServiceDetail | null : null

  // Only show active services
  if (service && service.status !== 'active') {
    notFound()
  }

  const item = game || service
  const isGame = !!game

  if (!item) {
    notFound()
  }

  // Prepare display data based on item type
  const title = item.title
  const excerpt = item.excerpt
  const description = item.description

  // Image handling
  const imageUrl = item.featuredImageUrl
  const imageAlt = item.featuredImageAlt || title

  // Metadata display (only for games)
  const ageRangeDisplay = isGame && game
    ? formatAgeRange(game.ageRange as { from?: number; to?: number } | null)
    : undefined

  const participantsDisplay = isGame && game
    ? formatParticipants(game.minPlayers, game.maxPlayers)
    : undefined

  const durationDisplay = isGame && game
    ? formatDuration(game.duration)
    : undefined

  // Technical requirements (only for games)
  const technicalRequirements = isGame && game ? game.technicalRequirements : null

  // Gallery (only games have galleryImages)
  const galleryImages = isGame && game ? game.galleryImages as Array<{ url: string; alt?: string; caption?: string }> | null : null

  // Video URL - check in seo or as separate field (depends on schema)
  const videoUrl = (item as any).videoUrl

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-neutral-gray-200">
          <Link href="/" className="hover:text-primary transition-colors">
            Úvod
          </Link>
          <span className="mx-2">/</span>
          <Link href="/hry" className="hover:text-primary transition-colors">
            Doprovodný program
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div>
            {imageUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary-light/20 to-secondary/20 flex items-center justify-center">
                <div className="text-8xl">{isGame ? '🎮' : '🎪'}</div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              {title}
            </h1>

            {/* Metadata (only for games) */}
            {isGame && (
              <div className="flex flex-wrap gap-4 mb-8">
                {ageRangeDisplay && (
                  <div className="flex items-center gap-2 text-neutral-gray-200">
                    <span className="text-2xl">👶</span>
                    <div>
                      <div className="text-sm text-neutral-gray-300">Věk</div>
                      <div className="font-semibold">{ageRangeDisplay}</div>
                    </div>
                  </div>
                )}
                {participantsDisplay && (
                  <div className="flex items-center gap-2 text-neutral-gray-200">
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="text-sm text-neutral-gray-300">Počet hráčů</div>
                      <div className="font-semibold">{participantsDisplay}</div>
                    </div>
                  </div>
                )}
                {durationDisplay && (
                  <div className="flex items-center gap-2 text-neutral-gray-200">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <div className="text-sm text-neutral-gray-300">Doba trvání</div>
                      <div className="font-semibold">{durationDisplay}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Excerpt */}
            {excerpt && (
              <div className="text-xl text-neutral-gray-200 leading-relaxed mb-8 border-l-4 border-primary pl-6">
                {excerpt}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="prose prose-lg max-w-none mb-8">
                {typeof description === 'string' ? (
                  <div className="text-neutral-gray-200 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </div>
                ) : Array.isArray(description) ? (
                  <PortableText value={description} />
                ) : (
                  <div className="text-neutral-gray-200 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(description)}
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Mám zájem o {isGame ? 'tuto hru' : 'tuto službu'}
              </Link>
              <Link
                href="/hry"
                className="inline-flex items-center justify-center px-8 py-4 bg-neutral-gray-700 text-white rounded-lg font-semibold hover:bg-neutral-gray-600 transition-colors"
              >
                ← Zpět na přehled
              </Link>
            </div>
          </div>
        </div>

        {/* Video Section */}
        {videoUrl && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Video</h2>
            <div className="max-w-3xl">
              <VideoEmbed
                url={videoUrl}
                title={title}
              />
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {galleryImages && galleryImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Fotogalerie</h2>
            <ImageGallery
              images={galleryImages.map(img => img.url)}
              alt={title}
            />
          </div>
        )}

        {/* Technical Requirements (Array format - for games from Prisma) */}
        {isGame && technicalRequirements && Array.isArray(technicalRequirements) && technicalRequirements.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Technické požadavky</h2>
            <div className="bg-neutral-gray-800 border border-neutral-gray-600 rounded-lg p-6">
              <dl className="space-y-3">
                {technicalRequirements.map((req: { requirement: string; value: string }, index: number) => (
                  <div key={index} className="flex flex-col md:flex-row md:gap-4">
                    <dt className="text-neutral-gray-300 md:w-1/3">{req.requirement}:</dt>
                    <dd className="font-semibold text-white">{req.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-light/10 to-secondary/10 rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Zajímá vás {isGame ? 'tato hra' : 'tato služba'}?
            </h2>
            <p className="text-lg text-neutral-gray-200 mb-6">
              Kontaktujte nás pro více informací nebo nezávaznou cenovou nabídku. Rádi vám poradíme s výběrem {isGame ? 'her' : 'služeb'} pro vaši akci.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+420773916665"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                📞 +420 773 916 665
              </a>
              <a
                href="mailto:produkce@divadlo-studna.cz"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                ✉️ produkce@divadlo-studna.cz
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
