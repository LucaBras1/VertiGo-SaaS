import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId: session.user.tenantId
      },
      include: {
        client: true,
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('GET /api/invoices error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      clientId,
      packageId,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      notes
    } = body

    if (!clientId || !items || !subtotal || !total) {
      return NextResponse.json(
        { error: 'Client ID, items, subtotal, and total are required' },
        { status: 400 }
      )
    }

    // Generate unique invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' }
    })

    const invoiceNumber = lastInvoice
      ? `INV-${(parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
      : 'INV-00001'

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: session.user.tenantId,
        clientId,
        packageId,
        invoiceNumber,
        status: 'DRAFT',
        items,
        subtotal,
        tax: tax || 0,
        total,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('POST /api/invoices error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
