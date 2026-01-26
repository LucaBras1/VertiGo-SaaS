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
          href="/dashboard/gigs"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na seznam
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nový gig</h1>
        <p className="text-gray-600 mt-1">
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
