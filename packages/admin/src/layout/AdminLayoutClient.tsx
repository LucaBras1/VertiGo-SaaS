'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSidebarState } from '../hooks/useSidebarState'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { pageTransition } from '@vertigo/ui'
import type { AdminConfig } from '../types'

interface AdminLayoutClientProps {
  config: AdminConfig
  children: React.ReactNode
}

export function AdminLayoutClient({ config, children }: AdminLayoutClientProps) {
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebarState(config.storageKeyPrefix)
  const [isDesktop, setIsDesktop] = useState(false)
  const sidebarWidth = isCollapsed ? 72 : 256

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminSidebar
        config={config}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={closeMobile}
      />

      <AdminTopbar
        config={config}
        sidebarWidth={isDesktop ? sidebarWidth : 0}
        onMobileMenuToggle={toggleMobile}
      />

      <motion.main
        className="pt-14 min-h-screen"
        animate={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="p-6 sm:p-8"
          variants={pageTransition}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  )
}
