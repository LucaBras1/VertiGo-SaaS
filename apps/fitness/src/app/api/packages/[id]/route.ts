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

    const packageItem = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!packageItem) {
      return NextResponse.json({ error: 'Balíček nenalezen' }, { status: 404 })
    }

    return NextResponse.json({ package: packageItem })
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Chyba při načítání balíčku' }, { status: 500 })
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

    const existingPackage = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Balíček nenalezen' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, type, price, credits, validityDays, features, isActive } = body

    const updatedPackage = await prisma.package.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(type && { type }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(credits !== undefined && { credits: parseInt(credits) }),
        ...(validityDays !== undefined && { validityDays: parseInt(validityDays) }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ package: updatedPackage })
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci balíčku' }, { status: 500 })
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

    const existingPackage = await prisma.package.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Balíček nenalezen' }, { status: 404 })
    }

    // Package can be deleted (orders are stored separately)

    await prisma.package.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Chyba při mazání balíčku' }, { status: 500 })
  }
}
