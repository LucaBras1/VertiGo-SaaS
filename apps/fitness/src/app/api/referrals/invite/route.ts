import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReferralInvitation } from '@/lib/referrals/code-generator'
import { getReferralSettings } from '@/lib/referrals/reward-processor'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const inviteSchema = z.object({
  referrerId: z.string().min(1),
  referredEmail: z.string().email().optional(),
  referredName: z.string().max(100).optional(),
  referredPhone: z.string().max(20).optional(),
  sendEmail: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = inviteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { referrerId, referredEmail, referredName, referredPhone, sendEmail: shouldSendEmail } = result.data

    // Verify referrer belongs to tenant
    const referrer = await prisma.client.findFirst({
      where: {
        id: referrerId,
        tenantId: session.user.tenantId,
      },
    })

    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      )
    }

    // Get settings
    const settings = await getReferralSettings(session.user.tenantId)

    // Check max referrals limit
    if (settings.maxReferralsPerClient) {
      const existingCount = await prisma.referral.count({
        where: {
          referrerId,
          tenantId: session.user.tenantId,
        },
      })

      if (existingCount >= settings.maxReferralsPerClient) {
        return NextResponse.json(
          { error: 'Referral limit reached for this client' },
          { status: 400 }
        )
      }
    }

    // Create referral invitation
    const { referral } = await createReferralInvitation({
      tenantId: session.user.tenantId,
      referrerId,
      referredEmail,
      referredName,
      referredPhone,
      expiresInDays: settings.referralCodeExpiry || undefined,
      source: 'email',
    })

    // Send invitation email if requested and email provided
    if (shouldSendEmail && referredEmail && settings.sendReferralEmails) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
      })

      await sendEmail({
        to: referredEmail,
        subject: `${referrer.name} vas zve do ${tenant?.name || 'FitAdmin'}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Mate pozvani!</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Dobry den${referredName ? `, ${referredName}` : ''}!</p>
                <p><strong>${referrer.name}</strong> vas zve, abyste se pripojili k ${tenant?.name || 'nasemu fitness studiu'}.</p>

                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #10B981;">
                  <p style="margin: 0 0 10px 0; color: #666;">Vas kod pro registraci:</p>
                  <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #10B981; margin: 0;">
                    ${referral.referralCode}
                  </p>
                </div>

                ${settings.referredRewardValue > 0 ? `
                <p style="text-align: center; color: #10B981; font-weight: 600;">
                  Ziskejte ${settings.referredRewardType === 'credits' ? `${settings.referredRewardValue} kreditu zdarma` : `${settings.referredRewardValue}% slevu`} pri registraci!
                </p>
                ` : ''}

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">${tenant?.name || 'FitAdmin'}</p>
              </div>
            </body>
          </html>
        `,
      })
    }

    // Fetch full referral details
    const fullReferral = await prisma.referral.findUnique({
      where: { id: referral.id },
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(fullReferral, { status: 201 })
  } catch (error) {
    console.error('Referral invite error:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
