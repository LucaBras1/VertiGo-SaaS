'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, User } from 'lucide-react'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white transition-transform hover:scale-105 dark:bg-brand-500"
      >
        A
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Admin</p>
              <p className="text-xs text-neutral-500">admin@teamforge.cz</p>
            </div>
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <User className="h-4 w-4" />
              View Site
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-950"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
