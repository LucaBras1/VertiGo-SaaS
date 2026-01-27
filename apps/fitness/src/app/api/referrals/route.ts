import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getReferralStats } from '@/lib/referrals/reward-processor'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const referrerId = searchParams.get('referrerId')
    const includeStats = searchParams.get('includeStats') === 'true'

    const referrals = await prisma.referral.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && { status }),
        ...(referrerId && { referrerId }),
      },
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
      orderBy: { createdAt: 'desc' },
    })

    let stats = null
    if (includeStats) {
      stats = await getReferralStats(session.user.tenantId)
    }

    return NextResponse.json({
      referrals,
      stats,
    })
  } catch (error) {
    console.error('Referrals fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}
