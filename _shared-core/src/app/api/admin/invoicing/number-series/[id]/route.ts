/**
 * Individual Number Series API
 *
 * Get, update, or delete a number series
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const series = await prisma.numberSeries.findUnique({
      where: { id: params.id },
    })

    if (!series) {
      return NextResponse.json(
        { error: 'Number series not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(series)
  } catch (error) {
    console.error('Error fetching number series:', error)
    return NextResponse.json(
      { error: 'Failed to fetch number series' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // If setting as default, unset other defaults for same document type
    if (isDefault) {
      const currentSeries = await prisma.numberSeries.findUnique({
        where: { id: params.id },
      })

      if (currentSeries) {
        await prisma.numberSeries.updateMany({
          where: {
            documentType: documentType || currentSeries.documentType,
            isDefault: true,
            id: { not: params.id },
          },
          data: { isDefault: false },
        })
      }
    }

    const series = await prisma.numberSeries.update({
      where: { id: params.id },
      data: {
        name,
        prefix,
        pattern,
        documentType,
        isDefault,
      },
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error('Error updating number series:', error)
    return NextResponse.json(
      { error: 'Failed to update number series' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if series is in use
    const invoicesUsingThis = await prisma.invoice.count({
      where: { numberSeriesId: params.id },
    })

    if (invoicesUsingThis > 0) {
      return NextResponse.json(
        { error: 'Cannot delete - series is in use by invoices' },
        { status: 400 }
      )
    }

    await prisma.numberSeries.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting number series:', error)
    return NextResponse.json(
      { error: 'Failed to delete number series' },
      { status: 500 }
    )
  }
}
