/**
 * ExportButton - Reusable export component for CSV/Excel
 */
'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Menu } from '@headlessui/react'
import { exportToCSV, exportToExcel, type ExportColumn } from '@/lib/export'
import { useToast } from '@/hooks/useToast'

interface ExportButtonProps<T> {
  data: T[]
  columns: ExportColumn<T>[]
  filename: string
  label?: string
  disabled?: boolean
}

export function ExportButton<T>({
  data,
  columns,
  filename,
  label = 'Export',
  disabled = false,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'csv' | 'excel') => {
    setIsExporting(true)
    try {
      if (data.length === 0) {
        toast('Žádná data k exportu', 'error')
        return
      }

      if (format === 'csv') {
        exportToCSV({ data, columns, filename })
        toast(`Exportováno ${data.length} záznamů do CSV`, 'success')
      } else {
        exportToExcel({ data, columns, filename })
        toast(`Exportováno ${data.length} záznamů do Excel`, 'success')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast('Chyba při exportu dat', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        disabled={disabled || isExporting || data.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        {isExporting ? 'Exportuji...' : label}
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleExport('csv')}
                className={`${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
              >
                <FileText className="h-4 w-4 text-gray-400" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Export do CSV</div>
                  <div className="text-xs text-gray-500">
                    Kompatibilní s Excel a Google Sheets
                  </div>
                </div>
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleExport('excel')}
                className={`${
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
              >
                <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Export do Excel</div>
                  <div className="text-xs text-gray-500">
                    Optimalizováno pro Microsoft Excel
                  </div>
                </div>
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
