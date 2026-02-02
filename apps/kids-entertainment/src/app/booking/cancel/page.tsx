/**
 * Booking Payment Cancelled Page
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { XCircle, ArrowLeft, Phone, Mail } from 'lucide-react'

function PaymentCancelContent({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Platba byla zrušena
        </h1>
        <p className="text-gray-600 mb-6">
          Vaše platba nebyla dokončena. Žádné peníze nebyly odečteny z vašeho účtu.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Co můžete udělat?</h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-partypal-pink-500 mr-2">•</span>
              Zkusit platbu znovu - vaše rezervace je stále platná
            </li>
            <li className="flex items-start">
              <span className="text-partypal-pink-500 mr-2">•</span>
              Kontaktovat nás pro alternativní způsoby platby
            </li>
            <li className="flex items-start">
              <span className="text-partypal-pink-500 mr-2">•</span>
              Vytvořit novou rezervaci s jinými parametry
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-6 py-3 bg-partypal-pink-500 text-white rounded-lg font-medium hover:bg-partypal-pink-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zkusit znovu
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Zpět na hlavní stránku
          </Link>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-500 mb-3">Potřebujete pomoc?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a
              href="tel:+420123456789"
              className="inline-flex items-center justify-center text-partypal-pink-600 hover:text-partypal-pink-700"
            >
              <Phone className="w-4 h-4 mr-1" />
              +420 123 456 789
            </a>
            <a
              href="mailto:info@partypal.cz"
              className="inline-flex items-center justify-center text-partypal-pink-600 hover:text-partypal-pink-700"
            >
              <Mail className="w-4 h-4 mr-1" />
              info@partypal.cz
            </a>
          </div>
        </div>

        {searchParams.order_id && (
          <p className="text-xs text-gray-400 mt-6">
            Číslo objednávky: {searchParams.order_id.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  )
}

export default function BookingCancelPage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Načítání...</div>}>
      <PaymentCancelContent searchParams={searchParams} />
    </Suspense>
  )
}
