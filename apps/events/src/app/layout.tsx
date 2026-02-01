import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EventPro - Professional Event Management Platform',
  description: 'Streamline your event planning with AI-powered timeline optimization, performer management, and seamless coordination.',
  keywords: 'event management, event planning, performer booking, timeline optimization, event coordination',
  openGraph: {
    title: 'EventPro - Professional Event Management',
    description: 'AI-powered event management platform for professionals',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-gradient-to-br from-purple-50 via-white to-orange-50 min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
