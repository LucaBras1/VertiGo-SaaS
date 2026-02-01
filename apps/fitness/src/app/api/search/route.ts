import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SearchResult {
  type: 'client' | 'session' | 'class' | 'invoice'
  id: string
  title: string
  subtitle?: string
  url: string
  icon?: string
}

/**
 * GET /api/search
 * Global search for clients, sessions, classes, and invoices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const tenantId = session.user.tenantId
    const results: SearchResult[] = []

    // Search clients
    const clients = await prisma.client.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    })

    for (const client of clients) {
      results.push({
        type: 'client',
        id: client.id,
        title: client.name,
        subtitle: client.email,
        url: `/dashboard/clients/${client.id}`,
        icon: 'user',
      })
    }

    // Search sessions (by client name or notes)
    const sessions = await prisma.session.findMany({
      where: {
        tenantId,
        OR: [
          { client: { name: { contains: query, mode: 'insensitive' } } },
          { trainerNotes: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { scheduledAt: 'desc' },
      include: {
        client: {
          select: { name: true },
        },
      },
    })

    for (const sess of sessions) {
      results.push({
        type: 'session',
        id: sess.id,
        title: `Session with ${sess.client.name}`,
        subtitle: sess.scheduledAt.toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        url: `/dashboard/sessions/${sess.id}`,
        icon: 'calendar',
      })
    }

    // Search classes
    const classes = await prisma.class.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
          { instructor: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { scheduledAt: 'desc' },
    })

    for (const cls of classes) {
      results.push({
        type: 'class',
        id: cls.id,
        title: cls.name,
        subtitle: `${cls.type} - ${cls.scheduledAt.toLocaleDateString('cs-CZ')}`,
        url: `/dashboard/classes/${cls.id}`,
        icon: 'users',
      })
    }

    // Search invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        OR: [
          { invoiceNumber: { contains: query, mode: 'insensitive' } },
          { client: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: limit,
      orderBy: { issueDate: 'desc' },
      include: {
        client: {
          select: { name: true },
        },
      },
    })

    for (const inv of invoices) {
      results.push({
        type: 'invoice',
        id: inv.id,
        title: `Invoice ${inv.invoiceNumber}`,
        subtitle: `${inv.client.name} - ${inv.total} CZK`,
        url: `/dashboard/invoices/${inv.id}`,
        icon: 'file-text',
      })
    }

    // Sort by relevance (exact matches first) and limit total results
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
      const bExact = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1
      return aExact - bExact
    })

    return NextResponse.json({
      results: results.slice(0, limit),
      query,
    })
  } catch (error: any) {
    console.error('[Search] Failed to search:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search' },
      { status: 500 }
    )
  }
}
