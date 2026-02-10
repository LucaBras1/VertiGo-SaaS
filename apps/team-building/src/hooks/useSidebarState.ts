'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'teamforge-sidebar-collapsed'

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setIsCollapsed(JSON.parse(stored))
      }
    } catch {}
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

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
