/**
 * Referral Reward Processor
 *
 * Handles qualification, reward calculation, and reward application.
 */

import { prisma } from '@/lib/prisma'

export type RewardType = 'credits' | 'discount' | 'cash'
export type QualificationCriteria = 'signup' | 'first_session' | 'first_payment'

interface ReferralReward {
  type: RewardType
  value: number
  description: string
}

/**
 * Get referral settings for a tenant
 */
export async function getReferralSettings(tenantId: string) {
  let settings = await prisma.referralSettings.findUnique({
    where: { tenantId },
  })

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.referralSettings.create({
      data: {
        tenantId,
        isActive: true,
        referrerRewardType: 'credits',
        referrerRewardValue: 1,
        referredRewardType: 'discount',
        referredRewardValue: 10,
        qualificationCriteria: 'first_session',
        sendReferralEmails: true,
      },
    })
  }

  return settings
}

/**
 * Update referral settings
 */
export async function updateReferralSettings(
  tenantId: string,
  data: {
    isActive?: boolean
    referrerRewardType?: RewardType
    referrerRewardValue?: number
    referredRewardType?: RewardType
    referredRewardValue?: number
    qualificationCriteria?: QualificationCriteria
    maxReferralsPerClient?: number | null
    referralCodeExpiry?: number | null
    sendReferralEmails?: boolean
  }
) {
  return prisma.referralSettings.upsert({
    where: { tenantId },
    update: data,
    create: {
      tenantId,
      ...data,
    },
  })
}

/**
 * Mark referral as signed up (new client registered)
 */
export async function markReferralSignedUp(
  referralId: string,
  referredClientId: string
): Promise<void> {
  await prisma.referral.update({
    where: { id: referralId },
    data: {
      status: 'signed_up',
      referredId: referredClientId,
      signedUpAt: new Date(),
    },
  })
}

/**
 * Check and qualify a referral based on criteria
 */
export async function checkAndQualifyReferral(
  referralId: string,
  event: 'first_session' | 'first_payment'
): Promise<boolean> {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referred: true,
    },
  })

  if (!referral || referral.status !== 'signed_up') {
    return false
  }

  const settings = await getReferralSettings(referral.tenantId)

  // Check if this event qualifies the referral
  if (
    (settings.qualificationCriteria === 'first_session' && event === 'first_session') ||
    (settings.qualificationCriteria === 'first_payment' && event === 'first_payment')
  ) {
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'qualified',
        qualifiedAt: new Date(),
        referrerReward: {
          type: settings.referrerRewardType,
          value: settings.referrerRewardValue,
          description: getRewardDescription(
            settings.referrerRewardType,
            settings.referrerRewardValue
          ),
        },
        referredReward: {
          type: settings.referredRewardType,
          value: settings.referredRewardValue,
          description: getRewardDescription(
            settings.referredRewardType,
            settings.referredRewardValue
          ),
        },
      },
    })

    return true
  }

  return false
}

/**
 * Apply rewards for a qualified referral
 */
export async function applyReferralRewards(referralId: string): Promise<{
  success: boolean
  referrerReward?: ReferralReward
  referredReward?: ReferralReward
  error?: string
}> {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      referrer: true,
      referred: true,
    },
  })

  if (!referral || referral.status !== 'qualified') {
    return { success: false, error: 'Referral not qualified for rewards' }
  }

  const referrerReward = referral.referrerReward as ReferralReward | null
  const referredReward = referral.referredReward as ReferralReward | null

  // Apply referrer reward
  if (referrerReward && !referral.referrerRewardApplied) {
    await applyReward(referral.referrer.id, referrerReward)
    await prisma.referral.update({
      where: { id: referralId },
      data: { referrerRewardApplied: true },
    })
  }

  // Apply referred reward
  if (referredReward && referral.referred && !referral.referredRewardApplied) {
    await applyReward(referral.referred.id, referredReward)
    await prisma.referral.update({
      where: { id: referralId },
      data: { referredRewardApplied: true },
    })
  }

  // Update status to rewarded
  await prisma.referral.update({
    where: { id: referralId },
    data: {
      status: 'rewarded',
      rewardedAt: new Date(),
    },
  })

  return {
    success: true,
    referrerReward: referrerReward || undefined,
    referredReward: referredReward || undefined,
  }
}

/**
 * Apply a reward to a client
 */
async function applyReward(clientId: string, reward: ReferralReward): Promise<void> {
  switch (reward.type) {
    case 'credits':
      await prisma.client.update({
        where: { id: clientId },
        data: {
          creditsRemaining: { increment: reward.value },
        },
      })
      break

    case 'discount':
      // Store discount for next purchase
      // This would typically be handled by a separate discount/coupon system
      // For now, we'll add it to client metadata or notes
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { notes: true },
      })

      await prisma.client.update({
        where: { id: clientId },
        data: {
          notes: `${client?.notes || ''}\n[Referral Discount: ${reward.value}% off next purchase]`.trim(),
        },
      })
      break

    case 'cash':
      // Cash rewards would typically be handled through manual payout
      // Log it for now
      console.log(`Cash reward of ${reward.value} CZK pending for client ${clientId}`)
      break
  }
}

/**
 * Get reward description
 */
function getRewardDescription(type: string, value: number): string {
  switch (type) {
    case 'credits':
      return `${value} kredit${value === 1 ? '' : value < 5 ? 'y' : 'u'} zdarma`
    case 'discount':
      return `${value}% sleva na dalsi nakup`
    case 'cash':
      return `${value} CZK bonus`
    default:
      return `Odmena: ${value}`
  }
}

/**
 * Get referral statistics for a tenant
 */
export async function getReferralStats(tenantId: string) {
  const [totalReferrals, pendingReferrals, qualifiedReferrals, rewardedReferrals] =
    await Promise.all([
      prisma.referral.count({ where: { tenantId } }),
      prisma.referral.count({ where: { tenantId, status: 'pending' } }),
      prisma.referral.count({ where: { tenantId, status: 'qualified' } }),
      prisma.referral.count({ where: { tenantId, status: 'rewarded' } }),
    ])

  // Get top referrers
  const topReferrers = await prisma.referral.groupBy({
    by: ['referrerId'],
    where: {
      tenantId,
      status: { in: ['qualified', 'rewarded'] },
    },
    _count: true,
    orderBy: { _count: { referrerId: 'desc' } },
    take: 10,
  })

  // Get referrer details
  const referrerIds = topReferrers.map((r) => r.referrerId)
  const referrers = await prisma.client.findMany({
    where: { id: { in: referrerIds } },
    select: { id: true, name: true, email: true },
  })

  const topReferrersWithDetails = topReferrers.map((r) => ({
    ...referrers.find((ref) => ref.id === r.referrerId),
    referralCount: r._count,
  }))

  return {
    total: totalReferrals,
    pending: pendingReferrals,
    qualified: qualifiedReferrals,
    rewarded: rewardedReferrals,
    conversionRate:
      totalReferrals > 0 ? ((qualifiedReferrals + rewardedReferrals) / totalReferrals) * 100 : 0,
    topReferrers: topReferrersWithDetails,
  }
}

/**
 * Get referrals made by a specific client
 */
export async function getClientReferrals(clientId: string, tenantId: string) {
  return prisma.referral.findMany({
    where: {
      referrerId: clientId,
      tenantId,
    },
    include: {
      referred: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
