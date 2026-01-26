import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/payments/history
 *
 * Get payment history for the tenant
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get invoice payments
    const invoicePayments = await prisma.invoicePayment.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: 'COMPLETED',
      },
      include: {
        invoice: {
          include: {
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Get paid orders (package purchases)
    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.user.tenantId,
        paymentStatus: 'paid',
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Combine and format payments
    const payments = [
      ...invoicePayments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        method: payment.method,
        status: 'paid' as const,
        createdAt: payment.createdAt,
        clientName: payment.invoice.client.name,
        description: `Faktura ${payment.invoice.invoiceNumber}`,
      })),
      ...orders.map((order) => ({
        id: order.id,
        amount: order.total,
        currency: 'CZK',
        method: order.paymentMethod || 'STRIPE',
        status: 'paid' as const,
        createdAt: order.createdAt,
        clientName: order.client.name,
        description: `Objednávka ${order.orderNumber}`,
      })),
    ]

    // Sort by date
    payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json({
      payments: payments.slice(0, limit),
      total: payments.length,
    })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání plateb' },
      { status: 500 }
    )
  }
}
