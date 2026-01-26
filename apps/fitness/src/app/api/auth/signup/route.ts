import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Vertical } from '@/generated/prisma'
import { sendWelcomeEmail } from '@/lib/email'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  studioName: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, studioName } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto emailem již existuje' },
        { status: 400 }
      )
    }

    // Create slug from studio name
    const slug = studioName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          vertical: Vertical.FITNESS,
          name: studioName,
          slug: finalSlug,
          subscriptionTier: 'free',
          aiCredits: 100,
        },
      })

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          password: hashedPassword,
          role: 'admin',
        },
      })

      return { tenant, user }
    })

    // Send welcome email
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3006'
      await sendWelcomeEmail({
        to: email,
        name: name,
        loginUrl: `${baseUrl}/auth/signin`,
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    return NextResponse.json({
      message: 'Registrace úspěšná',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba při registraci' },
      { status: 500 }
    )
  }
}
