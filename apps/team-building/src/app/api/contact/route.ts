/**
 * Contact Form API Route
 * Handles contact form submissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Jméno je povinné'),
  email: z.string().email('Neplatný formát emailu'),
  phone: z.string().optional(),
  inquiryType: z.enum(['general', 'sales', 'support', 'partnership', 'other']),
  message: z.string().min(10, 'Zpráva musí mít alespoň 10 znaků'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = contactSchema.parse(body)

    // In production, you would:
    // 1. Store in database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user

    // For now, we'll log and return success
    console.log('Contact form submission:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })

    // TODO: Implement email sending with nodemailer or similar
    // const emailSent = await sendContactEmail(validatedData)

    return NextResponse.json({
      success: true,
      message: 'Vaše zpráva byla úspěšně odeslána. Ozveme se vám co nejdříve.',
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

    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.',
      },
      { status: 500 }
    )
  }
}
