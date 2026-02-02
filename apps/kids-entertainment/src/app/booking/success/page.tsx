/**
 * Booking Payment Success Page
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, PartyPopper, Calendar, Home } from 'lucide-react'

function PaymentSuccessContent({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-partypal-pink-50 to-partypal-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <PartyPopper className="w-8 h-8 text-partypal-yellow-500 mx-auto animate-bounce" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Platba byla úspěšná!
        </h1>
        <p className="text-gray-600 mb-6">
          Děkujeme za vaši rezervaci. Těšíme se na vaši oslavu!
        </p>

        <div className="bg-partypal-pink-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Co bude následovat?</h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-partypal-pink-200 text-partypal-pink-700 text-xs font-bold flex items-center justify-center mr-2 mt-0.5">
                1
              </span>
              Obdržíte potvrzovací email s detaily rezervace
            </li>
            <li className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-partypal-pink-200 text-partypal-pink-700 text-xs font-bold flex items-center justify-center mr-2 mt-0.5">
                2
              </span>
              Náš tým vás kontaktuje pro upřesnění detailů
            </li>
            <li className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-partypal-pink-200 text-partypal-pink-700 text-xs font-bold flex items-center justify-center mr-2 mt-0.5">
                3
              </span>
              Před oslavou vám připomeneme důležité informace
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-partypal-pink-500 text-white rounded-lg font-medium hover:bg-partypal-pink-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Zpět na hlavní stránku
          </Link>
          <Link
            href="/packages"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Prohlédnout balíčky
          </Link>
        </div>

        {searchParams.session_id && (
          <p className="text-xs text-gray-400 mt-6">
            Číslo transakce: {searchParams.session_id.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  )
}

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
