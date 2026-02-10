'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/forms/ClientForm'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na seznam
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nový klient</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Přidejte nového klienta do databáze</p>
      </div>
      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </div>
  )
}
