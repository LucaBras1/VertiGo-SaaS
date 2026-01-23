/**
 * Import Page
 *
 * Data import page with entity type selection
 */

import Link from 'next/link'
import {
  Building2,
  User,
  FileText,
  Calendar,
  Theater,
  Gamepad2,
  ArrowRight,
  Upload,
} from 'lucide-react'

const importTypes = [
  {
    key: 'customer_company',
    label: 'Zákazníci - Firmy',
    description: 'Import firem a organizací s IČO, DIČ a kontaktními údaji',
    icon: Building2,
    color: 'blue',
  },
  {
    key: 'customer_person',
    label: 'Zákazníci - Osoby',
    description: 'Import fyzických osob s kontaktními údaji',
    icon: User,
    color: 'green',
  },
  {
    key: 'invoice',
    label: 'Faktury',
    description: 'Import historických faktur',
    icon: FileText,
    color: 'purple',
  },
  {
    key: 'order',
    label: 'Akce / Objednávky',
    description: 'Import historických akcí a objednávek',
    icon: Calendar,
    color: 'orange',
  },
  {
    key: 'performance',
    label: 'Představení',
    description: 'Import divadelních představení',
    icon: Theater,
    color: 'pink',
  },
  {
    key: 'game',
    label: 'Hry',
    description: 'Import her a doprovodného programu',
    icon: Gamepad2,
    color: 'cyan',
  },
]

const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    hover: 'hover:border-blue-300 hover:bg-blue-50/50',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    hover: 'hover:border-green-300 hover:bg-green-50/50',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    hover: 'hover:border-purple-300 hover:bg-purple-50/50',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-300 hover:bg-orange-50/50',
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    hover: 'hover:border-pink-300 hover:bg-pink-50/50',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'text-cyan-600',
    hover: 'hover:border-cyan-300 hover:bg-cyan-50/50',
  },
}

export default function ImportPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Import dat</h1>
        </div>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          Importujte data z CSV souborů. Vyberte typ dat, které chcete importovat,
          a následujte průvodce pro mapování sloupců a validaci.
        </p>
      </div>

      {/* Import type selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {importTypes.map((type) => {
          const Icon = type.icon
          const colors = colorClasses[type.color]

          return (
            <Link
              key={type.key}
              href={`/admin/import/${type.key}`}
              className={`
                block bg-white rounded-lg border border-gray-200 overflow-hidden
                transition-all duration-200 ${colors.hover}
              `}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Help section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Jak import funguje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-3">
              1
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Nahrání souboru</h3>
            <p className="text-sm text-gray-500">
              Nahrajte CSV soubor s daty k importu
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-3">
              2
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Mapování sloupců</h3>
            <p className="text-sm text-gray-500">
              Přiřaďte sloupce z CSV k cílovým polím
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-3">
              3
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Validace</h3>
            <p className="text-sm text-gray-500">
              Zkontrolujte data před importem
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mb-3">
              4
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Import</h3>
            <p className="text-sm text-gray-500">
              Potvrďte a spusťte import dat
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">Tipy pro úspěšný import</h3>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Před importem zákazníků si připravte CSV soubor s unikátními emaily</li>
          <li>Pro faktury a objednávky je nutné mít nejdříve naimportované zákazníky</li>
          <li>Doporučujeme nejdříve vyzkoušet import v režimu &quot;simulace&quot;</li>
          <li>CSV soubory mohou používat středník (;) nebo čárku (,) jako oddělovač</li>
        </ul>
      </div>
    </div>
  )
}
