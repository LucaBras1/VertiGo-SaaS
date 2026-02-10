'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GigForm } from '@/components/forms/GigForm'
import toast from 'react-hot-toast'

export default function EditGigPage() {
  const params = useParams()
  const router = useRouter()
  const [gig, setGig] = useState(null)
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/gigs/${params.id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([gigData, clientsData]) => {
      if (!gigData) {
        router.push('/admin/gigs')
        return
      }
      setGig(gigData)
      setClients(clientsData.clients || [])
      setIsLoading(false)
    }).catch(() => {
      toast.error('Nepodařilo se načíst data')
      setIsLoading(false)
    })
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!gig) return null

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/gigs/${params.id}`}
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na detail
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Upravit gig</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Upravte údaje o zakázce</p>
      </div>

      <div className="max-w-3xl">
        <GigForm initialData={gig} />
      </div>
    </div>
  )
}
