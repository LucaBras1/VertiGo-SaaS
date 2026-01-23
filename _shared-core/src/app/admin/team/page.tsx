/**
 * Team Members List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Eye, ToggleLeft, Archive } from 'lucide-react'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { FilterBar } from '@/components/admin/filters/FilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/hooks/useToast'
import { formatBooleanForExport, type ExportColumn } from '@/lib/export'

type TeamMember = {
  id: string
  firstName: string
  lastName: string
  role: string
  bio: string | null
  photoUrl: string | null
  photoAlt: string | null
  email: string | null
  phone: string | null
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const statusOptions = [
  { value: 'active', label: 'Aktivní', description: '✅ Zobrazeno na webu' },
  { value: 'inactive', label: 'Neaktivní', description: '⏸️ Skryto na webu' },
]

const exportColumns: ExportColumn<TeamMember>[] = [
  { key: 'firstName', label: 'Jméno' },
  { key: 'lastName', label: 'Příjmení' },
  { key: 'role', label: 'Role' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'bio', label: 'Bio' },
  {
    key: 'isActive',
    label: 'Aktivní',
    format: (value) => formatBooleanForExport(value),
  },
  { key: 'order', label: 'Pořadí' },
]

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { toast } = useToast()

  const { filters, updateFilter, clearFilter, clearAllFilters, hasFilters } = useUrlFilters({
    status: { type: 'array', defaultValue: [] },
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
    items: teamMembers,
    getId: (member) => member.id,
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [page, pageSize, filters])

  const fetchTeamMembers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      filters.status.forEach((s: string) => params.append('status', s))

      const response = await fetch(`/api/admin/team?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.teamMembers || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast('Chyba při načítání členů týmu', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'členy' : 'člena'} týmu?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/team/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Členové týmu úspěšně smazáni', 'success')
        await fetchTeamMembers()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání členů týmu', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání členů týmu', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<TeamMember>) => {
    try {
      const response = await fetch('/api/admin/team/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Členové týmu úspěšně aktualizováni', 'success')
        await fetchTeamMembers()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci členů týmu', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci členů týmu', 'error')
    }
  }

  const handleMarkActive = () => handleBulkUpdate({ isActive: true })
  const handleMarkInactive = () => handleBulkUpdate({ isActive: false })

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tým</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa členů týmu a jejich kontaktních informací
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={teamMembers}
            columns={exportColumns}
            filename={`tym-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/team/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat člena týmu
          </Link>
        </div>
      </div>

      <FilterBar onClear={clearAllFilters} hasFilters={hasFilters}>
        <MultiSelect
          label="Stav"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
          placeholder="Vyberte stavy..."
        />
      </FilterBar>

      <ActiveFilters
        filters={[
          {
            key: 'status',
            label: 'Stav',
            values: (filters.status || []).map(
              (val: string) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
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
              id: 'mark-active',
              label: 'Označit aktivní',
              icon: ToggleLeft,
              onClick: handleMarkActive,
            },
            {
              id: 'mark-inactive',
              label: 'Označit neaktivní',
              icon: Archive,
              onClick: handleMarkInactive,
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Načítám členy týmu...</p>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádní členové týmu nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">Zatím nejsou žádní členové týmu.</p>
              <Link
                href="/admin/team/new"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Přidat prvního člena týmu
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleAll}
                />
                <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCount > 0
                    ? `Vybráno ${selectedCount} z ${teamMembers.length}`
                    : `Všichni členové týmu (${teamMembers.length})`}
                </span>
              </div>
            </li>
            {teamMembers.map((member) => (
              <li key={member.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected(member.id)}
                        onChange={() => toggleItem(member.id)}
                      />

                      <div className="flex-shrink-0 ml-4">
                        {member.photoUrl ? (
                          <div className="h-16 w-16 relative rounded-full overflow-hidden bg-gray-200">
                            <Image
                              src={member.photoUrl}
                              alt={
                                member.photoAlt ||
                                `${member.firstName} ${member.lastName}`
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-blue-600">
                              {member.firstName.charAt(0)}
                              {member.lastName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          {!member.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Neaktivní
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{member.role}</span>
                          {member.email && (
                            <>
                              <span>•</span>
                              <span className="truncate">{member.email}</span>
                            </>
                          )}
                          {member.phone && (
                            <>
                              <span>•</span>
                              <span>{member.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex gap-2">
                      <Link
                        href={`/soubor#${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/team/${member.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Upravit
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

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
