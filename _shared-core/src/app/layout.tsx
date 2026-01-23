import type { Metadata } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper'
import { prisma } from '@/lib/prisma'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700'],
})

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Divadlo Studna | Od roku 1993 vozíme radost po celé ČR',
    template: '%s | Divadlo Studna',
  },
  description: 'Soukromé divadlo s 20+ představeními pro děti i dospělé. Objednávejte zájezdy do škol, mateřinek a kulturních domů. ✓ Profesionální produkce ✓ Reference po celé ČR',
  keywords: ['divadlo', 'divadlo pro děti', 'divadelní představení', 'zájezdy', 'České Budějovice', 'Divadlo Studna'],
  authors: [{ name: 'Divadlo Studna' }],
  creator: 'Divadlo Studna',
  publisher: 'Divadlo Studna',
  metadataBase: new URL('https://divadlo-studna.cz'),
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://divadlo-studna.cz',
    siteName: 'Divadlo Studna',
    title: 'Divadlo Studna | Od roku 1993 vozíme radost po celé ČR',
    description: 'Soukromé divadlo s 20+ představeními pro děti i dospělé.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Načíst nastavení z Prisma (s fallback)
  let settings = null
  try {
    const prismaSettings = await prisma.settings.findFirst()
    if (prismaSettings) {
      // Transform Prisma settings to match expected format
      // Convert address object to string for Footer component
      const addressObj = prismaSettings.address as { street?: string; city?: string; postalCode?: string; country?: string } | null
      const addressString = addressObj
        ? [addressObj.street, addressObj.postalCode, addressObj.city].filter(Boolean).join(', ')
        : undefined

      settings = {
        siteTitle: prismaSettings.siteTitle,
        contactInfo: {
          email: prismaSettings.contactEmail,
          phone: prismaSettings.contactPhone,
          address: addressString,
        },
        socialLinks: prismaSettings.socialLinks,
      }
    }
  } catch (error) {
    console.warn('Failed to fetch settings from Prisma, using fallback', error)
  }

  return (
    <html lang="cs" className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
      <body className={inter.className}>
        <RootLayoutWrapper settings={settings}>
          {children}
        </RootLayoutWrapper>
      </body>
    </html>
  )
}
