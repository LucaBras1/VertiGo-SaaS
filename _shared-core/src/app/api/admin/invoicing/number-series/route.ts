/**
 * Number Series API
 *
 * Manage invoice number series
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const series = await prisma.numberSeries.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ series })
  } catch (error) {
    console.error('Error fetching number series:', error)
    return NextResponse.json(
      { error: 'Failed to fetch number series' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      prefix,
      pattern,
      documentType,
      isDefault,
    } = body

    // Validate
    if (!name || !prefix) {
      return NextResponse.json(
        { error: 'Name and prefix are required' },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults for same document type
    if (isDefault) {
      await prisma.numberSeries.updateMany({
        where: { documentType, isDefault: true },
        data: { isDefault: false },
      })
    }

    const series = await prisma.numberSeries.create({
      data: {
        name,
        prefix,
        pattern: pattern || '{PREFIX}{YEAR}-{NUMBER:4}',
        documentType: documentType || 'FAKTURA',
        currentNumber: 0,
        year: new Date().getFullYear(),
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error('Error creating number series:', error)
    return NextResponse.json(
      { error: 'Failed to create number series' },
      { status: 500 }
    )
  }
}
