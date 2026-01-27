import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    if (referral.status !== 'signed_up') {
      return NextResponse.json(
        { error: 'Referral must be in signed_up status to qualify' },
        { status: 400 }
      )
    }

    // Update referral status to qualified
    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: {
        status: 'qualified',
        qualifiedAt: new Date(),
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
    })

    return NextResponse.json(updatedReferral)
  } catch (error) {
    console.error('Qualify referral error:', error)
    return NextResponse.json(
      { error: 'Failed to qualify referral' },
      { status: 500 }
    )
  }
}
