import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ slug: string }>
}

const tagLabels: Record<string, string> = {
  news: 'Novinka',
  performance: 'Představení',
  festival: 'Festival',
  award: 'Ocenění',
  'behind-scenes': 'Zákulisí',
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { slug: true },
  })
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!post) {
    return {
      title: 'Aktualita nenalezena',
    }
  }

  const seo = post.seo as { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null
  const title = seo?.metaTitle || post.title
  const description = seo?.metaDescription || post.excerpt || `Přečtěte si ${post.title} - aktuality z Divadla Studna`
  const ogImage = seo?.ogImageUrl || post.featuredImageUrl

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

export default async function PostDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug },
  })

  if (!post) {
    notFound()
  }

  const author = post.author as { name?: string; role?: string; bio?: string; photoUrl?: string } | null
  const categories = post.categories as string[] | null

  const formattedDate = (post.publishedAt || post.createdAt).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-neutral-gray-200">
          <Link href="/" className="hover:text-primary transition-colors">
            Úvod
          </Link>
          <span className="mx-2">/</span>
          <Link href="/aktuality" className="hover:text-primary transition-colors">
            Aktuality
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{post.title}</span>
        </nav>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {/* Tags */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 bg-primary-light/10 text-primary text-sm font-medium rounded-full"
                  >
                    {tagLabels[tag] || tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-neutral-gray-200">
              <time>{formattedDate}</time>
              {author?.name && (
                <>
                  <span>•</span>
                  <span>{author.name}</span>
                </>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImageUrl && (
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
              <Image
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-neutral-gray-200 leading-relaxed mb-8 font-medium border-l-4 border-primary pl-6">
              {post.excerpt}
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-lg max-w-none">
              {/* TODO: Add TipTap renderer for rich text */}
              <div className="text-neutral-gray-200 leading-relaxed whitespace-pre-line">
                {typeof post.content === 'string'
                  ? post.content
                  : JSON.stringify(post.content)}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {author?.bio && (
            <div className="mt-12 p-6 bg-neutral-gray-800 rounded-lg border border-neutral-gray-600">
              <div className="flex items-start gap-4">
                {author.photoUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={author.photoUrl}
                      alt={author.name || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white mb-1">{author.name}</h4>
                  {author.role && (
                    <p className="text-sm text-neutral-gray-200 mb-2">{author.role}</p>
                  )}
                  <p className="text-neutral-gray-200">{author.bio}</p>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Back Link */}
        <div className="max-w-4xl mx-auto mt-12">
          <Link
            href="/aktuality"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zpět na aktuality
          </Link>
        </div>
      </Container>
    </div>
  )
}
