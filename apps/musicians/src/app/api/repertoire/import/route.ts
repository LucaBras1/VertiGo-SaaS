import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseRepertoireCSV } from '@/lib/utils/csv-parser'
import { prisma } from '@/lib/db'
import { Vertical } from '@/generated/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 })
    }

    const csvContent = await file.text()
    const parseResult = parseRepertoireCSV(csvContent)

    if (!parseResult.success && parseResult.songs.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parseResult.errors },
        { status: 400 }
      )
    }

    // Bulk create songs
    const created = await prisma.repertoireSong.createMany({
      data: parseResult.songs.map(song => ({
        ...song,
        tenantId: session.user.tenantId,
        vertical: 'MUSICIANS' as Vertical,
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({
      imported: created.count,
      total: parseResult.totalRows,
      errors: parseResult.errors,
    })
  } catch (error) {
    console.error('POST /api/repertoire/import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    )
  }
}
