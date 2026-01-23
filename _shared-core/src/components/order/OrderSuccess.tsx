'use client'

import Link from 'next/link'

interface OrderSuccessProps {
  orderNumber: string
  email: string
  onClose: () => void
}

/**
 * Success state component shown after successful order submission
 */
export function OrderSuccess({ orderNumber, email, onClose }: OrderSuccessProps) {
  return (
    <div className="text-center py-8 px-4">
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-2">
        Poptávka odeslána!
      </h3>

      {/* Order Number */}
      <p className="text-neutral-gray-200 mb-6">
        Číslo poptávky: <span className="font-semibold text-primary">{orderNumber}</span>
      </p>

      {/* What happens next */}
      <div className="bg-neutral-gray-800 rounded-lg p-6 mb-6 text-left">
        <h4 className="font-semibold text-white mb-4">Co bude následovat?</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm">
              1
            </span>
            <span className="text-neutral-gray-200">
              Do 24 hodin vám zašleme cenovou nabídku
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm">
              2
            </span>
            <span className="text-neutral-gray-200">
              Po vašem potvrzení rezervujeme termín
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm">
              3
            </span>
            <span className="text-neutral-gray-200">
              Před akcí vám zašleme vše potřebné
            </span>
          </li>
        </ul>
      </div>

      {/* Email confirmation */}
      <p className="text-sm text-neutral-gray-300 mb-8">
        Potvrzení jsme zaslali na:{' '}
        <span className="text-white font-medium">{email}</span>
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-neutral-gray-700 hover:bg-neutral-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Zpět na představení
        </button>
        <Link
          href="/repertoar"
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors text-center"
        >
          Další pohádky
        </Link>
      </div>
    </div>
  )
}
