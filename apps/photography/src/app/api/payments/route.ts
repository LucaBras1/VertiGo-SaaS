import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createDepositCheckoutSession,
  createBalanceCheckoutSession,
  createFullPaymentCheckoutSession,
  createInvoiceCheckoutSession,
  toSmallestUnit,
} from '@/lib/stripe'

export const dynamic = 'force-dynamic'

// GET - List payments for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const packageId = searchParams.get('packageId')
    const invoiceId = searchParams.get('invoiceId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    }

    if (packageId) where.packageId = packageId
    if (invoiceId) where.invoiceId = invoiceId
    if (status) where.status = status

    const payments = await prisma.payment.findMany({
      where,
      include: {
        package: {
          select: { id: true, title: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('GET /api/payments error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST - Create checkout session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, packageId, invoiceId, amount, customAmount } = body

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3003'

    // Handle package payments
    if (packageId && ['deposit', 'balance', 'full'].includes(type)) {
      const pkg = await prisma.package.findFirst({
        where: {
          id: packageId,
          tenantId: session.user.tenantId,
        },
        include: {
          client: true,
        },
      })

      if (!pkg || !pkg.client) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      }

      let checkoutSession
      const successUrl = `${baseUrl}/dashboard/packages/${packageId}?payment=success`
      const cancelUrl = `${baseUrl}/dashboard/packages/${packageId}?payment=cancelled`

      if (type === 'deposit') {
        const depositAmount = customAmount || pkg.depositAmount || Math.round((pkg.totalPrice || 0) * 0.3)
        if (!depositAmount) {
          return NextResponse.json({ error: 'Deposit amount not set' }, { status: 400 })
        }

        checkoutSession = await createDepositCheckoutSession({
          tenantId: session.user.tenantId,
          packageId: pkg.id,
          packageTitle: pkg.title,
          clientEmail: pkg.client.email,
          clientName: pkg.client.name,
          depositAmount: toSmallestUnit(depositAmount),
          successUrl,
          cancelUrl,
        })
      } else if (type === 'balance') {
        const depositPaid = pkg.depositAmount || 0
        const balanceAmount = customAmount || (pkg.totalPrice || 0) - depositPaid
        if (balanceAmount <= 0) {
          return NextResponse.json({ error: 'No balance to pay' }, { status: 400 })
        }

        checkoutSession = await createBalanceCheckoutSession({
          tenantId: session.user.tenantId,
          packageId: pkg.id,
          packageTitle: pkg.title,
          clientEmail: pkg.client.email,
          clientName: pkg.client.name,
          balanceAmount: toSmallestUnit(balanceAmount),
          successUrl,
          cancelUrl,
        })
      } else {
        const totalAmount = customAmount || pkg.totalPrice
        if (!totalAmount) {
          return NextResponse.json({ error: 'Total price not set' }, { status: 400 })
        }

        checkoutSession = await createFullPaymentCheckoutSession({
          tenantId: session.user.tenantId,
          packageId: pkg.id,
          packageTitle: pkg.title,
          clientEmail: pkg.client.email,
          clientName: pkg.client.name,
          totalAmount: toSmallestUnit(totalAmount),
          successUrl,
          cancelUrl,
        })
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          tenantId: session.user.tenantId,
          packageId: pkg.id,
          stripeSessionId: checkoutSession.sessionId,
          amount: toSmallestUnit(amount || customAmount || pkg.totalPrice || 0),
          currency: 'CZK',
          status: 'PENDING',
          type: type.toUpperCase() as 'DEPOSIT' | 'BALANCE' | 'FULL',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${pkg.title}`,
        },
      })

      return NextResponse.json({
        sessionId: checkoutSession.sessionId,
        url: checkoutSession.url,
      })
    }

    // Handle invoice payments
    if (invoiceId && type === 'invoice') {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          tenantId: session.user.tenantId,
        },
        include: {
          client: true,
        },
      })

      if (!invoice || !invoice.client) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      const successUrl = `${baseUrl}/dashboard/invoices/${invoiceId}?payment=success`
      const cancelUrl = `${baseUrl}/dashboard/invoices/${invoiceId}?payment=cancelled`

      const checkoutSession = await createInvoiceCheckoutSession({
        tenantId: session.user.tenantId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        amount: toSmallestUnit(invoice.total),
        successUrl,
        cancelUrl,
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          tenantId: session.user.tenantId,
          invoiceId: invoice.id,
          stripeSessionId: checkoutSession.sessionId,
          amount: toSmallestUnit(invoice.total),
          currency: 'CZK',
          status: 'PENDING',
          type: 'INVOICE',
          description: `Invoice ${invoice.invoiceNumber}`,
        },
      })

      return NextResponse.json({
        sessionId: checkoutSession.sessionId,
        url: checkoutSession.url,
      })
    }

    return NextResponse.json({ error: 'Invalid payment request' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/payments error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
