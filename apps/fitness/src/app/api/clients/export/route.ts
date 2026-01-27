import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientsToCSV } from '@/lib/csv/client-csv-parser'

// GET /api/clients/export - Export clients to CSV
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const fitnessLevel = searchParams.get('fitnessLevel') || undefined
    const search = searchParams.get('search') || undefined

    // Build filter
    const where = {
      tenantId: session.user.tenantId,
      ...(status && { status }),
      ...(fitnessLevel && { fitnessLevel }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    // Fetch clients
    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    // Convert to CSV
    const csv = clientsToCSV(clients)

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="klienti-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting clients:', error)
    return NextResponse.json(
      { error: 'Chyba při exportu klientů' },
      { status: 500 }
    )
  }
}
