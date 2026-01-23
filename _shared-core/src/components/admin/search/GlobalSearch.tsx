'use client'

/**
 * Global Search Modal
 *
 * Features:
 * - ⌘K / Ctrl+K keyboard shortcut
 * - Live search with debouncing
 * - Keyboard navigation (↑↓, Enter, ESC)
 * - Command palette mode (> prefix)
 * - Recent searches
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Search, Command, ArrowRight, Clock } from 'lucide-react'
import { useAdminUIStore } from '@/stores/adminUIStore'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { toast } from '@/components/admin/notifications/ToastProvider'

interface SearchResult {
  id: string
  type: string
  title: string
  subtitle?: string
  url: string
  icon: string
}

interface CommandAction {
  id: string
  name: string
  shortcut?: string
  action: () => void
  icon: string
}

export function GlobalSearch() {
  const router = useRouter()
  const { searchModalOpen, setSearchModalOpen, addRecentItem } = useAdminUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [commandMode, setCommandMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Commands for command palette
  const commands: CommandAction[] = useMemo(() => [
    {
      id: 'new-order',
      name: 'Nová objednávka',
      shortcut: '⌘N',
      action: () => {
        router.push('/admin/orders/new')
        setSearchModalOpen(false)
        toast.success('Vytváření nové objednávky')
      },
      icon: '🛒'
    },
    {
      id: 'new-performance',
      name: 'Nové představení',
      action: () => {
        router.push('/admin/performances/new')
        setSearchModalOpen(false)
        toast.success('Vytváření nového představení')
      },
      icon: '🎭'
    },
    {
      id: 'new-event',
      name: 'Nová akce',
      action: () => {
        router.push('/admin/events/new')
        setSearchModalOpen(false)
        toast.success('Vytváření nové akce')
      },
      icon: '📅'
    },
    {
      id: 'new-post',
      name: 'Nová aktualita',
      action: () => {
        router.push('/admin/posts/new')
        setSearchModalOpen(false)
        toast.success('Vytváření nové aktuality')
      },
      icon: '📰'
    },
    {
      id: 'goto-dashboard',
      name: 'Přejít na Dashboard',
      shortcut: 'GD',
      action: () => {
        router.push('/admin')
        setSearchModalOpen(false)
      },
      icon: '🏠'
    },
    {
      id: 'goto-orders',
      name: 'Přejít na Objednávky',
      shortcut: 'GO',
      action: () => {
        router.push('/admin/orders')
        setSearchModalOpen(false)
      },
      icon: '🛒'
    },
    {
      id: 'goto-performances',
      name: 'Přejít na Inscenace',
      shortcut: 'GP',
      action: () => {
        router.push('/admin/performances')
        setSearchModalOpen(false)
      },
      icon: '🎭'
    },
  ], [router, setSearchModalOpen])

  // Open modal with ⌘K / Ctrl+K
  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    setSearchModalOpen(true)
  }, { enableOnFormTags: true })

  // Close modal with ESC
  useHotkeys('escape', () => {
    if (searchModalOpen) {
      setSearchModalOpen(false)
    }
  }, { enableOnFormTags: true, enabled: searchModalOpen })

  // Navigate with arrow keys
  useHotkeys('up', (e) => {
    e.preventDefault()
    setSelectedIndex(i => Math.max(0, i - 1))
  }, { enableOnFormTags: true, enabled: searchModalOpen })

  useHotkeys('down', (e) => {
    e.preventDefault()
    const maxIndex = commandMode ? filteredCommands.length - 1 : results.length - 1
    setSelectedIndex(i => Math.min(maxIndex, i + 1))
  }, { enableOnFormTags: true, enabled: searchModalOpen })

  // Select with Enter
  useHotkeys('enter', (e) => {
    e.preventDefault()
    if (commandMode && filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action()
    } else if (results[selectedIndex]) {
      handleResultClick(results[selectedIndex])
    }
  }, { enableOnFormTags: true, enabled: searchModalOpen })

  // Detect command mode (> prefix)
  useEffect(() => {
    if (query.startsWith('>')) {
      setCommandMode(true)
    } else {
      setCommandMode(false)
    }
  }, [query])

  // Search API call
  useEffect(() => {
    if (!searchModalOpen) return
    if (commandMode) return
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
        toast.error('Chyba při vyhledávání')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery, searchModalOpen, commandMode])

  // Filter commands in command mode
  const filteredCommands = useMemo(() => {
    if (!commandMode) return []
    const searchTerm = query.slice(1).toLowerCase()
    if (!searchTerm) return commands
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchTerm) ||
      cmd.shortcut?.toLowerCase().includes(searchTerm)
    )
  }, [query, commandMode, commands])

  // Reset state when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setCommandMode(false)
      // Focus input after a brief delay
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchModalOpen])

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    addRecentItem({
      id: result.id,
      type: result.type as any,
      title: result.title,
      url: result.url
    })
    router.push(result.url)
    setSearchModalOpen(false)
  }

  return (
    <Dialog
      open={searchModalOpen}
      onClose={() => setSearchModalOpen(false)}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-[10vh]">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden text-gray-900">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            {commandMode ? (
              <Command className="h-5 w-5 text-blue-600 flex-shrink-0" />
            ) : (
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={commandMode ? "Vyhledat příkaz..." : "Vyhledat cokoli... (použijte > pro příkazy)"}
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-lg"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Command Mode */}
            {commandMode && (
              <div className="p-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Žádné příkazy nenalezeny
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((command, index) => (
                      <button
                        key={command.id}
                        onClick={() => command.action()}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors",
                          index === selectedIndex
                            ? "bg-blue-50 text-blue-900"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <span className="text-2xl">{command.icon}</span>
                        <span className="flex-1 font-medium">{command.name}</span>
                        {command.shortcut && (
                          <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Mode */}
            {!commandMode && (
              <div className="p-2">
                {loading && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Vyhledávání...
                  </div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Žádné výsledky nenalezeny
                  </div>
                )}

                {!loading && query.length < 2 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-gray-500 mb-4">Začněte psát pro vyhledávání</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Command className="h-4 w-4" />
                      <span>Tip: Použijte <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">{'>'}</kbd> pro rychlé příkazy</span>
                    </div>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors",
                          index === selectedIndex
                            ? "bg-blue-50 text-blue-900"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          {result.subtitle && (
                            <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                  navigace
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">Enter</kbd>
                  vybrat
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">{'>'}</kbd>
                příkazy
              </span>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
