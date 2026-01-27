import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedDefaultBadges } from '@/lib/badges/badge-checker'

const badgeCreateSchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().min(1, 'Popis je povinný'),
  icon: z.string().min(1, 'Ikona je povinná'),
  color: z.string().min(1, 'Barva je povinná'),
  category: z.enum(['consistency', 'progress', 'milestone', 'social']),
  criteria: z.object({
    type: z.string(),
    value: z.number(),
    additionalParams: z.record(z.string(), z.any()).optional(),
  }),
  isActive: z.boolean().optional().default(true),
})

// GET /api/badges - List badges
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeStats = searchParams.get('includeStats') === 'true'
    const category = searchParams.get('category')

    const where = {
      tenantId: session.user.tenantId,
      ...(category && { category }),
    }

    const badges = await prisma.badge.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      ...(includeStats && {
        include: {
          _count: {
            select: { clientBadges: true },
          },
        },
      }),
    })

    // Get total active clients for percentage calculation
    let totalClients = 0
    if (includeStats) {
      totalClients = await prisma.client.count({
        where: { tenantId: session.user.tenantId, status: 'active' },
      })
    }

    const badgesWithStats = badges.map((badge) => ({
      ...badge,
      ...(includeStats && {
        earnedCount: (badge as { _count?: { clientBadges: number } })._count?.clientBadges || 0,
        earnedPercentage:
          totalClients > 0
            ? Math.round(
                (((badge as { _count?: { clientBadges: number } })._count?.clientBadges || 0) / totalClients) *
                  100
              )
            : 0,
      }),
    }))

    return NextResponse.json({
      badges: badgesWithStats,
      totalClients,
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: 'Chyba při načítání odznaků' }, { status: 500 })
  }
}

// POST /api/badges - Create badge or seed defaults
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Check if seeding defaults
    if (body.seedDefaults) {
      const created = await seedDefaultBadges(session.user.tenantId)
      return NextResponse.json({
        success: true,
        message: `Vytvořeno ${created} výchozích odznaků`,
        created,
      })
    }

    // Create custom badge
    const data = badgeCreateSchema.parse(body)

    // Check for duplicate name
    const existing = await prisma.badge.findFirst({
      where: {
        tenantId: session.user.tenantId,
        name: data.name,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Odznak s tímto názvem již existuje' },
        { status: 400 }
      )
    }

    const badge = await prisma.badge.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        category: data.category,
        criteria: JSON.parse(JSON.stringify(data.criteria)),
        isActive: data.isActive,
      },
    })

    return NextResponse.json(badge, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating badge:', error)
    return NextResponse.json({ error: 'Chyba při vytváření odznaku' }, { status: 500 })
  }
}
