'use client'

/**
 * Root Layout Wrapper
 *
 * Conditionally renders public Header/Footer based on current path.
 * Admin pages get a clean layout without public navigation.
 */

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface RootLayoutWrapperProps {
  children: React.ReactNode
  settings?: {
    siteTitle?: string
    contactInfo?: any
    socialLinks?: any
  } | null
}

export function RootLayoutWrapper({ children, settings }: RootLayoutWrapperProps) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  // Admin pages - no public header/footer
  if (isAdminPage) {
    return <>{children}</>
  }

  // Public pages - full layout with header/footer
  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:rounded-lg"
      >
        Přeskočit na hlavní obsah
      </a>
      <Header siteName={settings?.siteTitle} />
      <main id="main-content" className="min-h-screen pt-20 md:pt-24">
        {children}
      </main>
      <Footer contactInfo={settings?.contactInfo} socialLinks={settings?.socialLinks} />
    </>
  )
}
