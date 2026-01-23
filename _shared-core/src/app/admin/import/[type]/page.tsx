'use client'

/**
 * Import Wizard Page
 *
 * Dynamic page for specific import type
 */

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImportWizard } from '@/components/admin/import'
import type { ImportEntityType } from '@/lib/import'

const importLabels: Record<ImportEntityType, string> = {
  customer_company: 'Zákazníci - Firmy',
  customer_person: 'Zákazníci - Osoby',
  invoice: 'Faktury',
  order: 'Akce / Objednávky',
  performance: 'Představení',
  game: 'Hry',
}

const validTypes: ImportEntityType[] = [
  'customer_company',
  'customer_person',
  'invoice',
  'order',
  'performance',
  'game',
]

export default function ImportTypePage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as string

  // Validate type
  if (!validTypes.includes(type as ImportEntityType)) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Neplatný typ importu</p>
          <p className="text-sm mt-1">
            Typ &quot;{type}&quot; není podporován.{' '}
            <Link href="/admin/import" className="underline">
              Zpět na výběr typu
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const entityType = type as ImportEntityType
  const label = importLabels[entityType]

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/import"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na výběr typu
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Import: {label}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Nahrajte CSV soubor a následujte průvodce importem
        </p>
      </div>

      {/* Import Wizard */}
      <ImportWizard
        entityType={entityType}
        entityLabel={label}
        onComplete={() => router.push('/admin/import')}
      />
    </div>
  )
}
