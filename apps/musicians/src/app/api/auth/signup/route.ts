import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
const signupSchema = z.object({
  bandName: z.string().min(2, 'Band name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Generate unique slug for tenant
    let slug = slugify(validatedData.bandName)
    let slugExists = await prisma.tenant.findUnique({ where: { slug } })
    let counter = 1
    while (slugExists) {
      slug = `${slugify(validatedData.bandName)}-${counter}`
      slugExists = await prisma.tenant.findUnique({ where: { slug } })
      counter++
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.bandName,
          slug,
          vertical: 'MUSICIANS',
          bandName: validatedData.bandName,
          email: validatedData.email,
          plan: 'starter',
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.bandName,
          role: 'admin',
          tenantId: tenant.id,
        }
      })

      return { tenant, user }
    })

    // Send welcome email (non-blocking, don't fail registration if email fails)
    const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`
    sendWelcomeEmail({
      to: result.user.email,
      name: result.user.name || validatedData.bandName,
      loginUrl,
    }).catch((err) => {
      console.warn('Welcome email not sent:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
