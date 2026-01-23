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

    const packages = await prisma.package.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Chyba při načítání balíčků' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, type, price, credits, validityDays, features, isActive } = body

    if (!name || !type || price === undefined || !credits || !validityDays) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 })
    }

    const newPackage = await prisma.package.create({
      data: {
        tenantId: session.user.tenantId,
        name,
        description: description || null,
        type,
        price: parseFloat(price),
        credits: parseInt(credits),
        validityDays: parseInt(validityDays),
        features: features || [],
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ package: newPackage }, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Chyba při vytváření balíčku' }, { status: 500 })
  }
}
