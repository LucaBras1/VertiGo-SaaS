/**
 * User Registration API Route
 * Handles new user signups
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

const signupSchema = z.object({
  name: z.string().min(1, 'Jméno je povinné'),
  email: z.string().email('Neplatný formát emailu'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  company: z.string().min(1, 'Název společnosti je povinný'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Uživatel s tímto emailem již existuje.',
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'user',
      },
    })

    // Create customer record for organization tracking
    await prisma.customer.create({
      data: {
        email: validatedData.email,
        firstName: validatedData.name.split(' ')[0] || validatedData.name,
        lastName: validatedData.name.split(' ').slice(1).join(' ') || '',
        organization: validatedData.company,
      },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: user.email,
      name: user.name || validatedData.name,
      companyName: validatedData.company,
    }).catch((err) => {
      console.error('Failed to send welcome email:', err)
    })

    console.log('New user registration:', {
      userId: user.id,
      email: user.email,
      company: validatedData.company,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Účet byl úspěšně vytvořen. Nyní se můžete přihlásit.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Nepodařilo se vytvořit účet. Zkuste to prosím znovu.',
      },
      { status: 500 }
    )
  }
}
