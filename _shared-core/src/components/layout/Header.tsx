'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import AnimatedLogo from './AnimatedLogo'

interface MenuItem {
  label: string
  href: string
  submenu?: Array<{
    label: string
    href?: string
    icon?: string
  }>
}

// Import constants dynamically to avoid cache issues
const SITE_NAME = 'Divadlo Studna'
const NAVIGATION: MenuItem[] = [
  { label: 'Program', href: '/program' },
  {
    label: 'Repertoár',
    href: '/repertoar',
    submenu: [
      { label: 'Všechna představení', href: '/repertoar' },
      { label: '🎭 Divadelní představení', href: '/repertoar?category=theatre' },
      { label: '🚶 Chůdová představení', href: '/repertoar?category=stilts' },
      { label: '🎵 Hudební produkce', href: '/repertoar?category=music' },
      { label: 'divider' },
      { label: '📦 Již nehrajeme', href: '/archiv' },
    ]
  },
  {
    label: 'Doprovodný program',
    href: '/hry',
    submenu: [
      { label: 'Vše', href: '/hry' },
      { label: '🎯 Interaktivní hry', href: '/hry#hry' },
      { label: 'divider' },
      { label: '🚲 Jednokolkový trenažér', href: '/hry/jednokolkovy-trenazer' },
      { label: '🎭 Divadelní ateliér', href: '/hry/divadelni-atelier' },
      { label: '🎨 Divadelní dílna', href: '/hry/divadelni-dilna' },
      { label: '✉️ Andělská pošta', href: '/hry/andelska-posta' },
    ]
  },
  {
    label: 'O nás',
    href: '/soubor',
    submenu: [
      { label: '👥 Náš soubor', href: '/soubor' },
      { label: '📖 Náš příběh', href: '/nas-pribeh' },
    ]
  },
  {
    label: 'Pro pořadatele',
    href: '/pro-poradatele',
    submenu: [
      { label: '📋 Informace pro pořadatele', href: '/pro-poradatele' },
      { label: '💰 Ceník', href: '/cenik' },
    ]
  },
  { label: 'Aktuality', href: '/aktuality' },
  { label: 'Kontakt', href: '/kontakt' },
]

interface HeaderProps {
  menuItems?: MenuItem[]
  siteName?: string
}

export default function Header({ menuItems, siteName }: HeaderProps = {}) {
  const navigation = menuItems || NAVIGATION
  const name = siteName || SITE_NAME
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-gray-900/95 backdrop-blur-sm shadow-lg'
          : 'bg-neutral-gray-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Site Name */}
          <Link
            href="/"
            className="group flex items-center gap-3 md:gap-4"
          >
            <span className="text-2xl md:text-3xl font-serif font-bold text-primary hover:text-primary-dark transition-colors">
              {name}
            </span>
            <div className="bg-white rounded-full p-1.5 md:p-2 shadow-lg">
              <AnimatedLogo
                src="/images/logo.gif"
                alt="Divadlo Studna Logo"
                className="w-12 h-12 md:w-14 md:h-14"
                animationDuration={2500}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => {
              const hasSubmenu = 'submenu' in item && item.submenu

              if (hasSubmenu) {
                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      className="text-lg font-medium text-white hover:text-primary transition-all duration-300 relative flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10"
                    >
                      {item.label}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="absolute bottom-1 left-3 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-1.5rem)]" />
                    </Link>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-gray-800 rounded-lg shadow-lg border border-neutral-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.submenu!.map((subitem, index) => {
                          if (subitem.label === 'divider') {
                            return <div key={index} className="my-2 border-t border-neutral-gray-600" />
                          }
                          const href = 'href' in subitem ? subitem.href || '#' : '#'
                          const icon = 'icon' in subitem ? subitem.icon : undefined
                          return (
                            <Link
                              key={href !== '#' ? href : index}
                              href={href}
                              className="block px-4 py-2 text-sm text-neutral-gray-100 hover:bg-primary/20 hover:text-primary transition-colors"
                            >
                              {icon ? `${icon} ` : ''}{subitem.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-white hover:text-primary transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item.label}
                  <span className="absolute bottom-1 left-3 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-1.5rem)]" />
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 text-white hover:text-primary hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMobileMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-neutral-gray-800 border-t border-neutral-gray-600">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navigation.map((item) => {
              const hasSubmenu = 'submenu' in item && item.submenu
              const isSubmenuOpen = openMobileSubmenu === item.href

              if (hasSubmenu) {
                return (
                  <div key={item.href} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 px-4 py-3 text-lg font-medium text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                      >
                        {item.label}
                      </Link>
                      <button
                        onClick={() => setOpenMobileSubmenu(isSubmenuOpen ? null : item.href)}
                        className="px-3 py-3 text-neutral-gray-200 hover:text-primary transition-colors"
                        aria-label={isSubmenuOpen ? 'Zavřít podmenu' : 'Otevřít podmenu'}
                      >
                        <svg className={`w-5 h-5 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Mobile Submenu */}
                    {isSubmenuOpen && (
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        {item.submenu!.map((subitem, index) => {
                          if (subitem.label === 'divider') {
                            return <div key={index} className="my-1 border-t border-neutral-gray-600" />
                          }
                          const href = 'href' in subitem ? subitem.href || '#' : '#'
                          const icon = 'icon' in subitem ? subitem.icon : undefined
                          return (
                            <Link
                              key={href !== '#' ? href : index}
                              href={href}
                              onClick={() => {
                                setIsMobileMenuOpen(false)
                                setOpenMobileSubmenu(null)
                              }}
                              className="px-4 py-2 text-sm text-neutral-gray-100 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                            >
                              {icon ? `${icon} ` : ''}{subitem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-lg font-medium text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
