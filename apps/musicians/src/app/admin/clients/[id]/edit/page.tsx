'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/forms/ClientForm'
import toast from 'react-hot-toast'

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) {
          router.push('/admin/clients')
          return
        }
        setClient(data)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error('Nepodařilo se načíst klienta')
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

  if (!client) return null

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/clients/${params.id}`}
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na detail
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Upravit klienta</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Upravte údaje o klientovi</p>
      </div>

      <div className="max-w-2xl">
        <ClientForm initialData={client} />
      </div>
    </div>
  )
}
