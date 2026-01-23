/**
 * usePagination Hook
 * Manages pagination state in URL search params
 */
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
}

interface UsePaginationReturn {
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetPagination: () => void
}

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { defaultPage = 1, defaultPageSize = 25 } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current pagination values from URL
  const page = Number(searchParams.get('page')) || defaultPage
  const pageSize = Number(searchParams.get('pageSize')) || defaultPageSize

  // Update URL with new params
  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const setPage = useCallback(
    (newPage: number) => {
      updateUrl({ page: newPage > 1 ? String(newPage) : null })
    },
    [updateUrl]
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      // When changing page size, reset to first page
      updateUrl({
        pageSize: newPageSize !== defaultPageSize ? String(newPageSize) : null,
        page: null,
      })
    },
    [updateUrl, defaultPageSize]
  )

  const resetPagination = useCallback(() => {
    updateUrl({ page: null, pageSize: null })
  }, [updateUrl])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPagination,
  }
}
