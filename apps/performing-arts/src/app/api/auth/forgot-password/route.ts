import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a reset link has been sent',
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset Your Password',
    //   template: 'password-reset',
    //   data: { resetUrl, name: user.name },
    // })

    console.log(`Password reset token for ${email}: ${token}`)

    return NextResponse.json({
      message: 'If an account exists, a reset link has been sent',
    })
  } catch (error) {
    console.error('Forgot password error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
