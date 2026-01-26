'use client'

import { CreditCard, Building2, Smartphone } from 'lucide-react'

export function PaymentMethodsCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Platební metody
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Kreditní / Debetní karta</p>
            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            Aktivní
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg opacity-50">
          <Building2 className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Bankovní převod</p>
            <p className="text-sm text-gray-500">Klasický bankovní převod</p>
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            Brzy
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg opacity-50">
          <Smartphone className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Apple Pay / Google Pay</p>
            <p className="text-sm text-gray-500">Mobilní platby</p>
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            Brzy
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Bezpečné platby</strong> - Všechny platby jsou šifrovány a
          zpracovávány přes Stripe, jednoho z nejbezpečnějších poskytovatelů
          platebních služeb na světě.
        </p>
      </div>
    </div>
  )
}
