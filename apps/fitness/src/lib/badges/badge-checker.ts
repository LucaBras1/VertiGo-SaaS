import { prisma } from '@/lib/prisma'

/**
 * Badge criteria types
 */
export type BadgeCriteriaType =
  | 'sessions_completed'
  | 'first_session'
  | 'goal_achieved'
  | 'weight_goal'
  | 'consecutive_weeks'
  | 'morning_sessions'
  | 'weekend_sessions'
  | 'measurement_logged'
  | 'credits_purchased'

export interface BadgeCriteria {
  type: BadgeCriteriaType
  value: number
  additionalParams?: Record<string, unknown>
}

/**
 * Default badges that can be seeded for a tenant
 */
export const DEFAULT_BADGES = [
  {
    name: 'První trénink',
    description: 'Dokončil/a svůj první trénink',
    icon: 'trophy',
    color: '#F59E0B',
    category: 'milestone',
    criteria: { type: 'first_session', value: 1 },
  },
  {
    name: 'Pravidelný',
    description: 'Dokončil/a 10 tréninků',
    icon: 'calendar-check',
    color: '#10B981',
    category: 'consistency',
    criteria: { type: 'sessions_completed', value: 10 },
  },
  {
    name: 'Oddaný',
    description: 'Dokončil/a 50 tréninků',
    icon: 'flame',
    color: '#EF4444',
    category: 'consistency',
    criteria: { type: 'sessions_completed', value: 50 },
  },
  {
    name: 'Centenarian',
    description: 'Dokončil/a 100 tréninků',
    icon: 'crown',
    color: '#8B5CF6',
    category: 'milestone',
    criteria: { type: 'sessions_completed', value: 100 },
  },
  {
    name: 'Ranní ptáče',
    description: 'Dokončil/a 10 ranních tréninků (před 9:00)',
    icon: 'sunrise',
    color: '#F97316',
    category: 'consistency',
    criteria: { type: 'morning_sessions', value: 10 },
  },
  {
    name: 'Víkendový válečník',
    description: 'Dokončil/a 5 víkendových tréninků',
    icon: 'swords',
    color: '#3B82F6',
    category: 'consistency',
    criteria: { type: 'weekend_sessions', value: 5 },
  },
  {
    name: 'Cílová váha',
    description: 'Dosáhl/a své cílové váhy',
    icon: 'target',
    color: '#22C55E',
    category: 'progress',
    criteria: { type: 'weight_goal', value: 1 },
  },
  {
    name: 'Sledovač pokroku',
    description: 'Zaznamenal/a 5 měření',
    icon: 'ruler',
    color: '#06B6D4',
    category: 'progress',
    criteria: { type: 'measurement_logged', value: 5 },
  },
] as const

/**
 * Check if a client has earned a specific badge
 */
export async function checkBadgeCriteria(
  clientId: string,
  criteria: BadgeCriteria
): Promise<boolean> {
  switch (criteria.type) {
    case 'first_session':
    case 'sessions_completed': {
      const count = await prisma.session.count({
        where: {
          clientId,
          status: 'completed',
        },
      })
      return count >= criteria.value
    }

    case 'morning_sessions': {
      const sessions = await prisma.session.findMany({
        where: {
          clientId,
          status: 'completed',
        },
        select: { scheduledAt: true },
      })
      const morningCount = sessions.filter((s) => {
        const hour = new Date(s.scheduledAt).getHours()
        return hour < 9
      }).length
      return morningCount >= criteria.value
    }

    case 'weekend_sessions': {
      const sessions = await prisma.session.findMany({
        where: {
          clientId,
          status: 'completed',
        },
        select: { scheduledAt: true },
      })
      const weekendCount = sessions.filter((s) => {
        const day = new Date(s.scheduledAt).getDay()
        return day === 0 || day === 6
      }).length
      return weekendCount >= criteria.value
    }

    case 'weight_goal': {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { currentWeight: true, targetWeight: true },
      })
      if (!client?.targetWeight || !client.currentWeight) return false
      return client.currentWeight <= client.targetWeight
    }

    case 'measurement_logged': {
      const count = await prisma.clientMeasurement.count({
        where: { clientId },
      })
      return count >= criteria.value
    }

    case 'consecutive_weeks': {
      // Check if client has trained for consecutive weeks
      const sessions = await prisma.session.findMany({
        where: {
          clientId,
          status: 'completed',
        },
        orderBy: { scheduledAt: 'desc' },
        select: { scheduledAt: true },
      })

      if (sessions.length === 0) return false

      // Group sessions by week
      const weeks = new Set<string>()
      sessions.forEach((s) => {
        const date = new Date(s.scheduledAt)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        weeks.add(weekStart.toISOString().split('T')[0])
      })

      // Check consecutive weeks
      const sortedWeeks = Array.from(weeks).sort().reverse()
      let consecutive = 0
      let lastWeek: Date | null = null

      for (const weekStr of sortedWeeks) {
        const week = new Date(weekStr)
        if (!lastWeek) {
          consecutive = 1
          lastWeek = week
        } else {
          const diff = (lastWeek.getTime() - week.getTime()) / (7 * 24 * 60 * 60 * 1000)
          if (Math.abs(diff - 1) < 0.1) {
            consecutive++
            lastWeek = week
          } else {
            break
          }
        }
      }

      return consecutive >= criteria.value
    }

    case 'credits_purchased': {
      const orders = await prisma.order.aggregate({
        where: {
          clientId,
          paymentStatus: 'paid',
        },
        _sum: { total: true },
      })
      return (orders._sum.total || 0) >= criteria.value
    }

    default:
      return false
  }
}

/**
 * Check and award badges for a specific client
 */
export async function checkAndAwardBadges(
  clientId: string,
  tenantId: string
): Promise<string[]> {
  const awardedBadges: string[] = []

  // Get all active badges for the tenant
  const badges = await prisma.badge.findMany({
    where: {
      tenantId,
      isActive: true,
    },
  })

  // Get badges the client already has
  const existingBadges = await prisma.clientBadge.findMany({
    where: { clientId },
    select: { badgeId: true },
  })
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId))

  // Check each badge
  for (const badge of badges) {
    // Skip if already earned
    if (existingBadgeIds.has(badge.id)) continue

    const criteria = badge.criteria as unknown as BadgeCriteria
    const earned = await checkBadgeCriteria(clientId, criteria)

    if (earned) {
      // Award the badge
      await prisma.clientBadge.create({
        data: {
          clientId,
          badgeId: badge.id,
          notified: false,
        },
      })
      awardedBadges.push(badge.name)
    }
  }

  return awardedBadges
}

/**
 * Check badges for all clients in a tenant
 */
export async function checkAllClientBadges(tenantId: string): Promise<{
  checked: number
  awarded: number
  details: Array<{ clientId: string; clientName: string; badges: string[] }>
}> {
  const clients = await prisma.client.findMany({
    where: { tenantId, status: 'active' },
    select: { id: true, name: true },
  })

  let totalAwarded = 0
  const details: Array<{ clientId: string; clientName: string; badges: string[] }> = []

  for (const client of clients) {
    const awarded = await checkAndAwardBadges(client.id, tenantId)
    if (awarded.length > 0) {
      totalAwarded += awarded.length
      details.push({
        clientId: client.id,
        clientName: client.name,
        badges: awarded,
      })
    }
  }

  return {
    checked: clients.length,
    awarded: totalAwarded,
    details,
  }
}

/**
 * Seed default badges for a tenant
 */
export async function seedDefaultBadges(tenantId: string): Promise<number> {
  let created = 0

  for (const badge of DEFAULT_BADGES) {
    const existing = await prisma.badge.findFirst({
      where: {
        tenantId,
        name: badge.name,
      },
    })

    if (!existing) {
      await prisma.badge.create({
        data: {
          tenantId,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          category: badge.category,
          criteria: badge.criteria,
          isActive: true,
        },
      })
      created++
    }
  }

  return created
}
