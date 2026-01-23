import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { AIFeatures } from '@/components/landing/AIFeatures'
import { Pricing } from '@/components/landing/Pricing'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <AIFeatures />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
