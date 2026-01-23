import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { PerformanceCTA } from '@/components/performance'
import { prisma } from '@/lib/prisma'
import { PERFORMANCE_CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all performances
export async function generateStaticParams() {
  const performances = await prisma.performance.findMany({
    where: { status: 'active' },
    select: { slug: true },
  })
  return performances.map((performance) => ({
    slug: performance.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const performance = await prisma.performance.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!performance) {
    return {
      title: 'Představení nenalezeno',
    }
  }

  const seo = performance.seo as { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null
  const title = seo?.metaTitle || performance.title
  const description = seo?.metaDescription || performance.excerpt || performance.subtitle || ''
  const ogImage = seo?.ogImageUrl || performance.featuredImageUrl

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

export default async function PerformanceDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const performance = await prisma.performance.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!performance) {
    notFound()
  }

  const ageRange = performance.ageRange as { from?: number; to?: number } | null
  const technicalRequirements = performance.technicalRequirements as {
    space?: string
    electricity?: string
    water?: string
  } | null
  const crew = performance.crew as { role: string; name: string }[] | null
  const categoryLabel = PERFORMANCE_CATEGORIES[performance.category as keyof typeof PERFORMANCE_CATEGORIES] || performance.category

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-neutral-gray-200 mb-8">
          <Link href="/" className="hover:text-primary">
            Domů
          </Link>
          <span>/</span>
          <Link href="/repertoar" className="hover:text-primary">
            Repertoár
          </Link>
          <span>/</span>
          <span className="text-white">{performance.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-primary-light/10 text-primary text-sm font-semibold rounded-full mb-4">
                {categoryLabel}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                {performance.title}
              </h1>
              {performance.subtitle && (
                <p className="text-xl text-neutral-gray-200">{performance.subtitle}</p>
              )}
            </div>

            {/* Featured Image */}
            {performance.featuredImageUrl && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
                <Image
                  src={performance.featuredImageUrl}
                  alt={performance.featuredImageAlt || performance.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {performance.excerpt && (
              <div className="text-lg text-neutral-gray-200 leading-relaxed mb-8 p-6 bg-neutral-gray-800 rounded-lg border-l-4 border-primary">
                {performance.excerpt}
              </div>
            )}

            {/* Description */}
            {performance.description && (
              <div className="prose prose-lg max-w-none mb-12">
                {/* TODO: Add TipTap renderer for rich text */}
                <div className="text-neutral-gray-200 leading-relaxed whitespace-pre-line">
                  {typeof performance.description === 'string'
                    ? performance.description
                    : JSON.stringify(performance.description)}
                </div>
              </div>
            )}

            {/* Crew */}
            {crew && crew.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-serif font-bold text-white mb-4">
                  Tvůrčí tým
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crew.map((member, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="font-semibold text-neutral-gray-200 min-w-[120px]">
                        {member.role}:
                      </div>
                      <div className="text-neutral-gray-200">{member.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info Card */}
              <div className="bg-neutral-gray-800 rounded-lg shadow-md border border-neutral-gray-600 p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Základní informace
                </h3>
                <div className="space-y-4">
                  {performance.duration && (
                    <div>
                      <div className="text-sm text-neutral-gray-200 mb-1">
                        Délka představení
                      </div>
                      <div className="font-semibold text-white">
                        {performance.duration} minut
                      </div>
                    </div>
                  )}
                  {ageRange && (ageRange.from !== undefined || ageRange.to !== undefined) && (
                    <div>
                      <div className="text-sm text-neutral-gray-200 mb-1">
                        Vhodné pro věk
                      </div>
                      <div className="font-semibold text-white">
                        {ageRange.from !== undefined && ageRange.to !== undefined
                          ? `${ageRange.from}–${ageRange.to} let`
                          : ageRange.from !== undefined
                            ? `od ${ageRange.from} let`
                            : `do ${ageRange.to} let`
                        }
                      </div>
                    </div>
                  )}
                  {performance.premiere && (
                    <div>
                      <div className="text-sm text-neutral-gray-200 mb-1">Premiéra</div>
                      <div className="font-semibold text-white">
                        {formatDate(performance.premiere.toISOString(), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Requirements */}
              {technicalRequirements && (
                <div className="bg-neutral-gray-800 rounded-lg shadow-md border border-neutral-gray-600 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Technické požadavky
                  </h3>
                  <div className="space-y-3">
                    {technicalRequirements.space && (
                      <div>
                        <div className="text-sm text-neutral-gray-200 mb-1">
                          Potřebný prostor
                        </div>
                        <div className="font-semibold text-white">
                          {technicalRequirements.space}
                        </div>
                      </div>
                    )}
                    {technicalRequirements.electricity && (
                      <div>
                        <div className="text-sm text-neutral-gray-200 mb-1">
                          Elektřina
                        </div>
                        <div className="font-semibold text-white">
                          {technicalRequirements.electricity}V
                        </div>
                      </div>
                    )}
                    {technicalRequirements.water && (
                      <div>
                        <div className="text-sm text-neutral-gray-200 mb-1">Voda</div>
                        <div className="font-semibold text-white">
                          {technicalRequirements.water} litrů
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <PerformanceCTA
                performanceId={performance.id}
                performanceTitle={performance.title}
              />

              {/* Back to Repertoar */}
              <Button href="/repertoar" variant="outline" className="w-full">
                ← Zpět na repertoár
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
