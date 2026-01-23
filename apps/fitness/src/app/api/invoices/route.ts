import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Chyba při načítání faktur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, dueDate, items, notes, subtotal, tax, total } = body

    if (!clientId || !dueDate || !items || items.length === 0) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Generate invoice number
    const year = new Date().getFullYear()
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId: session.user.tenantId,
        invoiceNumber: {
          startsWith: `${year}`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    })

    let nextNumber = 1
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4))
      nextNumber = lastNumber + 1
    }
    const invoiceNumber = `${year}${String(nextNumber).padStart(4, '0')}`

    // Store items in notes for now (schema doesn't have items field)
    const itemsDescription = items
      .map((item: { description: string; quantity: number; unitPrice: number }) =>
        `${item.description} (${item.quantity}x ${item.unitPrice} Kč)`
      )
      .join(', ')

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: session.user.tenantId,
        clientId,
        invoiceNumber,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        notes: notes ? `${notes}\n\nPoložky: ${itemsDescription}` : `Položky: ${itemsDescription}`,
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Chyba při vytváření faktury' }, { status: 500 })
  }
}
