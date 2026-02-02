import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createInvoiceCheckoutSession } from '@/lib/stripe'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Fetch invoice with tenant validation and customer info
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: session.user.tenantId,
      },
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

    // Validate invoice is not already paid
    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice has already been paid' },
        { status: 400 }
      )
    }

    // Validate invoice has amount
    if (!invoice.totalAmount || invoice.totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invoice does not have a valid amount' },
        { status: 400 }
      )
    }

    // Calculate remaining amount (totalAmount - paidAmount)
    const remainingAmount = invoice.totalAmount - invoice.paidAmount

    if (remainingAmount <= 0) {
      return NextResponse.json(
        { error: 'Invoice has no remaining balance' },
        { status: 400 }
      )
    }

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
    const successUrl = `${baseUrl}/dashboard/payments/success?type=invoice&invoiceId=${invoiceId}`
    const cancelUrl = `${baseUrl}/dashboard/payments/cancel?type=invoice&invoiceId=${invoiceId}`

    // Create Stripe checkout session
    const checkoutSession = await createInvoiceCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: remainingAmount / 100, // Convert from cents to CZK for the library
      customerId: invoice.customerId,
      customerEmail: invoice.customer.email || undefined,
      tenantId: session.user.tenantId,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating invoice checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
