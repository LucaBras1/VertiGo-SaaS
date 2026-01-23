'use client'

/**
 * Orders List Page - Client Component with Full Filters & Column Management
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { OrderPopulated } from '@/types/admin'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { useColumnVisibility, type ColumnDefinition } from '@/hooks/useColumnVisibility'
import { CollapsibleFilterBar } from '@/components/admin/filters/CollapsibleFilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { DateRangePicker } from '@/components/admin/filters/DateRangePicker'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { SearchInput } from '@/components/admin/filters/SearchInput'
import { RangeInput } from '@/components/admin/filters/RangeInput'
import { BooleanFilter } from '@/components/admin/filters/BooleanFilter'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { ColumnToggle } from '@/components/admin/tables/ColumnToggle'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { Trash2, CheckCircle, FileText, Calendar, MapPin, User, Building } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useConfirmDialog } from '@/components/admin/modals/ConfirmDialog'
import { formatDateTimeForExport, formatCurrencyForExport, type ExportColumn } from '@/lib/export'

const statusLabels: Record<string, string> = {
  new: 'Nová',
  reviewing: 'V posouzení',
  awaiting_info: 'Čeká na info',
  quote_sent: 'Nabídka odeslána',
  confirmed: 'Potvrzena',
  approved: 'Schválena',
  completed: 'Dokončena',
  cancelled: 'Zrušena',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  awaiting_info: 'bg-purple-100 text-purple-800',
  quote_sent: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-green-100 text-green-800',
  approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const sourceLabels: Record<string, string> = {
  contact_form: 'Kontaktní formulář',
  manual: 'Manuálně',
  phone: 'Telefon',
  email: 'Email',
  repeat: 'Opakovaná',
}

// Column definitions
const orderColumns: ColumnDefinition<OrderPopulated>[] = [
  { id: 'orderNumber', label: 'Číslo', defaultVisible: true, canHide: false },
  { id: 'eventName', label: 'Název akce', defaultVisible: true, canHide: true },
  { id: 'customer', label: 'Zákazník', defaultVisible: true, canHide: true },
  { id: 'customerOrg', label: 'Organizace', defaultVisible: false, canHide: true },
  { id: 'customerEmail', label: 'Email zákazníka', defaultVisible: false, canHide: true },
  { id: 'date', label: 'Datum akce', defaultVisible: true, canHide: true },
  { id: 'city', label: 'Město', defaultVisible: true, canHide: true },
  { id: 'venue', label: 'Místo', defaultVisible: false, canHide: true },
  { id: 'status', label: 'Stav', defaultVisible: true, canHide: true },
  { id: 'source', label: 'Zdroj', defaultVisible: false, canHide: true },
  { id: 'price', label: 'Cena', defaultVisible: true, canHide: true },
  { id: 'items', label: 'Položky', defaultVisible: false, canHide: true },
  { id: 'hasInvoice', label: 'Faktura', defaultVisible: false, canHide: true },
  { id: 'arrivalTime', label: 'Čas příjezdu', defaultVisible: false, canHide: true },
  { id: 'preparationTime', label: 'Příprava (min)', defaultVisible: false, canHide: true },
  { id: 'contactPerson', label: 'Kontaktní osoba', defaultVisible: false, canHide: true },
  { id: 'createdAt', label: 'Vytvořeno', defaultVisible: false, canHide: true },
]

const exportColumns: ExportColumn<OrderPopulated>[] = [
  { key: 'orderNumber', label: 'Číslo objednávky' },
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
  { key: 'eventName', label: 'Název akce' },
  {
    key: 'venue',
    label: 'Město',
    format: (value) => value?.city || '',
  },
  {
    key: 'venue',
    label: 'Místo',
    format: (value) => value?.name || '',
  },
  {
    key: 'dates',
    label: 'Termíny',
    format: (value) => (Array.isArray(value) ? value.map((d) => new Date(d).toLocaleDateString('cs-CZ')).join(', ') : ''),
  },
  {
    key: 'status',
    label: 'Stav',
    format: (value) => statusLabels[value] || value,
  },
  {
    key: 'source',
    label: 'Zdroj',
    format: (value) => sourceLabels[value] || value,
  },
  {
    key: 'pricing',
    label: 'Cena',
    format: (value) => formatCurrencyForExport(value?.totalPrice),
  },
  {
    key: 'createdAt',
    label: 'Vytvořeno',
    format: (value) => formatDateTimeForExport(value),
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderPopulated[]>([])
  const [loading, setLoading] = useState(true)
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { toast } = useToast()
  const { ConfirmDialogComponent, confirm } = useConfirmDialog()

  // Column visibility
  const {
    columns,
    visibleColumns,
    columnVisibility,
    toggleColumn,
    resetToDefaults,
    showAll,
    hideAll,
    isVisible,
  } = useColumnVisibility({
    columns: orderColumns,
    storageKey: 'admin-orders',
  })

  const { filters, setFilter, updateFilter, clearFilter, clearAllFilters, hasFilters } = useUrlFilters({
    search: { type: 'string', defaultValue: '' },
    status: { type: 'array', defaultValue: [] },
    source: { type: 'array', defaultValue: [] },
    city: { type: 'array', defaultValue: [] },
    dateFrom: { type: 'string', defaultValue: '' },
    dateTo: { type: 'string', defaultValue: '' },
    createdFrom: { type: 'string', defaultValue: '' },
    createdTo: { type: 'string', defaultValue: '' },
    minPrice: { type: 'number', defaultValue: undefined },
    maxPrice: { type: 'number', defaultValue: undefined },
    hasInvoice: { type: 'boolean', defaultValue: undefined },
    hasItems: { type: 'boolean', defaultValue: undefined },
    hasLinkedEvent: { type: 'boolean', defaultValue: undefined },
  })

  const { page, pageSize, setPage, setPageSize } = usePagination({ defaultPageSize: 25 })

  // Stable filter key for useEffect dependency
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  // Bulk selection
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
    items: orders,
    getId: (order) => order.id,
  })

  // Status options for MultiSelect
  const statusOptions = [
    { value: 'new', label: 'Nová', description: 'Nově vytvořená objednávka' },
    { value: 'reviewing', label: 'V posouzení', description: 'Probíhá kontrola' },
    { value: 'awaiting_info', label: 'Čeká na info', description: 'Vyžaduje doplňující informace' },
    { value: 'quote_sent', label: 'Nabídka odeslána', description: 'Cenová nabídka odeslána' },
    { value: 'confirmed', label: 'Potvrzena', description: 'Zákazník potvrdil' },
    { value: 'approved', label: 'Schválena', description: 'Interně schválena' },
    { value: 'completed', label: 'Dokončena', description: 'Úspěšně dokončena' },
    { value: 'cancelled', label: 'Zrušena', description: 'Objednávka zrušena' },
  ]

  const sourceOptions = [
    { value: 'contact_form', label: 'Kontaktní formulář' },
    { value: 'manual', label: 'Manuálně' },
    { value: 'phone', label: 'Telefon' },
    { value: 'email', label: 'Email' },
    { value: 'repeat', label: 'Opakovaná' },
  ]

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/orders', { method: 'OPTIONS' })
      if (response.ok) {
        const result = await response.json()
        setCityOptions((result.cities || []).map((c: string) => ({ value: c, label: c })))
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Smazat objednávky?',
      message: `Opravdu chcete smazat ${selectedCount} ${selectedCount === 1 ? 'objednávku' : selectedCount < 5 ? 'objednávky' : 'objednávek'}? Tato akce je nevratná.`,
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      variant: 'danger',
    })
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete orders')
      }

      toast(result.message, 'success')
      clearSelection()
      setOrders((prev) => prev.filter((order) => !selectedIds.includes(order.id)))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to delete orders', 'error')
    }
  }

  // Bulk create invoices handler
  const handleBulkCreateInvoices = async (type: 'invoice' | 'proforma' = 'invoice') => {
    const typeLabel = type === 'proforma' ? 'proforma faktury' : 'faktury'
    const confirmed = await confirm({
      title: `Vytvořit ${typeLabel}?`,
      message: `Opravdu chcete vytvořit ${typeLabel} pro ${selectedCount} ${selectedCount === 1 ? 'objednávku' : selectedCount < 5 ? 'objednávky' : 'objednávek'}?`,
      confirmText: 'Vytvořit',
      cancelText: 'Zrušit',
      variant: 'info',
    })
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch('/api/admin/orders/bulk-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedIds,
          options: { type, sendEmail: false },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invoices')
      }

      toast(result.message, result.data.failed > 0 ? 'warning' : 'success')
      clearSelection()
      fetchOrders()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to create invoices', 'error')
    }
  }

  // Bulk update status handler
  const handleBulkUpdateStatus = async (status: string) => {
    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          data: { status },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update orders')
      }

      toast(result.message, 'success')
      clearSelection()
      fetchOrders()
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to update orders', 'error')
    }
  }

  // Search handler with debounce reset
  const handleSearchChange = useCallback((value: string) => {
    updateFilter('search', value)
    setPage(1)
  }, [updateFilter, setPage])

  // Price range handlers
  const handleMinPriceChange = useCallback((value: number | undefined) => {
    updateFilter('minPrice', value)
    setPage(1)
  }, [updateFilter, setPage])

  const handleMaxPriceChange = useCallback((value: number | undefined) => {
    updateFilter('maxPrice', value)
    setPage(1)
  }, [updateFilter, setPage])

  // Fetch orders with filters
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        populate: 'true',
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      // Add filters to params
      const search = filters.search as string
      if (search) params.set('search', search)

      const statusArr = filters.status as string[] || []
      statusArr.forEach(s => params.append('status', s))

      const sourceArr = filters.source as string[] || []
      sourceArr.forEach(s => params.append('source', s))

      const cityArr = filters.city as string[] || []
      cityArr.forEach(c => params.append('city', c))

      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom as string)
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo as string)
      }

      if (filters.createdFrom) {
        params.append('createdFrom', filters.createdFrom as string)
      }
      if (filters.createdTo) {
        params.append('createdTo', filters.createdTo as string)
      }

      const minPrice = filters.minPrice as number | undefined
      const maxPrice = filters.maxPrice as number | undefined
      if (minPrice !== undefined) params.set('minPrice', minPrice.toString())
      if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString())

      const hasInvoice = filters.hasInvoice as boolean | undefined
      if (hasInvoice !== undefined) params.set('hasInvoice', hasInvoice.toString())

      const hasItems = filters.hasItems as boolean | undefined
      if (hasItems !== undefined) params.set('hasItems', hasItems.toString())

      const hasLinkedEvent = filters.hasLinkedEvent as boolean | undefined
      if (hasLinkedEvent !== undefined) params.set('hasLinkedEvent', hasLinkedEvent.toString())

      const response = await fetch(`/api/admin/orders?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const result = await response.json()
      setOrders(result.orders as OrderPopulated[])
      setPagination(result.pagination)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filtersKey])

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      setFilter('dateFrom', range.from.toISOString().split('T')[0])
    } else {
      setFilter('dateFrom', null)
    }

    if (range?.to) {
      setFilter('dateTo', range.to.toISOString().split('T')[0])
    } else {
      setFilter('dateTo', null)
    }
  }

  // Get current date range
  const currentDateRange: { from?: Date; to?: Date } | undefined = filters.dateFrom || filters.dateTo
    ? {
        from: filters.dateFrom ? new Date(filters.dateFrom as string) : undefined,
        to: filters.dateTo ? new Date(filters.dateTo as string) : undefined,
      }
    : undefined

  // Render cell content based on column
  const renderCell = (order: OrderPopulated, columnId: string) => {
    switch (columnId) {
      case 'orderNumber':
        return (
          <div className="text-sm font-medium text-gray-900">
            {order.orderNumber}
          </div>
        )
      case 'eventName':
        return (
          <div className="text-sm text-gray-900">
            {order.eventName || 'Bez názvu'}
          </div>
        )
      case 'customer':
        return (
          <div className="text-sm text-gray-900">
            {order.customer?.firstName} {order.customer?.lastName}
          </div>
        )
      case 'customerOrg':
        return (
          <div className="text-sm text-gray-500">
            {order.customer?.organization || '-'}
          </div>
        )
      case 'customerEmail':
        return (
          <div className="text-sm text-gray-500">
            {order.customer?.email || '-'}
          </div>
        )
      case 'date':
        return (
          <div className="text-sm text-gray-900">
            {order.dates && order.dates.length > 0
              ? new Date(order.dates[0]).toLocaleDateString('cs-CZ')
              : '-'}
          </div>
        )
      case 'city':
        return (
          <div className="text-sm text-gray-900">
            {order.venue?.city || '-'}
          </div>
        )
      case 'venue':
        return (
          <div className="text-sm text-gray-500">
            {order.venue?.name || '-'}
          </div>
        )
      case 'status':
        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              statusColors[order.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[order.status] || order.status}
          </span>
        )
      case 'source':
        return (
          <div className="text-sm text-gray-500">
            {sourceLabels[order.source] || order.source}
          </div>
        )
      case 'price':
        return (
          <div className="text-sm text-gray-900">
            {order.pricing?.totalPrice
              ? `${order.pricing.totalPrice.toLocaleString('cs-CZ')} Kč`
              : '-'}
          </div>
        )
      case 'items':
        return (
          <div className="text-sm text-gray-500">
            {order.items?.length || 0} položek
          </div>
        )
      case 'hasInvoice':
        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              order.linkedEventId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {order.linkedEventId ? 'Ano' : 'Ne'}
          </span>
        )
      case 'arrivalTime':
        return (
          <div className="text-sm text-gray-500">
            {order.arrivalTime || '-'}
          </div>
        )
      case 'preparationTime':
        return (
          <div className="text-sm text-gray-500">
            {order.preparationTime ? `${order.preparationTime} min` : '-'}
          </div>
        )
      case 'contactPerson':
        return (
          <div className="text-sm text-gray-500">
            {order.contacts?.primary?.name || '-'}
          </div>
        )
      case 'createdAt':
        return (
          <div className="text-sm text-gray-500">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('cs-CZ')
              : '-'}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Objednávky</h1>
          <p className="mt-2 text-sm text-gray-700">
            Seznam všech objednávek a jejich stav
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-3">
          <ColumnToggle
            columns={columns}
            columnVisibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            onShowAll={showAll}
            onHideAll={hideAll}
          />
          <ExportButton
            data={orders}
            columns={exportColumns}
            filename={`objednavky-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            + Nová objednávka
          </Link>
        </div>
      </div>

      {/* Filters */}
      <CollapsibleFilterBar
        storageKey="orders"
        onClear={clearAllFilters}
        hasFilters={hasFilters}
        activeFilterCount={
          (filters.search ? 1 : 0) +
          ((filters.status as string[])?.length || 0) +
          ((filters.source as string[])?.length || 0) +
          ((filters.city as string[])?.length || 0) +
          (filters.dateFrom || filters.dateTo ? 1 : 0) +
          (filters.createdFrom || filters.createdTo ? 1 : 0) +
          (filters.minPrice || filters.maxPrice ? 1 : 0) +
          (filters.hasInvoice !== undefined ? 1 : 0) +
          (filters.hasItems !== undefined ? 1 : 0) +
          (filters.hasLinkedEvent !== undefined ? 1 : 0)
        }
        activeAdvancedFilterCount={
          ((filters.source as string[])?.length || 0) +
          (filters.createdFrom || filters.createdTo ? 1 : 0) +
          (filters.minPrice || filters.maxPrice ? 1 : 0) +
          (filters.hasInvoice !== undefined ? 1 : 0) +
          (filters.hasItems !== undefined ? 1 : 0) +
          (filters.hasLinkedEvent !== undefined ? 1 : 0)
        }
        basicFilters={
          <>
            <SearchInput
              value={(filters.search as string) || ''}
              onChange={handleSearchChange}
              placeholder="Hledat číslo, název, zákazníka, email, IČO, telefon..."
              className="lg:col-span-2"
            />
            <MultiSelect
              label="Stav objednavky"
              options={statusOptions}
              value={(filters.status as string[]) || []}
              onChange={(values) => updateFilter('status', values)}
              placeholder="Vsechny stavy"
            />
            <MultiSelect
              label="Mesto"
              options={cityOptions}
              value={(filters.city as string[]) || []}
              onChange={(values) => updateFilter('city', values)}
              placeholder="Vyberte mesta..."
            />
          </>
        }
        advancedFilters={
          <>
            <MultiSelect
              label="Zdroj"
              options={sourceOptions}
              value={(filters.source as string[]) || []}
              onChange={(values) => updateFilter('source', values)}
              placeholder="Vsechny zdroje"
            />
            <DateRangePicker
              label="Datum akce"
              value={currentDateRange}
              onChange={handleDateRangeChange}
              placeholder="Vyberte obdobi"
            />
            <DateRangePicker
              label="Datum vytvoreni"
              value={
                filters.createdFrom || filters.createdTo
                  ? {
                      from: filters.createdFrom ? new Date(filters.createdFrom as string) : undefined,
                      to: filters.createdTo ? new Date(filters.createdTo as string) : undefined,
                    }
                  : undefined
              }
              onChange={(range) => {
                setFilter('createdFrom', range?.from ? range.from.toISOString().split('T')[0] : null)
                setFilter('createdTo', range?.to ? range.to.toISOString().split('T')[0] : null)
              }}
              placeholder="Vyberte obdobi"
            />
            <RangeInput
              label="Cena (Kc)"
              minValue={filters.minPrice as number | undefined}
              maxValue={filters.maxPrice as number | undefined}
              onMinChange={handleMinPriceChange}
              onMaxChange={handleMaxPriceChange}
              minPlaceholder="Od"
              maxPlaceholder="Do"
              unit="Kc"
            />
            <BooleanFilter
              label="Ma fakturu"
              value={filters.hasInvoice as boolean | undefined}
              onChange={(value) => updateFilter('hasInvoice', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Ma polozky"
              value={filters.hasItems as boolean | undefined}
              onChange={(value) => updateFilter('hasItems', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Propojena s udalosti"
              value={filters.hasLinkedEvent as boolean | undefined}
              onChange={(value) => updateFilter('hasLinkedEvent', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
          </>
        }
      />

      {/* Active Filters */}
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
              (val) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
          {
            key: 'source',
            label: 'Zdroj',
            values: ((filters.source as string[]) || []).map(
              (val) => sourceOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('source'),
          },
          {
            key: 'city',
            label: 'Město',
            values: (filters.city as string[]) || [],
            onClear: () => clearFilter('city'),
          },
          {
            key: 'dateRange',
            label: 'Datum akce',
            values: [
              filters.dateFrom && `Od: ${new Date(filters.dateFrom as string).toLocaleDateString('cs-CZ')}`,
              filters.dateTo && `Do: ${new Date(filters.dateTo as string).toLocaleDateString('cs-CZ')}`,
            ].filter(Boolean) as string[],
            onClear: () => {
              clearFilter('dateFrom')
              clearFilter('dateTo')
            },
          },
          {
            key: 'createdRange',
            label: 'Vytvořeno',
            values: [
              filters.createdFrom && `Od: ${new Date(filters.createdFrom as string).toLocaleDateString('cs-CZ')}`,
              filters.createdTo && `Do: ${new Date(filters.createdTo as string).toLocaleDateString('cs-CZ')}`,
            ].filter(Boolean) as string[],
            onClear: () => {
              clearFilter('createdFrom')
              clearFilter('createdTo')
            },
          },
          {
            key: 'priceRange',
            label: 'Cena',
            values: [
              filters.minPrice !== undefined && `Od: ${(filters.minPrice as number).toLocaleString('cs-CZ')} Kč`,
              filters.maxPrice !== undefined && `Do: ${(filters.maxPrice as number).toLocaleString('cs-CZ')} Kč`,
            ].filter(Boolean) as string[],
            onClear: () => {
              clearFilter('minPrice')
              clearFilter('maxPrice')
            },
          },
          {
            key: 'hasInvoice',
            label: 'Má fakturu',
            values: filters.hasInvoice !== undefined
              ? [filters.hasInvoice ? 'Ano' : 'Ne']
              : [],
            onClear: () => clearFilter('hasInvoice'),
          },
          {
            key: 'hasItems',
            label: 'Má položky',
            values: filters.hasItems !== undefined
              ? [filters.hasItems ? 'Ano' : 'Ne']
              : [],
            onClear: () => clearFilter('hasItems'),
          },
          {
            key: 'hasLinkedEvent',
            label: 'Propojena',
            values: filters.hasLinkedEvent !== undefined
              ? [filters.hasLinkedEvent ? 'Ano' : 'Ne']
              : [],
            onClear: () => clearFilter('hasLinkedEvent'),
          },
        ].filter(f => f.values.length > 0)}
        onClearAll={clearAllFilters}
      />

      {/* Bulk Actions Bar */}
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
              id: 'create-invoice',
              label: 'Vytvořit faktury',
              icon: FileText,
              onClick: () => handleBulkCreateInvoices('invoice'),
            },
            {
              id: 'create-proforma',
              label: 'Vytvořit proformy',
              icon: FileText,
              onClick: () => handleBulkCreateInvoices('proforma'),
            },
            {
              id: 'mark-confirmed',
              label: 'Označit jako potvrzené',
              icon: CheckCircle,
              onClick: () => handleBulkUpdateStatus('confirmed'),
            },
            {
              id: 'mark-completed',
              label: 'Označit jako dokončené',
              icon: CheckCircle,
              onClick: () => handleBulkUpdateStatus('completed'),
            },
            {
              id: 'mark-cancelled',
              label: 'Označit jako zrušené',
              onClick: () => handleBulkUpdateStatus('cancelled'),
              variant: 'danger',
            },
          ]}
        />
      )}

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Načítání objednávek...</p>
          </div>
        ) : (
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 w-12 bg-gray-50">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={toggleAll}
                      aria-label="Vybrat vse"
                    />
                  </th>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 ${isSelected(order.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 w-12">
                      <Checkbox
                        checked={isSelected(order.id)}
                        onChange={() => toggleItem(order.id)}
                        aria-label={`Vybrat objednávku ${order.orderNumber}`}
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.id} className="px-6 py-4 whitespace-nowrap">
                        {renderCell(order, column.id)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
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
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasFilters ? 'Žádné výsledky' : 'Žádné objednávky'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {hasFilters
                ? 'Žádné objednávky neodpovídají zvoleným filtrům. Zkuste upravit nebo vymazat filtry.'
                : 'Zatím nemáte žádné objednávky. Vytvořte první objednávku pro začátek.'}
            </p>
            {hasFilters ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Vymazat filtry
              </button>
            ) : (
              <Link
                href="/admin/orders/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Nová objednávka
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Confirm Dialog */}
      {ConfirmDialogComponent}
    </div>
  )
}
