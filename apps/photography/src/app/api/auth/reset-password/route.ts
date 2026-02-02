import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// POST /api/auth/reset-password
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: 'Password reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user password (passwordHash in ShootFlow schema)
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash: hashedPassword },
    })

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { token },
    })

    return NextResponse.json({
      message: 'Password has been changed successfully. You can now sign in.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
