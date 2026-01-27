import { NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/referrals/code-generator'

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

    const result = await validateReferralCode(code.toUpperCase())

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        referrer: {
          name: result.referral?.referrerName,
        },
      })
    }

    return NextResponse.json({
      valid: false,
      error: result.error,
    })
  } catch (error) {
    console.error('Referral code validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    )
  }
}
