'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SongForm } from '@/components/forms/SongForm'

export default function NewSongPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/repertoire"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na repertoár
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Přidat píseň</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Přidejte novou píseň do repertoáru</p>
      </div>
      <div className="max-w-2xl">
        <SongForm />
      </div>
    </div>
  )
}
