import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badges/badge-checker'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/clients/[id]/badges - Get client's badges
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Get client's badges
    const clientBadges = await prisma.clientBadge.findMany({
      where: { clientId: id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    // Get all available badges for progress tracking
    const allBadges = await prisma.badge.findMany({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    const earnedBadgeIds = new Set(clientBadges.map((cb) => cb.badgeId))

    return NextResponse.json({
      earned: clientBadges.map((cb) => ({
        ...cb.badge,
        earnedAt: cb.earnedAt,
        notified: cb.notified,
      })),
      available: allBadges.filter((b) => !earnedBadgeIds.has(b.id)),
      totalEarned: clientBadges.length,
      totalAvailable: allBadges.length,
    })
  } catch (error) {
    console.error('Error fetching client badges:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání odznaků klienta' },
      { status: 500 }
    )
  }
}

// POST /api/clients/[id]/badges - Check and award badges for client
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Check and award badges
    const awarded = await checkAndAwardBadges(id, session.user.tenantId)

    return NextResponse.json({
      success: true,
      awarded,
      message:
        awarded.length > 0
          ? `Uděleno ${awarded.length} nových odznaků`
          : 'Žádné nové odznaky',
    })
  } catch (error) {
    console.error('Error checking badges:', error)
    return NextResponse.json(
      { error: 'Chyba při kontrole odznaků' },
      { status: 500 }
    )
  }
}
