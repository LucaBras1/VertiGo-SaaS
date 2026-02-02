import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createInvoiceCheckoutSession } from '@/lib/stripe'

// Force dynamic - prevent prerendering during build
export const dynamic = 'force-dynamic'

// POST /api/payments/create-invoice-checkout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Fetch the invoice with customer details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009'
    const successUrl = `${baseUrl}/admin/invoices/${invoiceId}?payment=success`
    const cancelUrl = `${baseUrl}/admin/invoices/${invoiceId}?payment=cancelled`

    const checkoutSession = await createInvoiceCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: Number(invoice.totalAmount),
      customerId: invoice.customerId,
      customerEmail: invoice.customer?.email || undefined,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
    })
  } catch (error) {
    console.error('Error creating invoice checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
