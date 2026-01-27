import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code || code.length < 4) {
      return NextResponse.json(
        { valid: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Find referral by code
    const referral = await prisma.referral.findFirst({
      where: {
        referralCode: code.toUpperCase(),
        status: 'pending',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        referrer: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!referral) {
      // Also check if it's a client's permanent referral code
      const client = await prisma.client.findFirst({
        where: {
          referralCode: code.toUpperCase(),
        },
        select: {
          id: true,
          name: true,
          tenantId: true,
        },
      })

      if (client) {
        // Get tenant settings
        const settings = await prisma.referralSettings.findUnique({
          where: { tenantId: client.tenantId },
        })

        if (!settings?.isActive) {
          return NextResponse.json({
            valid: false,
            error: 'Referral program is not active',
          })
        }

        // Get tenant info
        const tenant = await prisma.tenant.findUnique({
          where: { id: client.tenantId },
          select: {
            name: true,
          },
        })

        return NextResponse.json({
          valid: true,
          referrer: {
            name: client.name,
          },
          tenant: {
            name: tenant?.name,
          },
          reward: settings.referredRewardValue > 0 ? {
            type: settings.referredRewardType,
            value: settings.referredRewardValue,
          } : null,
        })
      }

      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired referral code',
      })
    }

    // Get tenant info and settings
    const [tenant, settings] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: referral.tenantId },
        select: { name: true },
      }),
      prisma.referralSettings.findUnique({
        where: { tenantId: referral.tenantId },
      }),
    ])

    if (!settings?.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'Referral program is not active',
      })
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        name: referral.referrer.name,
      },
      tenant: {
        name: tenant?.name,
      },
      reward: settings.referredRewardValue > 0 ? {
        type: settings.referredRewardType,
        value: settings.referredRewardValue,
      } : null,
    })
  } catch (error) {
    console.error('Public referral validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}
