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

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant nenalezen' }, { status: 404 })
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        website: tenant.website,
      },
    })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json({ error: 'Chyba při načítání nastavení' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nemáte oprávnění měnit nastavení firmy' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { tenantName, address, phone, ico, dic } = body

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        ...(tenantName && { name: tenantName }),
        ...(phone && { phone }),
      },
    })

    return NextResponse.json({
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        phone: updatedTenant.phone,
      },
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci nastavení' }, { status: 500 })
  }
}
