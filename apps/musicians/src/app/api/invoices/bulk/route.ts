import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})

// POST /api/invoices/bulk - Bulk delete
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = bulkDeleteSchema.parse(body)

    // Check if any invoices are paid
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
        status: 'paid',
      },
      select: { id: true, invoiceNumber: true },
    })

    if (paidInvoices.length > 0) {
      const numbers = paidInvoices.map(i => i.invoiceNumber).join(', ')
      return NextResponse.json({
        error: `Nelze smazat zaplacené faktury: ${numbers}`,
        paidInvoices: paidInvoices.map(i => i.id),
      }, { status: 400 })
    }

    const result = await prisma.invoice.deleteMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
        status: { not: 'paid' },
      },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Bulk delete invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/invoices/bulk - Bulk status update
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, status } = bulkUpdateSchema.parse(body)

    const updateData: Record<string, unknown> = { status }

    // If marking as paid, set paid date
    if (status === 'paid') {
      updateData.paidDate = new Date()
    }

    const result = await prisma.invoice.updateMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Bulk update invoices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
