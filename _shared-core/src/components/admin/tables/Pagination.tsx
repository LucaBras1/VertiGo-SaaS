/**
 * Pagination Component
 * Reusable pagination controls for admin list pages
 */
'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSize?: boolean
}

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true,
}: PaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPreviousPage } =
    pagination

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Info Text */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Zobrazeno <span className="font-medium">{startItem}</span> až{' '}
            <span className="font-medium">{endItem}</span> z{' '}
            <span className="font-medium">{totalItems}</span> záznamů
          </p>

          {/* Page Size Selector */}
          {showPageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Na stránku:
              </label>
              <select
                id="pageSize"
                value={itemsPerPage}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-md border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <nav className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
            className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="První stránka"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Předchozí stránka"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex items-center px-4 py-2 text-sm text-gray-700"
                  >
                    ...
                  </span>
                )
              }

              const pageNum = page as number
              const isCurrentPage = pageNum === currentPage

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    isCurrentPage
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={`Stránka ${pageNum}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          {/* Mobile: Current Page Display */}
          <div className="sm:hidden">
            <span className="text-sm text-gray-700">
              Stránka {currentPage} z {totalPages}
            </span>
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Další stránka"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className="inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Poslední stránka"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
