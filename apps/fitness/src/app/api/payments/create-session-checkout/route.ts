import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createSessionCheckoutSession } from '@/lib/stripe'

const checkoutSchema = z.object({
  sessionId: z.string().min(1),
})

/**
 * POST /api/payments/create-session-checkout
 *
 * Create a Stripe Checkout session for training session payment
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = checkoutSchema.parse(body)

    // Verify session exists, belongs to tenant, and is unpaid
    const trainingSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        tenantId: session.user.tenantId,
        paid: false,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!trainingSession) {
      return NextResponse.json(
        { error: 'Session nenalezen nebo již zaplacen' },
        { status: 404 }
      )
    }

    if (!trainingSession.price) {
      return NextResponse.json(
        { error: 'Session nemá nastavenou cenu' },
        { status: 400 }
      )
    }

    // Format date for display
    const sessionDate = format(
      new Date(trainingSession.scheduledAt),
      'dd.MM.yyyy HH:mm',
      { locale: cs }
    )

    // Get base URL for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3006'

    // Create Stripe checkout session
    const checkoutSession = await createSessionCheckoutSession({
      sessionId: trainingSession.id,
      sessionDate,
      price: trainingSession.price,
      clientId: trainingSession.client.id,
      tenantId: session.user.tenantId,
      successUrl: `${origin}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}&type=session`,
      cancelUrl: `${origin}/dashboard/sessions?cancelled=true`,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating session checkout session:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření platby' },
      { status: 500 }
    )
  }
}
