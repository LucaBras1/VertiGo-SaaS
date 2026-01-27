import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueReferralCode } from '@/lib/referrals/code-generator'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: clientId } = await params

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        name: true,
        referralCode: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Generate new unique code
    const newCode = await generateUniqueReferralCode({
      prefix: client.name.substring(0, 3).toUpperCase(),
    })

    // Update client with new code
    await prisma.client.update({
      where: { id: clientId },
      data: { referralCode: newCode },
    })

    // Update any pending referrals with new code
    await prisma.referral.updateMany({
      where: {
        referrerId: clientId,
        status: 'pending',
      },
      data: {
        referralCode: newCode,
      },
    })

    return NextResponse.json({
      clientId,
      referralCode: newCode,
      message: 'Referral code regenerated successfully',
    })
  } catch (error) {
    console.error('Regenerate referral code error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate referral code' },
      { status: 500 }
    )
  }
}
