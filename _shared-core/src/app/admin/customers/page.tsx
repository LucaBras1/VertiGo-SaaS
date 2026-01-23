/**
 * Customers List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Tag, Mail, Phone, Building, MapPin } from 'lucide-react'
import type { Customer } from '@/types/admin'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { useColumnVisibility, type ColumnDefinition } from '@/hooks/useColumnVisibility'
import { CollapsibleFilterBar } from '@/components/admin/filters/CollapsibleFilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { SearchInput } from '@/components/admin/filters/SearchInput'
import { BooleanFilter } from '@/components/admin/filters/BooleanFilter'
import { DateRangePicker } from '@/components/admin/filters/DateRangePicker'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { ColumnToggle } from '@/components/admin/tables/ColumnToggle'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/hooks/useToast'
import { formatBooleanForExport, type ExportColumn } from '@/lib/export'
import { VyfakturujSyncPanel } from '@/components/admin/VyfakturujSyncPanel'

const orgTypeOptions = [
  { value: 'elementary_school', label: 'Základní škola', description: 'ZŠ' },
  { value: 'kindergarten', label: 'Mateřská škola', description: 'MŠ' },
  { value: 'high_school', label: 'Střední škola', description: 'SŠ' },
  { value: 'cultural_center', label: 'Kulturní centrum', description: 'KC' },
  { value: 'municipality', label: 'Městský úřad', description: 'Úřad' },
  { value: 'private_company', label: 'Soukromá firma', description: 'Firma' },
  { value: 'nonprofit', label: 'Nezisková organizace', description: 'NPO' },
  { value: 'other', label: 'Jiné', description: 'Ostatní' },
]

const orgTypeLabels: Record<string, string> = {
  elementary_school: 'Základní škola',
  kindergarten: 'Mateřská škola',
  high_school: 'Střední škola',
  cultural_center: 'Kulturní centrum',
  municipality: 'Městský úřad',
  private_company: 'Soukromá firma',
  nonprofit: 'Nezisková organizace',
  other: 'Jiné',
}

// Column definitions
const customerColumns: ColumnDefinition<Customer>[] = [
  {
    id: 'name',
    label: 'Jméno',
    defaultVisible: true,
    canHide: false,
  },
  {
    id: 'email',
    label: 'Email',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'phone',
    label: 'Telefon',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'organization',
    label: 'Organizace',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'organizationType',
    label: 'Typ organizace',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'city',
    label: 'Město',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'street',
    label: 'Ulice',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'postalCode',
    label: 'PSČ',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'ico',
    label: 'IČO',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'dic',
    label: 'DIČ',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'tags',
    label: 'Štítky',
    defaultVisible: true,
    canHide: true,
  },
  {
    id: 'gdprMarketing',
    label: 'GDPR Marketing',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'createdAt',
    label: 'Vytvořeno',
    defaultVisible: false,
    canHide: true,
  },
  {
    id: 'notes',
    label: 'Poznámky',
    defaultVisible: false,
    canHide: true,
  },
]

const exportColumns: ExportColumn<Customer>[] = [
  { key: 'firstName', label: 'Jméno' },
  { key: 'lastName', label: 'Příjmení' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'organization', label: 'Organizace' },
  {
    key: 'organizationType',
    label: 'Typ organizace',
    format: (value) => (value ? orgTypeLabels[value] || value : ''),
  },
  {
    key: 'address',
    label: 'Ulice',
    format: (value) => value?.street || '',
  },
  {
    key: 'address',
    label: 'Město',
    format: (value) => value?.city || '',
  },
  {
    key: 'address',
    label: 'PSČ',
    format: (value) => value?.postalCode || '',
  },
  {
    key: 'billingInfo',
    label: 'IČO',
    format: (value) => value?.ico || '',
  },
  {
    key: 'billingInfo',
    label: 'DIČ',
    format: (value) => value?.dic || '',
  },
  {
    key: 'tags',
    label: 'Štítky',
    format: (value) => (Array.isArray(value) ? value.join(', ') : ''),
  },
  {
    key: 'gdprConsent',
    label: 'GDPR Marketing',
    format: (value) => formatBooleanForExport(value?.marketing),
  },
  {
    key: 'notes',
    label: 'Poznámky',
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([])
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([])
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
    isVisible,
  } = useColumnVisibility({
    columns: customerColumns,
    storageKey: 'admin-customers',
  })

  const { filters, updateFilter, clearFilter, clearAllFilters, hasFilters } = useUrlFilters({
    search: { type: 'string', defaultValue: '' },
    orgType: { type: 'array', defaultValue: [] },
    city: { type: 'array', defaultValue: [] },
    tags: { type: 'array', defaultValue: [] },
    hasEmail: { type: 'boolean', defaultValue: undefined },
    hasPhone: { type: 'boolean', defaultValue: undefined },
    hasOrganization: { type: 'boolean', defaultValue: undefined },
    hasIco: { type: 'boolean', defaultValue: undefined },
    gdprMarketing: { type: 'boolean', defaultValue: undefined },
    createdFrom: { type: 'string', defaultValue: null },
    createdTo: { type: 'string', defaultValue: null },
  })

  const { page, pageSize, setPage, setPageSize } = usePagination({ defaultPageSize: 25 })

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
    items: customers,
    getId: (customer) => customer.id,
  })

  // Stable filter key for useEffect dependency
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filtersKey])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/customers', { method: 'OPTIONS' })
      if (response.ok) {
        const result = await response.json()
        setCityOptions((result.cities || []).map((c: string) => ({ value: c, label: c })))
        setTagOptions((result.tags || []).map((t: string) => ({ value: t, label: t })))
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      const search = filters.search as string
      if (search) params.set('search', search)

      const orgTypes = filters.orgType as string[] || []
      orgTypes.forEach(type => params.append('orgType', type))

      const cities = filters.city as string[] || []
      cities.forEach(city => params.append('city', city))

      const tags = filters.tags as string[] || []
      tags.forEach(tag => params.append('tags', tag))

      // Boolean filters
      if (filters.hasEmail !== undefined) params.set('hasEmail', String(filters.hasEmail))
      if (filters.hasPhone !== undefined) params.set('hasPhone', String(filters.hasPhone))
      if (filters.hasOrganization !== undefined) params.set('hasOrganization', String(filters.hasOrganization))
      if (filters.hasIco !== undefined) params.set('hasIco', String(filters.hasIco))
      if (filters.gdprMarketing !== undefined) params.set('gdprMarketing', String(filters.gdprMarketing))

      // Date filters
      if (filters.createdFrom) params.set('createdFrom', filters.createdFrom as string)
      if (filters.createdTo) params.set('createdTo', filters.createdTo as string)

      const response = await fetch(`/api/admin/customers?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setCustomers(result.customers || [])
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast('Chyba při načítání zákazníků', 'error')
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
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'zákazníky' : 'zákazníka'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/customers/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Zákazníci úspěšně smazáni', 'success')
        await fetchCustomers()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání zákazníků', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání zákazníků', 'error')
    }
  }

  // Render cell content based on column
  const renderCell = (customer: Customer, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {customer.firstName} {customer.lastName}
            </div>
            {isVisible('city') ? null : (
              <div className="text-sm text-gray-500">{customer.address?.city}</div>
            )}
          </div>
        )
      case 'email':
        return <div className="text-sm text-gray-900">{customer.email || '-'}</div>
      case 'phone':
        return <div className="text-sm text-gray-500">{customer.phone || '-'}</div>
      case 'organization':
        return <div className="text-sm text-gray-900">{customer.organization || '-'}</div>
      case 'organizationType':
        return (
          <div className="text-sm text-gray-500">
            {customer.organizationType ? orgTypeLabels[customer.organizationType] : '-'}
          </div>
        )
      case 'city':
        return <div className="text-sm text-gray-900">{customer.address?.city || '-'}</div>
      case 'street':
        return <div className="text-sm text-gray-900">{customer.address?.street || '-'}</div>
      case 'postalCode':
        return <div className="text-sm text-gray-900">{customer.address?.postalCode || '-'}</div>
      case 'ico':
        return <div className="text-sm text-gray-900 font-mono">{customer.billingInfo?.ico || '-'}</div>
      case 'dic':
        return <div className="text-sm text-gray-900 font-mono">{customer.billingInfo?.dic || '-'}</div>
      case 'tags':
        return (
          <div className="flex flex-wrap gap-1">
            {customer.tags && customer.tags.length > 0 ? (
              customer.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        )
      case 'gdprMarketing':
        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              customer.gdprConsent?.marketing
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {customer.gdprConsent?.marketing ? 'Ano' : 'Ne'}
          </span>
        )
      case 'createdAt':
        return (
          <div className="text-sm text-gray-500">
            {customer.createdAt
              ? new Date(customer.createdAt).toLocaleDateString('cs-CZ')
              : '-'}
          </div>
        )
      case 'notes':
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate" title={customer.notes || ''}>
            {customer.notes || '-'}
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
          <h1 className="text-3xl font-bold text-gray-900">Zákazníci</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa zákazníků a jejich údajů
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ColumnToggle
            columns={columns}
            columnVisibility={columnVisibility}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            onShowAll={showAll}
            onHideAll={hideAll}
          />
          <ExportButton
            data={customers}
            columns={exportColumns}
            filename={`zakaznici-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Nový zákazník
          </Link>
        </div>
      </div>

      {/* Vyfakturuj Sync Panel */}
      <div className="mb-6">
        <VyfakturujSyncPanel onSyncComplete={fetchCustomers} />
      </div>

      <CollapsibleFilterBar
        storageKey="customers"
        onClear={clearAllFilters}
        hasFilters={hasFilters}
        activeFilterCount={
          (filters.search ? 1 : 0) +
          ((filters.orgType as string[])?.length || 0) +
          ((filters.city as string[])?.length || 0) +
          ((filters.tags as string[])?.length || 0) +
          (filters.hasEmail !== undefined ? 1 : 0) +
          (filters.hasPhone !== undefined ? 1 : 0) +
          (filters.hasOrganization !== undefined ? 1 : 0) +
          (filters.hasIco !== undefined ? 1 : 0) +
          (filters.gdprMarketing !== undefined ? 1 : 0) +
          (filters.createdFrom || filters.createdTo ? 1 : 0)
        }
        activeAdvancedFilterCount={
          ((filters.tags as string[])?.length || 0) +
          (filters.hasEmail !== undefined ? 1 : 0) +
          (filters.hasPhone !== undefined ? 1 : 0) +
          (filters.hasOrganization !== undefined ? 1 : 0) +
          (filters.hasIco !== undefined ? 1 : 0) +
          (filters.gdprMarketing !== undefined ? 1 : 0) +
          (filters.createdFrom || filters.createdTo ? 1 : 0)
        }
        basicFilters={
          <>
            <SearchInput
              value={(filters.search as string) || ''}
              onChange={handleSearchChange}
              placeholder="Hledat jmeno, email, ICO, organizaci..."
              className="lg:col-span-2"
            />
            <MultiSelect
              label="Typ organizace"
              options={orgTypeOptions}
              value={(filters.orgType as string[]) || []}
              onChange={(value) => updateFilter('orgType', value)}
              placeholder="Vyberte typy..."
            />
            <MultiSelect
              label="Mesto"
              options={cityOptions}
              value={(filters.city as string[]) || []}
              onChange={(value) => updateFilter('city', value)}
              placeholder="Vyberte mesta..."
            />
          </>
        }
        advancedFilters={
          <>
            <MultiSelect
              label="Stitky"
              options={tagOptions}
              value={(filters.tags as string[]) || []}
              onChange={(value) => updateFilter('tags', value)}
              placeholder="Vyberte stitky..."
            />
            <BooleanFilter
              label="Ma email"
              value={filters.hasEmail as boolean | undefined}
              onChange={(value) => updateFilter('hasEmail', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Ma telefon"
              value={filters.hasPhone as boolean | undefined}
              onChange={(value) => updateFilter('hasPhone', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Ma organizaci"
              value={filters.hasOrganization as boolean | undefined}
              onChange={(value) => updateFilter('hasOrganization', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="Ma ICO"
              value={filters.hasIco as boolean | undefined}
              onChange={(value) => updateFilter('hasIco', value)}
              trueLabel="Ano"
              falseLabel="Ne"
            />
            <BooleanFilter
              label="GDPR Marketing"
              value={filters.gdprMarketing as boolean | undefined}
              onChange={(value) => updateFilter('gdprMarketing', value)}
              trueLabel="Souhlasi"
              falseLabel="Nesouhlasi"
            />
            <DateRangePicker
              label="Datum vytvoreni"
              from={filters.createdFrom ? new Date(filters.createdFrom as string) : undefined}
              to={filters.createdTo ? new Date(filters.createdTo as string) : undefined}
              onSelect={(range) => {
                updateFilter('createdFrom', range?.from ? range.from.toISOString() : null)
                updateFilter('createdTo', range?.to ? range.to.toISOString() : null)
              }}
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
            key: 'orgType',
            label: 'Typ organizace',
            values: ((filters.orgType as string[]) || []).map(
              (val) => orgTypeOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('orgType'),
          },
          {
            key: 'city',
            label: 'Město',
            values: (filters.city as string[]) || [],
            onClear: () => clearFilter('city'),
          },
          {
            key: 'tags',
            label: 'Štítky',
            values: (filters.tags as string[]) || [],
            onClear: () => clearFilter('tags'),
          },
          {
            key: 'hasEmail',
            label: 'Má email',
            values: filters.hasEmail !== undefined ? [filters.hasEmail ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('hasEmail'),
          },
          {
            key: 'hasPhone',
            label: 'Má telefon',
            values: filters.hasPhone !== undefined ? [filters.hasPhone ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('hasPhone'),
          },
          {
            key: 'hasOrganization',
            label: 'Má organizaci',
            values: filters.hasOrganization !== undefined ? [filters.hasOrganization ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('hasOrganization'),
          },
          {
            key: 'hasIco',
            label: 'Má IČO',
            values: filters.hasIco !== undefined ? [filters.hasIco ? 'Ano' : 'Ne'] : [],
            onClear: () => clearFilter('hasIco'),
          },
          {
            key: 'gdprMarketing',
            label: 'GDPR Marketing',
            values: filters.gdprMarketing !== undefined ? [filters.gdprMarketing ? 'Souhlasí' : 'Nesouhlasí'] : [],
            onClear: () => clearFilter('gdprMarketing'),
          },
          {
            key: 'created',
            label: 'Vytvořeno',
            values:
              filters.createdFrom || filters.createdTo
                ? [
                    `${filters.createdFrom ? new Date(filters.createdFrom as string).toLocaleDateString('cs-CZ') : '...'} - ${filters.createdTo ? new Date(filters.createdTo as string).toLocaleDateString('cs-CZ') : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('createdFrom')
              clearFilter('createdTo')
            },
          },
        ].filter(f => f.values.length > 0)}
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
          secondaryActions={[]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Načítám zákazníky...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádní zákazníci nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <p className="text-gray-500">Žádní zákazníci nebyli nalezeni.</p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 w-12 bg-gray-50">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={toggleAll}
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={isSelected(customer.id)}
                        onChange={() => toggleItem(customer.id)}
                      />
                    </td>
                    {visibleColumns.map((column) => (
                      <td key={column.id} className="px-6 py-4 whitespace-nowrap">
                        {renderCell(customer, column.id)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/customers/${customer.id}`}
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
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  )
}
