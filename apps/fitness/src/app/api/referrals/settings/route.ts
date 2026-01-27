import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReferralSettings, updateReferralSettings } from '@/lib/referrals/reward-processor'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  isActive: z.boolean().optional(),
  referrerRewardType: z.enum(['credits', 'discount', 'cash']).optional(),
  referrerRewardValue: z.number().int().min(0).optional(),
  referredRewardType: z.enum(['credits', 'discount', 'cash']).optional(),
  referredRewardValue: z.number().int().min(0).optional(),
  qualificationCriteria: z.enum(['signup', 'first_session', 'first_payment']).optional(),
  maxReferralsPerClient: z.number().int().min(1).optional().nullable(),
  referralCodeExpiry: z.number().int().min(1).optional().nullable(),
  sendReferralEmails: z.boolean().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getReferralSettings(session.user.tenantId)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Referral settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = updateSettingsSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const settings = await updateReferralSettings(
      session.user.tenantId,
      result.data
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Referral settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
