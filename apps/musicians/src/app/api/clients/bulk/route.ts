import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'


// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

// POST /api/clients/bulk - Bulk delete
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = bulkDeleteSchema.parse(body)

    // Check if any clients have invoices
    const clientsWithInvoices = await prisma.customer.findMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
        invoices: { some: {} },
      },
      select: { id: true, firstName: true, lastName: true },
    })

    if (clientsWithInvoices.length > 0) {
      const names = clientsWithInvoices.map(c => `${c.firstName} ${c.lastName}`).join(', ')
      return NextResponse.json({
        error: `Nelze smazat klienty s fakturami: ${names}`,
        clientsWithInvoices: clientsWithInvoices.map(c => c.id),
      }, { status: 400 })
    }

    const result = await prisma.customer.deleteMany({
      where: {
        id: { in: ids },
        tenantId: session.user.tenantId,
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
    console.error('Bulk delete clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
