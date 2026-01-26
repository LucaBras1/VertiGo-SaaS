/**
 * Demo Request API Route
 * Handles demo scheduling requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const demoRequestSchema = z.object({
  name: z.string().min(1, 'Jméno je povinné'),
  email: z.string().email('Neplatný formát emailu'),
  company: z.string().min(1, 'Název společnosti je povinný'),
  teamSize: z.enum(['1-10', '10-50', '50-200', '200-1000', '1000+']),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = demoRequestSchema.parse(body)

    // In production, you would:
    // 1. Store in database (leads table)
    // 2. Send email notification to sales team
    // 3. Send confirmation email to requester
    // 4. Optionally integrate with CRM (HubSpot, Salesforce, etc.)

    console.log('Demo request submission:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    })

    // TODO: Implement CRM integration and email notifications
    // await createLead(validatedData)
    // await sendDemoRequestNotification(validatedData)
    // await sendDemoConfirmationEmail(validatedData)

    return NextResponse.json({
      success: true,
      message: 'Děkujeme za váš zájem! Ozveme se vám do 24 hodin pro domluvení termínu.',
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

    console.error('Demo request error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Nepodařilo se odeslat požadavek. Zkuste to prosím znovu.',
      },
      { status: 500 }
    )
  }
}
