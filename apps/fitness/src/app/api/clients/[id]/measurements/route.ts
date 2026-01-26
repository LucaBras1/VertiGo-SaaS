import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/clients/[id]/measurements - Get all measurements for a client
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    const measurements = await prisma.clientMeasurement.findMany({
      where: { clientId: params.id },
      orderBy: { date: 'desc' },
    })

    // Calculate progress stats
    const stats = calculateProgressStats(measurements)

    return NextResponse.json({
      measurements,
      stats,
    })
  } catch (error) {
    console.error('Error fetching measurements:', error)
    return NextResponse.json({ error: 'Chyba pri nacitani mereni' }, { status: 500 })
  }
}

// POST /api/clients/[id]/measurements - Add a new measurement
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    const body = await req.json()
    const { date, weight, bodyFat, measurements, notes } = body

    // Create measurement
    const measurement = await prisma.clientMeasurement.create({
      data: {
        clientId: params.id,
        date: date ? new Date(date) : new Date(),
        weight: weight ? parseFloat(weight) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        measurements: measurements || null,
        notes: notes || null,
      },
    })

    // Update client's current stats if provided
    const updateData: Record<string, unknown> = {}
    if (weight) updateData.currentWeight = parseFloat(weight)
    if (bodyFat) updateData.bodyFatPercent = parseFloat(bodyFat)
    if (measurements) updateData.bodyMeasurements = measurements

    if (Object.keys(updateData).length > 0) {
      await prisma.client.update({
        where: { id: params.id },
        data: updateData,
      })
    }

    return NextResponse.json({ measurement }, { status: 201 })
  } catch (error) {
    console.error('Error creating measurement:', error)
    return NextResponse.json({ error: 'Chyba pri vytvareni mereni' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]/measurements?measurementId=xxx
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const measurementId = searchParams.get('measurementId')

    if (!measurementId) {
      return NextResponse.json({ error: 'measurementId je povinny' }, { status: 400 })
    }

    // Verify client belongs to tenant
    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Klient nenalezen' }, { status: 404 })
    }

    // Verify measurement belongs to client
    const measurement = await prisma.clientMeasurement.findFirst({
      where: {
        id: measurementId,
        clientId: params.id,
      },
    })

    if (!measurement) {
      return NextResponse.json({ error: 'Mereni nenalezeno' }, { status: 404 })
    }

    await prisma.clientMeasurement.delete({
      where: { id: measurementId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting measurement:', error)
    return NextResponse.json({ error: 'Chyba pri mazani mereni' }, { status: 500 })
  }
}

interface MeasurementRecord {
  weight: number | null
  bodyFat: number | null
  date: Date
}

function calculateProgressStats(measurements: MeasurementRecord[]) {
  if (measurements.length === 0) {
    return {
      totalMeasurements: 0,
      weightChange: null,
      bodyFatChange: null,
      trend: 'no_data',
    }
  }

  const sortedByDate = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const first = sortedByDate[0]
  const latest = sortedByDate[sortedByDate.length - 1]

  const weightChange =
    first.weight && latest.weight ? latest.weight - first.weight : null

  const bodyFatChange =
    first.bodyFat && latest.bodyFat ? latest.bodyFat - first.bodyFat : null

  // Determine trend based on recent measurements
  let trend: 'improving' | 'stable' | 'declining' | 'no_data' = 'no_data'

  if (measurements.length >= 3) {
    const recent = sortedByDate.slice(-3)
    const weightTrend =
      recent.filter((m) => m.weight !== null).length >= 2
        ? recent[recent.length - 1]?.weight &&
          recent[0]?.weight &&
          recent[recent.length - 1].weight! < recent[0].weight!
          ? 'down'
          : 'up'
        : null

    // For most fitness goals, weight going down is improvement
    if (weightTrend === 'down') trend = 'improving'
    else if (weightTrend === 'up') trend = 'stable' // Could be muscle gain
  }

  return {
    totalMeasurements: measurements.length,
    weightChange: weightChange ? Math.round(weightChange * 10) / 10 : null,
    bodyFatChange: bodyFatChange ? Math.round(bodyFatChange * 10) / 10 : null,
    trend,
    firstMeasurement: first.date,
    latestMeasurement: latest.date,
    startWeight: first.weight,
    currentWeight: latest.weight,
    startBodyFat: first.bodyFat,
    currentBodyFat: latest.bodyFat,
  }
}
