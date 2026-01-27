import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProgressReportPDF, ProgressReportData } from '@/lib/pdf/progress-report-pdf'
import React from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)

    // Get date range from query params
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Default: last 90 days
    const to = toParam ? new Date(toParam) : new Date()

    // Fetch client with measurements
    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        measurements: {
          where: {
            date: {
              gte: from,
              lte: to,
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Fetch tenant details
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Calculate summary
    const measurements = client.measurements
    const latestMeasurement = measurements[0]
    const firstMeasurement = measurements[measurements.length - 1]

    const weightChange = latestMeasurement?.weight && firstMeasurement?.weight
      ? latestMeasurement.weight - firstMeasurement.weight
      : 0

    const bodyFatChange = latestMeasurement?.bodyFat && firstMeasurement?.bodyFat
      ? latestMeasurement.bodyFat - firstMeasurement.bodyFat
      : 0

    // Transform measurements for PDF
    const transformedMeasurements = measurements.map(m => ({
      date: m.date.toISOString(),
      weight: m.weight,
      bodyFat: m.bodyFat,
      measurements: m.measurements as {
        chest?: number
        waist?: number
        hips?: number
        arms?: number
        thighs?: number
      } | null,
      notes: m.notes,
    }))

    // Build PDF data
    const pdfData: ProgressReportData = {
      client: {
        name: client.name,
        email: client.email,
        fitnessLevel: client.fitnessLevel,
        goals: client.goals,
        startDate: client.createdAt.toISOString(),
      },
      measurements: transformedMeasurements,
      summary: {
        weightChange: Number(weightChange.toFixed(1)),
        bodyFatChange: Number(bodyFatChange.toFixed(1)),
        periodStart: from.toISOString(),
        periodEnd: to.toISOString(),
        totalMeasurements: measurements.length,
      },
      tenant: {
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        website: tenant.website,
      },
      generatedAt: new Date().toISOString(),
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ProgressReportPDF, { data: pdfData }) as React.ReactElement
    )

    // Create filename
    const clientSlug = client.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const dateRange = `${from.toISOString().split('T')[0]}_${to.toISOString().split('T')[0]}`
    const filename = `progress-report-${clientSlug}-${dateRange}.pdf`

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('GET /api/clients/[id]/progress-report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate progress report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
