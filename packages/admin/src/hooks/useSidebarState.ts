'use client'

import { useState, useEffect, useCallback } from 'react'

export function useSidebarState(storageKeyPrefix: string = 'admin') {
  const storageKey = `${storageKeyPrefix}-sidebar-collapsed`
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        setIsCollapsed(JSON.parse(stored))
      }
    } catch {}
  }, [storageKey])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [storageKey])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  return {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
  }
}
