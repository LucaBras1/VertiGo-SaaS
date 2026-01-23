/**
 * Global Search API
 *
 * Unified search endpoint across ALL entities:
 * - Performances, Games, Services, Events
 * - Orders, Customers, Invoices
 * - Posts, Pages, Team
 *
 * Uses Fuse.js for fuzzy search
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Fuse from 'fuse.js'

export const dynamic = 'force-dynamic'

interface SearchResult {
  id: string
  type: 'performance' | 'game' | 'service' | 'event' | 'order' | 'customer' | 'invoice' | 'post' | 'page' | 'team'
  title: string
  subtitle?: string
  url: string
  icon: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Fetch all entities in parallel
    const [
      performances,
      games,
      services,
      events,
      orders,
      customers,
      posts,
      pages,
      team,
    ] = await Promise.all([
      prisma.performance.findMany({
        select: { id: true, title: true, status: true },
        take: 50
      }),
      prisma.game.findMany({
        select: { id: true, title: true, category: true },
        take: 50
      }),
      prisma.service.findMany({
        select: { id: true, title: true, excerpt: true },
        take: 50
      }),
      prisma.event.findMany({
        select: { id: true, performance: { select: { title: true } }, game: { select: { title: true } }, date: true, venue: true },
        take: 50,
        orderBy: { date: 'desc' }
      }),
      prisma.order.findMany({
        select: { id: true, orderNumber: true, eventName: true, status: true },
        take: 50,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.findMany({
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        take: 50
      }),
      prisma.post.findMany({
        select: { id: true, title: true, status: true },
        take: 50,
        orderBy: { publishedAt: 'desc' }
      }),
      prisma.page.findMany({
        select: { id: true, title: true, slug: true },
        take: 50
      }),
      prisma.teamMember.findMany({
        select: { id: true, firstName: true, lastName: true, role: true },
        take: 50
      }),
    ])

    // Transform to searchable items
    const searchableItems: SearchResult[] = [
      // Performances
      ...performances.map(p => ({
        id: p.id,
        type: 'performance' as const,
        title: p.title,
        subtitle: p.status,
        url: `/admin/performances/${p.id}`,
        icon: '🎭'
      })),

      // Games
      ...games.map(g => ({
        id: g.id,
        type: 'game' as const,
        title: g.title,
        subtitle: g.category || undefined,
        url: `/admin/games/${g.id}`,
        icon: '🎮'
      })),

      // Services
      ...services.map(s => ({
        id: s.id,
        type: 'service' as const,
        title: s.title,
        subtitle: s.excerpt?.slice(0, 50) || undefined,
        url: `/admin/services/${s.id}`,
        icon: '🔧'
      })),

      // Events
      ...events.map(e => {
        const venue = e.venue as { name?: string } | null
        return {
          id: e.id,
          type: 'event' as const,
          title: e.performance?.title || e.game?.title || 'Akce',
          subtitle: `${new Date(e.date).toLocaleDateString('cs-CZ')} • ${venue?.name || ''}`,
          url: `/admin/events/${e.id}`,
          icon: '📅'
        }
      }),

      // Orders
      ...orders.map(o => ({
        id: o.id,
        type: 'order' as const,
        title: `Objednávka ${o.orderNumber}`,
        subtitle: `${o.eventName || 'Bez názvu'} • ${o.status}`,
        url: `/admin/orders/${o.id}`,
        icon: '🛒'
      })),

      // Customers
      ...customers.map(c => ({
        id: c.id,
        type: 'customer' as const,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.email || c.phone || undefined,
        url: `/admin/customers/${c.id}`,
        icon: '👥'
      })),

      // Posts
      ...posts.map(p => ({
        id: p.id,
        type: 'post' as const,
        title: p.title,
        subtitle: p.status,
        url: `/admin/posts/${p.id}`,
        icon: '📰'
      })),

      // Pages
      ...pages.map(p => ({
        id: p.id,
        type: 'page' as const,
        title: p.title,
        subtitle: `/${p.slug}`,
        url: `/admin/pages/${p.id}`,
        icon: '📄'
      })),

      // Team
      ...team.map(t => ({
        id: t.id,
        type: 'team' as const,
        title: `${t.firstName} ${t.lastName}`,
        subtitle: t.role || undefined,
        url: `/admin/team/${t.id}`,
        icon: '👤'
      })),
    ]

    // Fuzzy search with Fuse.js
    const fuse = new Fuse(searchableItems, {
      keys: ['title', 'subtitle'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    })

    const searchResults = fuse.search(query)

    // Return top 20 results
    const results = searchResults
      .slice(0, 20)
      .map(result => result.item)

    // Group by type
    const grouped = results.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push(item)
      return acc
    }, {} as Record<string, SearchResult[]>)

    return NextResponse.json({
      results,
      grouped,
      count: results.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Chyba při vyhledávání' },
      { status: 500 }
    )
  }
}
