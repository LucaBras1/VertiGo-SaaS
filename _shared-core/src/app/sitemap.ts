import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://divadlo-studna.cz'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/repertoar`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/program`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aktuality`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hry`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/soubor`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pro-poradatele`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/nas-pribeh`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/archiv`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic performance pages from Prisma
  const performances = await prisma.performance.findMany({
    where: { status: 'active' },
    select: { slug: true, updatedAt: true },
  })
  const performancePages = performances.map((performance) => ({
    url: `${baseUrl}/repertoar/${performance.slug}`,
    lastModified: performance.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Dynamic post pages from Prisma
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { slug: true, publishedAt: true },
  })
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/aktuality/${post.slug}`,
    lastModified: post.publishedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic game pages from Prisma
  const games = await prisma.game.findMany({
    where: { status: 'active' },
    select: { slug: true, updatedAt: true },
  })
  const gamePages = games.map((game) => ({
    url: `${baseUrl}/hry/${game.slug}`,
    lastModified: game.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic service pages from Prisma
  const services = await prisma.service.findMany({
    where: { status: 'active' },
    select: { slug: true, updatedAt: true },
  })
  const servicePages = services.map((service) => ({
    url: `${baseUrl}/hry/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...performancePages, ...postPages, ...gamePages, ...servicePages]
}
