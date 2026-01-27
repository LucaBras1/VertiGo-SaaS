import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyReferralRewards } from '@/lib/referrals/reward-processor'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify referral belongs to tenant
    const referral = await prisma.referral.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    if (referral.status !== 'qualified') {
      return NextResponse.json(
        { error: 'Referral is not qualified for rewards' },
        { status: 400 }
      )
    }

    const result = await applyReferralRewards(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Fetch updated referral
    const updatedReferral = await prisma.referral.findUnique({
      where: { id },
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      referral: updatedReferral,
      rewards: {
        referrer: result.referrerReward,
        referred: result.referredReward,
      },
    })
  } catch (error) {
    console.error('Apply referral rewards error:', error)
    return NextResponse.json(
      { error: 'Failed to apply rewards' },
      { status: 500 }
    )
  }
}
