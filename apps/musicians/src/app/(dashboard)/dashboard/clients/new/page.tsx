'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/forms/ClientForm'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na seznam
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nový klient</h1>
        <p className="text-gray-600 mt-1">Přidejte nového klienta do databáze</p>
      </div>
      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </div>
  )
}
