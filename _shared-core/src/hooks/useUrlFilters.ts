/**
 * useUrlFilters Hook
 *
 * Synchronizes filter state with URL query parameters
 * Allows shareable/bookmarkable filter URLs
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'

export type FilterValue = string | string[] | number | boolean | null | undefined

export interface Filters {
  [key: string]: FilterValue
}

export interface FilterConfig {
  type: 'string' | 'number' | 'boolean' | 'array'
  defaultValue?: FilterValue
}

export interface FilterConfigs {
  [key: string]: FilterConfig
}

export interface UseUrlFiltersReturn {
  /** Current filters from URL */
  filters: Record<string, any>

  /** Update a single filter (alias for setFilter) */
  updateFilter: (key: string, value: FilterValue) => void

  /** Update a single filter */
  setFilter: (key: string, value: FilterValue) => void

  /** Update multiple filters at once */
  setFilters: (newFilters: Filters) => void

  /** Clear a single filter */
  clearFilter: (key: string) => void

  /** Clear all filters */
  clearAllFilters: () => void

  /** Check if any filters are active */
  hasFilters: boolean

  /** Get filter value by key */
  getFilter: <T = FilterValue>(key: string, defaultValue?: T) => T
}

export function useUrlFilters(config?: FilterConfigs): UseUrlFiltersReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Store config in ref to avoid re-renders when config object changes reference
  const configRef = useRef(config)
  configRef.current = config

  // Parse current filters from URL with config support
  const filters = useMemo(() => {
    const params: Record<string, any> = {}
    const cfg = configRef.current

    // Initialize with default values from config
    if (cfg) {
      Object.entries(cfg).forEach(([key, cfgItem]) => {
        if (cfgItem.defaultValue !== undefined) {
          params[key] = cfgItem.defaultValue
        } else if (cfgItem.type === 'array') {
          params[key] = []
        }
      })
    }

    searchParams?.forEach((value, key) => {
      // Handle multi-value params (e.g., ?status=new&status=confirmed)
      const existing = searchParams.getAll(key)
      const keyConfig = cfg?.[key]

      if (keyConfig?.type === 'array' || existing.length > 1) {
        params[key] = existing
      } else {
        // Try to parse as number/boolean
        if (value === 'true') params[key] = true
        else if (value === 'false') params[key] = false
        else if (!isNaN(Number(value)) && value !== '') params[key] = Number(value)
        else params[key] = value
      }
    })

    return params
  }, [searchParams]) // Removed config from dependencies - it's now in ref

  // Helper: Build URL with new params
  const buildUrl = useCallback((newParams: Filters) => {
    const params = new URLSearchParams()

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        // Skip empty values
        return
      }

      if (Array.isArray(value)) {
        // Multi-value param
        value.forEach(v => {
          if (v !== null && v !== undefined && v !== '') {
            params.append(key, String(v))
          }
        })
      } else {
        params.set(key, String(value))
      }
    })

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [pathname])

  // Set single filter
  const setFilter = useCallback((key: string, value: FilterValue) => {
    const newFilters = { ...filters, [key]: value }
    router.push(buildUrl(newFilters), { scroll: false })
  }, [filters, buildUrl, router])

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Filters) => {
    const merged = { ...filters, ...newFilters }
    router.push(buildUrl(merged), { scroll: false })
  }, [filters, buildUrl, router])

  // Clear single filter
  const clearFilter = useCallback((key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    router.push(buildUrl(newFilters), { scroll: false })
  }, [filters, buildUrl, router])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  // Check if any filters are active
  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0
  }, [filters])

  // Get filter value with type safety
  const getFilter = useCallback(<T = FilterValue>(key: string, defaultValue?: T): T => {
    const value = filters[key]
    return (value !== undefined ? value : defaultValue) as T
  }, [filters])

  return {
    filters,
    setFilter,
    updateFilter: setFilter, // Alias for setFilter
    setFilters,
    clearFilter,
    clearAllFilters,
    hasFilters,
    getFilter
  }
}
