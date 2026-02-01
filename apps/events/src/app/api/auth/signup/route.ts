import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, companyName } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create slug from company name or email
    const baseName = companyName || email.split('@')[0]
    const slug = baseName
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
          name: companyName || `${name}'s Events`,
          slug: finalSlug,
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
        },
      })

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          passwordHash: hashedPassword,
          role: 'admin',
        },
      })

      return { tenant, user }
    })

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
