import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createInvoiceCheckoutSession } from '@/lib/stripe'

const checkoutSchema = z.object({
  invoiceId: z.string().min(1),
})

/**
 * POST /api/payments/create-invoice-checkout
 *
 * Create a Stripe Checkout session for invoice payment
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { invoiceId } = checkoutSchema.parse(body)

    // Verify invoice exists, belongs to tenant, and is unpaid
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: session.user.tenantId,
        status: {
          in: ['draft', 'sent', 'overdue'],
        },
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Faktura nenalezena nebo již zaplacena' },
        { status: 404 }
      )
    }

    // Get base URL for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3006'

    // Create Stripe checkout session
    const checkoutSession = await createInvoiceCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      clientId: invoice.client.id,
      tenantId: session.user.tenantId,
      successUrl: `${origin}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}&type=invoice`,
      cancelUrl: `${origin}/dashboard/invoices/${invoice.id}?cancelled=true`,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating invoice checkout session:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření platby' },
      { status: 500 }
    )
  }
}
