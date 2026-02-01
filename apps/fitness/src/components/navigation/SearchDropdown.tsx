'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Calendar, Users, FileText, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  type: 'client' | 'session' | 'class' | 'invoice'
  id: string
  title: string
  subtitle?: string
  url: string
  icon?: string
}

const iconMap = {
  user: User,
  calendar: Calendar,
  users: Users,
  'file-text': FileText,
}

const typeLabels = {
  client: 'Klient',
  session: 'Session',
  class: 'Lekce',
  invoice: 'Faktura',
}

export function SearchDropdown() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  const searchTimeout = useRef<NodeJS.Timeout>()

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query, performSearch])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToResult(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const getIcon = (iconName?: string) => {
    const Icon = iconName && iconMap[iconName as keyof typeof iconMap]
    return Icon || User
  }

  return (
    <div className="relative flex-1 max-w-lg" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Hledat klienty, sessions..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto">
          {results.length === 0 && !isLoading && query.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Nenalezeny žádné výsledky pro "{query}"
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result, index) => {
                const Icon = getIcon(result.icon)
                return (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => navigateToResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                        selectedIndex === index && 'bg-gray-50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                          result.type === 'client' && 'bg-blue-100 text-blue-600',
                          result.type === 'session' && 'bg-green-100 text-green-600',
                          result.type === 'class' && 'bg-purple-100 text-purple-600',
                          result.type === 'invoice' && 'bg-orange-100 text-orange-600'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        {typeLabels[result.type]}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {query.length >= 2 && (
            <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
              Stiskněte Enter pro výběr, Escape pro zavření
            </div>
          )}
        </div>
      )}
    </div>
  )
}
