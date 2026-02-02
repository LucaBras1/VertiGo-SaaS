import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDepositCheckoutSession } from '@/lib/stripe'


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

    const { gigId } = await req.json()

    if (!gigId) {
      return NextResponse.json(
        { error: 'Gig ID is required' },
        { status: 400 }
      )
    }

    // Fetch gig with tenant validation
    const gig = await prisma.gig.findFirst({
      where: {
        id: gigId,
        tenantId: session.user.tenantId,
      },
    })

    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      )
    }

    // Validate gig has deposit amount
    if (!gig.deposit || gig.deposit <= 0) {
      return NextResponse.json(
        { error: 'Gig does not have a deposit amount set' },
        { status: 400 }
      )
    }

    // Check if deposit is already paid
    if (gig.depositPaid) {
      return NextResponse.json(
        { error: 'Deposit has already been paid' },
        { status: 400 }
      )
    }

    // Check gig status - only confirmed gigs can have deposits paid
    if (gig.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Only confirmed gigs can accept deposit payments' },
        { status: 400 }
      )
    }

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
    const successUrl = `${baseUrl}/dashboard/payments/success?type=deposit&gigId=${gigId}`
    const cancelUrl = `${baseUrl}/dashboard/payments/cancel?type=deposit&gigId=${gigId}`

    // Create Stripe checkout session
    const checkoutSession = await createDepositCheckoutSession({
      gigId: gig.id,
      gigTitle: gig.title,
      depositAmount: gig.deposit / 100, // Convert from cents to CZK for the library
      clientEmail: gig.clientEmail || undefined,
      tenantId: session.user.tenantId,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating deposit checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
