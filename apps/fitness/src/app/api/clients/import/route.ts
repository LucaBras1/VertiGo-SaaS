import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  parseCSV,
  transformToCreateInput,
  type ImportResult,
} from '@/lib/csv/client-csv-parser'

// POST /api/clients/import - Import clients from CSV
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const updateExisting = formData.get('updateExisting') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'Nebyl nahrán žádný soubor' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()

    // Parse CSV
    const parseResult = parseCSV(content)

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'CSV soubor obsahuje chyby a nelze ho importovat',
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      }, { status: 400 })
    }

    // Process imports
    const result: ImportResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    // Get existing clients by email for this tenant
    const existingEmails = await prisma.client.findMany({
      where: { tenantId: session.user.tenantId },
      select: { id: true, email: true },
    })
    const emailToId = new Map(existingEmails.map((c) => [c.email.toLowerCase(), c.id]))

    // Process each row
    for (let i = 0; i < parseResult.data.length; i++) {
      const rowData = parseResult.data[i]
      const rowNumber = i + 2 // +2 for header and 0-index

      try {
        const email = rowData.email.toLowerCase()
        const existingId = emailToId.get(email)

        if (existingId) {
          if (updateExisting) {
            // Update existing client
            const updateData = transformToCreateInput(rowData, session.user.tenantId)
            delete (updateData as Record<string, unknown>).tenantId // Remove tenantId for update

            await prisma.client.update({
              where: { id: existingId },
              data: updateData,
            })
            result.updated++
          } else {
            result.skipped++
          }
        } else {
          // Create new client
          const createData = transformToCreateInput(rowData, session.user.tenantId)

          await prisma.client.create({
            data: createData,
          })
          result.created++

          // Add to map for duplicate detection within batch
          emailToId.set(email, 'new')
        }
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          email: rowData.email,
          message: error instanceof Error ? error.message : 'Neznámá chyba',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import dokončen: ${result.created} vytvořeno, ${result.updated} aktualizováno, ${result.skipped} přeskočeno`,
      result,
      parseWarnings: parseResult.warnings,
      parseErrors: parseResult.errors,
    })
  } catch (error) {
    console.error('Error importing clients:', error)
    return NextResponse.json(
      { error: 'Chyba při importu klientů' },
      { status: 500 }
    )
  }
}
