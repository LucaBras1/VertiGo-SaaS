'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GigForm } from '@/components/forms/GigForm'

export default function NewGigPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/gigs"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na seznam
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nový gig</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Vytvořte novou poptávku nebo zakázku
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <GigForm />
      </div>
    </div>
  )
}
