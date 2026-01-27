import { NextResponse } from 'next/server'
import { generateTemplate } from '@/lib/csv/client-csv-parser'

// GET /api/clients/import/template - Download CSV template
export async function GET() {
  const csv = generateTemplate()

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sablona-importu-klientu.csv"',
    },
  })
}
