/**
 * Invoices List Page - Client Component with Full Filters & Column Management
 */
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Trash2, CheckCircle, Send, XCircle, RefreshCw, ExternalLink, FileText, CreditCard, Calendar } from 'lucide-react'
import type { InvoicePopulated } from '@/types/admin'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { useColumnVisibility, type ColumnDefinition } from '@/hooks/useColumnVisibility'
import { CollapsibleFilterBar } from '@/components/admin/filters/CollapsibleFilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { DateRangePicker } from '@/components/admin/filters/DateRangePicker'
import { SearchInput } from '@/components/admin/filters/SearchInput'
import { RangeInput } from '@/components/admin/filters/RangeInput'
import { BooleanFilter } from '@/components/admin/filters/BooleanFilter'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { ColumnToggle } from '@/components/admin/tables/ColumnToggle'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  formatDateForExport,
  formatCurrencyForExport,
  type ExportColumn,
} from '@/lib/export'

const statusOptions = [
  { value: 'draft', label: 'Koncept', description: 'Draft faktury' },
  { value: 'sent', label: 'Odeslána', description: 'Odesláno zákazníkovi' },
  { value: 'paid', label: 'Zaplacena', description: 'Uhrazena' },
  { value: 'overdue', label: 'Po splatnosti', description: 'Nezaplacená' },
  { value: 'cancelled', label: 'Stornována', description: 'Stornováno' },
]

const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  sent: 'Odeslána',
  paid: 'Zaplacena',
  overdue: 'Po splatnosti',
  cancelled: 'Stornována',
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Bankovní převod' },
  { value: 'cash', label: 'Hotovost' },
  { value: 'card', label: 'Kartou' },
]

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: 'Bankovní převod',
  cash: 'Hotovost',
  card: 'Kartou',
}

// Column definitions
const invoiceColumns: ColumnDefinition<InvoicePopulated>[] = [
  { id: 'invoiceNumber', label: 'Číslo faktury', defaultVisible: true, canHide: false },
  { id: 'customer', label: 'Zákazník', defaultVisible: true, canHide: true },
  { id: 'customerOrg', label: 'Organizace', defaultVisible: false, canHide: true },
  { id: 'customerEmail', label: 'Email', defaultVisible: false, canHide: true },
  { id: 'issueDate', label: 'Datum vystavení', defaultVisible: true, canHide: true },
  { id: 'dueDate', label: 'Splatnost', defaultVisible: true, canHide: true },
  { id: 'paidDate', label: 'Datum úhrady', defaultVisible: false, canHide: true },
  { id: 'totalAmount', label: 'Částka', defaultVisible: true, canHide: true },
  { id: 'paidAmount', label: 'Uhrazeno', defaultVisible: false, canHide: true },
  { id: 'status', label: 'Stav', defaultVisible: true, canHide: true },
  { id: 'paymentMethod', label: 'Způsob platby', defaultVisible: false, canHide: true },
  { id: 'variableSymbol', label: 'VS', defaultVisible: false, canHide: true },
  { id: 'vyfakturuj', label: 'Vyfakturuj', defaultVisible: true, canHide: true },
  { id: 'order', label: 'Objednávka', defaultVisible: false, canHide: true },
  { id: 'items', label: 'Položek', defaultVisible: false, canHide: true },
  { id: 'notes', label: 'Poznámky', defaultVisible: false, canHide: true },
  { id: 'createdAt', label: 'Vytvořeno', defaultVisible: false, canHide: true },
]

const exportColumns: ExportColumn<InvoicePopulated>[] = [
  { key: 'invoiceNumber', label: 'Číslo faktury' },
  {
    key: 'customer',
    label: 'Zákazník',
    format: (value) =>
      value ? `${value.firstName || ''} ${value.lastName || ''}`.trim() : '',
  },
  {
    key: 'customer',
    label: 'Organizace',
    format: (value) => value?.organization || '',
  },
  {
    key: 'customer',
    label: 'Email',
    format: (value) => value?.email || '',
  },
  {
    key: 'issueDate',
    label: 'Datum vystavení',
    format: (value) => formatDateForExport(value),
  },
  {
    key: 'dueDate',
    label: 'Datum splatnosti',
    format: (value) => formatDateForExport(value),
  },
  {
    key: 'paidDate',
    label: 'Datum úhrady',
    format: (value) => formatDateForExport(value),
  },
  {
    key: 'totalAmount',
    label: 'Částka',
    format: (value) => formatCurrencyForExport(value),
  },
  {
    key: 'paidAmount',
    label: 'Uhrazeno',
    format: (value) => formatCurrencyForExport(value),
  },
  {
    key: 'status',
    label: 'Stav',
    format: (value) => statusLabels[value] || value,
  },
  {
    key: 'paymentMethod',
    label: 'Způsob platby',
    format: (value) => paymentMethodLabels[value] || value || '',
  },
  { key: 'variableSymbol', label: 'Variabilní symbol' },
  { key: 'vyfakturujNumber', label: 'Vyfakturuj číslo' },
  { key: 'notes', label: 'Poznámky' },
]

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoicePopulated[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { toast } = useToast()

  // Column visibility
  const {
    columns,
    visibleColumns,
    columnVisibility,
    toggleColumn,
    resetToDefaults,
    showAll,
    hideAll,
  } = useColumnVisibility({
    columns: invoiceColumns,
    storageKey: 'admin-invoices',
  })

  const { filters, updateFilter, clearFilter, clearAllFilters, hasFilters } = useUrlFilters({
    search: { type: 'string', defaultValue: '' },
    status: { type: 'array', defaultValue: [] },
    paymentMethod: { type: 'array', defaultValue: [] },
    dateFrom: { type: 'string', defaultValue: null },
    dateTo: { type: 'string', defaultValue: null },
    issueDateFrom: { type: 'string', defaultValue: null },
    issueDateTo: { type: 'string', defaultValue: null },
    paidDateFrom: { type: 'string', defaultValue: null },
    paidDateTo: { type: 'string', defaultValue: null },
    minAmount: { type: 'string', defaultValue: null },
    maxAmount: { type: 'string', defaultValue: null },
    hasVyfakturuj: { type: 'string', defaultValue: null },
    hasOrder: { type: 'boolean', defaultValue: undefined },
    isOverdue: { type: 'boolean', defaultValue: undefined },
  })

  const { page, pageSize, setPage, setPageSize } = usePagination({ defaultPageSize: 25 })

  // Stable filter key for useEffect dependency
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    isSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  } = useBulkSelection({
    items: invoices,
    getId: (invoice) => invoice.id,
  })

  useEffect(() => {
    fetchInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filtersKey])

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      params.set('populate', 'true')

      // Filters
      if (filters.search) params.set('search', filters.search as string)

      const statusArr = (filters.status as string[]) || []
      statusArr.forEach((s: string) => params.append('status', s))

      const paymentMethodArr = (filters.paymentMethod as string[]) || []
      paymentMethodArr.forEach((p: string) => params.append('paymentMethod', p))

      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom as string)
      if (filters.dateTo) params.set('dateTo', filters.dateTo as string)
      if (filters.issueDateFrom) params.set('issueDateFrom', filters.issueDateFrom as string)
      if (filters.issueDateTo) params.set('issueDateTo', filters.issueDateTo as string)
      if (filters.paidDateFrom) params.set('paidDateFrom', filters.paidDateFrom as string)
      if (filters.paidDateTo) params.set('paidDateTo', filters.paidDateTo as string)
      if (filters.minAmount) params.set('minAmount', filters.minAmount as string)
      if (filters.maxAmount) params.set('maxAmount', filters.maxAmount as string)
      if (filters.hasVyfakturuj !== null && filters.hasVyfakturuj !== '') {
        params.set('hasVyfakturuj', filters.hasVyfakturuj as string)
      }
      if (filters.hasOrder !== undefined) params.set('hasOrder', String(filters.hasOrder))
      if (filters.isOverdue !== undefined) params.set('isOverdue', String(filters.isOverdue))

      const response = await fetch(`/api/admin/invoices?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setInvoices(result.invoices || [])
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast('Chyba při načítání faktur', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    updateFilter('search', value)
    setPage(1)
  }, [updateFilter, setPage])

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'faktury' : 'fakturu'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/invoices/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Faktury úspěšně smazány', 'success')
        await fetchInvoices()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání faktur', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání faktur', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<InvoicePopulated>) => {
    try {
      const response = await fetch('/api/admin/invoices/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Faktury úspěšně aktualizovány', 'success')
        await fetchInvoices()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci faktur', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci faktur', 'error')
    }
  }

  const handleMarkPaid = () => handleBulkUpdate({ status: 'paid' })
  const handleMarkSent = () => handleBulkUpdate({ status: 'sent' })
  const handleMarkCancelled = () => handleBulkUpdate({ status: 'cancelled' })

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/admin/invoices/sync', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Synchronizace dokončena', data.success ? 'success' : 'warning')
        await fetchInvoices()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při synchronizaci', 'error')
      }
    } catch (error) {
      toast('Chyba při synchronizaci', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Render cell content based on column
  const renderCell = (invoice: InvoicePopulated, columnId: string) => {
    switch (columnId) {
      case 'invoiceNumber':
        return (
          <div className="text-sm font-medium text-gray-900">
            {invoice.invoiceNumber}
          </div>
        )
      case 'customer':
        return (
          <div className="text-sm text-gray-900">
            {invoice.customer?.firstName} {invoice.customer?.lastName}
          </div>
        )
      case 'customerOrg':
        return (
          <div className="text-sm text-gray-500">
            {invoice.customer?.organization || '-'}
          </div>
        )
      case 'customerEmail':
        return (
          <div className="text-sm text-gray-500">
            {invoice.customer?.email || '-'}
          </div>
        )
      case 'issueDate':
        return (
          <div className="text-sm text-gray-900">
            {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
          </div>
        )
      case 'dueDate':
        return (
          <div className="text-sm text-gray-900">
            {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
          </div>
        )
      case 'paidDate':
        return (
          <div className="text-sm text-gray-500">
            {invoice.paidDate
              ? new Date(invoice.paidDate).toLocaleDateString('cs-CZ')
              : '-'}
          </div>
        )
      case 'totalAmount':
        return (
          <div className="text-sm font-medium text-gray-900">
            {invoice.totalAmount?.toLocaleString('cs-CZ') || 0} Kč
          </div>
        )
      case 'paidAmount':
        return (
          <div className="text-sm text-gray-500">
            {invoice.paidAmount?.toLocaleString('cs-CZ') || 0} Kč
          </div>
        )
      case 'status':
        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              statusColors[invoice.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[invoice.status] || invoice.status}
          </span>
        )
      case 'paymentMethod':
        return (
          <div className="text-sm text-gray-500">
            {invoice.paymentMethod
              ? paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod
              : '-'}
          </div>
        )
      case 'variableSymbol':
        return (
          <div className="text-sm text-gray-500 font-mono">
            {invoice.variableSymbol || '-'}
          </div>
        )
      case 'vyfakturuj':
        return invoice.vyfakturujId ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-600">
              {invoice.vyfakturujNumber || `#${invoice.vyfakturujId}`}
            </span>
            {invoice.publicUrl && (
              <a
                href={invoice.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                title="Otevřít ve Vyfakturuj"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">–</span>
        )
      case 'order':
        return (
          <div className="text-sm text-gray-500">
            {invoice.order?.orderNumber || '-'}
          </div>
        )
      case 'items':
        return (
          <div className="text-sm text-gray-500">
            {invoice.items?.length || 0}
          </div>
        )
      case 'notes':
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate" title={invoice.notes || ''}>
            {invoice.notes || '-'}
          </div>
        )
      case 'createdAt':
        return (
          <div className="text-sm text-gray-500">
            {invoice.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString('cs-CZ')
              : '-'}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faktury</h1>
          <p className="mt-2 text-sm text-gray-600">Přehled faktur a jejich stav</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizuji...' : 'Sync Vyfakturuj'}
          </button>
          <ColumnToggle
            columns={columns}
            columnVisibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            onShowAll={showAll}
            onHideAll={hideAll}
          />
          <ExportButton
            data={invoices}
            columns={exportColumns}
            filename={`faktury-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Nová faktura
          </Link>
        </div>
      </div>

      <CollapsibleFilterBar
        storageKey="invoices"
        activeFilterCount={
          ((filters.search as string) ? 1 : 0) +
          ((filters.status as string[])?.length || 0) +
          ((filters.paymentMethod as string[])?.length || 0) +
          ((filters.dateFrom || filters.dateTo) ? 1 : 0) +
          ((filters.issueDateFrom || filters.issueDateTo) ? 1 : 0) +
          ((filters.paidDateFrom || filters.paidDateTo) ? 1 : 0) +
          ((filters.minAmount || filters.maxAmount) ? 1 : 0) +
          ((filters.hasVyfakturuj !== null && filters.hasVyfakturuj !== '') ? 1 : 0) +
          (filters.hasOrder !== undefined ? 1 : 0) +
          (filters.isOverdue !== undefined ? 1 : 0)
        }
        activeAdvancedFilterCount={
          ((filters.dateFrom || filters.dateTo) ? 1 : 0) +
          ((filters.issueDateFrom || filters.issueDateTo) ? 1 : 0) +
          ((filters.paidDateFrom || filters.paidDateTo) ? 1 : 0) +
          ((filters.minAmount || filters.maxAmount) ? 1 : 0) +
          ((filters.hasVyfakturuj !== null && filters.hasVyfakturuj !== '') ? 1 : 0) +
          (filters.hasOrder !== undefined ? 1 : 0) +
          (filters.isOverdue !== undefined ? 1 : 0)
        }
        onClear={clearAllFilters}
        hasFilters={hasFilters}
        basicFilters={
          <>
            <SearchInput
              value={(filters.search as string) || ''}
              onChange={handleSearchChange}
              placeholder="Hledat číslo faktury, zákazníka, VS..."
              className="lg:col-span-2"
            />
            <MultiSelect
              label="Stav"
              options={statusOptions}
              value={(filters.status as string[]) || []}
              onChange={(value) => updateFilter('status', value)}
              placeholder="Vyberte stavy..."
            />
            <MultiSelect
              label="Způsob platby"
              options={paymentMethodOptions}
              value={(filters.paymentMethod as string[]) || []}
              onChange={(value) => updateFilter('paymentMethod', value)}
              placeholder="Vyberte..."
            />
          </>
        }
        advancedFilters={
          <>
            <DateRangePicker
              label="Splatnost"
              from={filters.dateFrom ? new Date(filters.dateFrom as string) : undefined}
              to={filters.dateTo ? new Date(filters.dateTo as string) : undefined}
              onSelect={(range) => {
                updateFilter('dateFrom', range?.from ? range.from.toISOString() : null)
                updateFilter('dateTo', range?.to ? range.to.toISOString() : null)
              }}
            />
            <DateRangePicker
              label="Datum vystavení"
              from={filters.issueDateFrom ? new Date(filters.issueDateFrom as string) : undefined}
              to={filters.issueDateTo ? new Date(filters.issueDateTo as string) : undefined}
              onSelect={(range) => {
                updateFilter('issueDateFrom', range?.from ? range.from.toISOString() : null)
                updateFilter('issueDateTo', range?.to ? range.to.toISOString() : null)
              }}
            />
            <DateRangePicker
              label="Datum úhrady"
              from={filters.paidDateFrom ? new Date(filters.paidDateFrom as string) : undefined}
              to={filters.paidDateTo ? new Date(filters.paidDateTo as string) : undefined}
              onSelect={(range) => {
                updateFilter('paidDateFrom', range?.from ? range.from.toISOString() : null)
                updateFilter('paidDateTo', range?.to ? range.to.toISOString() : null)
              }}
            />
            <RangeInput
              label="Částka (Kč)"
              minValue={filters.minAmount ? parseFloat(filters.minAmount as string) : undefined}
              maxValue={filters.maxAmount ? parseFloat(filters.maxAmount as string) : undefined}
              onMinChange={(val) => updateFilter('minAmount', val?.toString() || null)}
              onMaxChange={(val) => updateFilter('maxAmount', val?.toString() || null)}
              unit="Kč"
              step={100}
            />
            <BooleanFilter
              label="Vyfakturuj sync"
              value={
                filters.hasVyfakturuj === 'true' ? true :
                filters.hasVyfakturuj === 'false' ? false : undefined
              }
              onChange={(val) => updateFilter('hasVyfakturuj', val === undefined ? null : val.toString())}
              trueLabel="Sync"
              falseLabel="Nesync"
            />
            <BooleanFilter
              label="Má objednávku"
              value={filters.hasOrder as boolean | undefined}
              onChange={(val) => updateFilter('hasOrder', val)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Po splatnosti"
              value={filters.isOverdue as boolean | undefined}
              onChange={(val) => updateFilter('isOverdue', val)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
          </>
        }
      />

      <ActiveFilters
        filters={[
          {
            key: 'search',
            label: 'Hledání',
            values: (filters.search as string) ? [filters.search as string] : [],
            onClear: () => clearFilter('search'),
          },
          {
            key: 'status',
            label: 'Stav',
            values: ((filters.status as string[]) || []).map(
              (val: string) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
          {
            key: 'paymentMethod',
            label: 'Způsob platby',
            values: ((filters.paymentMethod as string[]) || []).map(
              (val: string) => paymentMethodOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('paymentMethod'),
          },
          {
            key: 'date',
            label: 'Splatnost',
            values:
              filters.dateFrom || filters.dateTo
                ? [
                    `${filters.dateFrom ? format(new Date(filters.dateFrom as string), 'dd.MM.yyyy', { locale: cs }) : '...'} - ${filters.dateTo ? format(new Date(filters.dateTo as string), 'dd.MM.yyyy', { locale: cs }) : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('dateFrom')
              clearFilter('dateTo')
            },
          },
          {
            key: 'issueDate',
            label: 'Vystavení',
            values:
              filters.issueDateFrom || filters.issueDateTo
                ? [
                    `${filters.issueDateFrom ? format(new Date(filters.issueDateFrom as string), 'dd.MM.yyyy', { locale: cs }) : '...'} - ${filters.issueDateTo ? format(new Date(filters.issueDateTo as string), 'dd.MM.yyyy', { locale: cs }) : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('issueDateFrom')
              clearFilter('issueDateTo')
            },
          },
          {
            key: 'paidDate',
            label: 'Úhrada',
            values:
              filters.paidDateFrom || filters.paidDateTo
                ? [
                    `${filters.paidDateFrom ? format(new Date(filters.paidDateFrom as string), 'dd.MM.yyyy', { locale: cs }) : '...'} - ${filters.paidDateTo ? format(new Date(filters.paidDateTo as string), 'dd.MM.yyyy', { locale: cs }) : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('paidDateFrom')
              clearFilter('paidDateTo')
            },
          },
          {
            key: 'amount',
            label: 'Částka',
            values:
              filters.minAmount || filters.maxAmount
                ? [`${filters.minAmount || '0'} - ${filters.maxAmount || '∞'} Kč`]
                : [],
            onClear: () => {
              clearFilter('minAmount')
              clearFilter('maxAmount')
            },
          },
          {
            key: 'hasVyfakturuj',
            label: 'Vyfakturuj',
            values:
              filters.hasVyfakturuj === 'true' ? ['Synchronizováno'] :
              filters.hasVyfakturuj === 'false' ? ['Nesynchronizováno'] : [],
            onClear: () => clearFilter('hasVyfakturuj'),
          },
          {
            key: 'hasOrder',
            label: 'Má objednávku',
            values: filters.hasOrder !== undefined ? [filters.hasOrder ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('hasOrder'),
          },
          {
            key: 'isOverdue',
            label: 'Po splatnosti',
            values: filters.isOverdue !== undefined ? [filters.isOverdue ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('isOverdue'),
          },
        ].filter(f => (f.values as string[]).length > 0)}
        onClearAll={clearAllFilters}
      />

      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          primaryActions={[
            {
              id: 'delete',
              label: 'Smazat',
              icon: Trash2,
              onClick: handleBulkDelete,
              variant: 'danger',
            },
          ]}
          secondaryActions={[
            {
              id: 'mark-paid',
              label: 'Označit jako zaplaceno',
              icon: CheckCircle,
              onClick: handleMarkPaid,
            },
            {
              id: 'mark-sent',
              label: 'Označit jako odesláno',
              icon: Send,
              onClick: handleMarkSent,
            },
            {
              id: 'mark-cancelled',
              label: 'Stornovat',
              icon: XCircle,
              onClick: handleMarkCancelled,
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Načítám faktury...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádné faktury nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <p className="text-gray-500">Žádné faktury nebyly nalezeny.</p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 w-12">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={toggleAll}
                    />
                  </th>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={isSelected(invoice.id)}
                        onChange={() => toggleItem(invoice.id)}
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.id} className="px-6 py-4 whitespace-nowrap">
                        {renderCell(invoice, column.id)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && invoices.length > 0 && (
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}
    </div>
  )
}
