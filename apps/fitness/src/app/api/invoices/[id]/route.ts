import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Faktura nenalezena' }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Chyba při načítání faktury' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Faktura nenalezena' }, { status: 404 })
    }

    const body = await req.json()
    const { status, paidDate, notes } = body

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(paidDate !== undefined && { paidDate: paidDate ? new Date(paidDate) : null }),
        ...(notes !== undefined && { notes: notes || null }),
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

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci faktury' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Faktura nenalezena' }, { status: 404 })
    }

    if (existingInvoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Nelze smazat zaplacenou fakturu' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Chyba při mazání faktury' }, { status: 500 })
  }
}
