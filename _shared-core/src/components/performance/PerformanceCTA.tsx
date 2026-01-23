'use client'

import Link from 'next/link'
import { OrderButton } from '@/components/order'

interface PerformanceCTAProps {
  performanceId: string
  performanceTitle: string
}

/**
 * CTA section for performance detail page
 * Includes Order button and Contact link
 */
export function PerformanceCTA({ performanceId, performanceTitle }: PerformanceCTAProps) {
  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-6">
      <h3 className="text-lg font-bold mb-2">Máte zájem?</h3>
      <p className="text-white/90 text-sm mb-4">
        Pozvěte nás k vám a přivezeme vám nezapomenutelný zážitek
      </p>

      {/* Primary CTA - Order Modal */}
      <OrderButton
        performanceId={performanceId}
        performanceTitle={performanceTitle}
        variant="secondary"
        className="w-full bg-white text-primary hover:bg-neutral-100 mb-3"
      >
        Pozvěte nás k vám
      </OrderButton>

      {/* Secondary CTA - Contact link */}
      <Link
        href="/kontakt"
        className="block w-full text-center py-2.5 text-white/80 hover:text-white text-sm transition-colors"
      >
        Mám dotaz →
      </Link>
    </div>
  )
}
