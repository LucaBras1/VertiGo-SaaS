import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPackageCheckoutSession } from '@/lib/stripe'

const checkoutSchema = z.object({
  packageId: z.string().min(1),
  clientId: z.string().min(1),
})

// POST /api/payments/create-checkout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { packageId, clientId } = checkoutSchema.parse(body)

    // Verify package exists and belongs to tenant
    const pkg = await prisma.package.findFirst({
      where: {
        id: packageId,
        tenantId: session.user.tenantId,
        isActive: true,
      },
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Balíček nenalezen' }, { status: 404 })
    }

    // Verify client exists and belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Get base URL for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3006'

    // Create Stripe checkout session
    const checkoutSession = await createPackageCheckoutSession({
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      credits: pkg.credits,
      clientId: client.id,
      tenantId: session.user.tenantId,
      successUrl: `${origin}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/dashboard/packages?cancelled=true`,
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
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření platby' },
      { status: 500 }
    )
  }
}
