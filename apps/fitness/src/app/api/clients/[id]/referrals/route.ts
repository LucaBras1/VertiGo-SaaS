import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: clientId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get referrals made by this client
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: clientId,
        tenantId: session.user.tenantId,
        ...(status && { status }),
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      signedUp: referrals.filter(r => r.status === 'signed_up').length,
      qualified: referrals.filter(r => r.status === 'qualified').length,
      rewarded: referrals.filter(r => r.status === 'rewarded').length,
      expired: referrals.filter(r => r.status === 'expired').length,
    }

    return NextResponse.json({
      referrals,
      stats,
    })
  } catch (error) {
    console.error('Get client referrals error:', error)
    return NextResponse.json(
      { error: 'Failed to get referrals' },
      { status: 500 }
    )
  }
}
