'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SongForm } from '@/components/forms/SongForm'
import toast from 'react-hot-toast'

export default function EditSongPage() {
  const params = useParams()
  const router = useRouter()
  const [song, setSong] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/repertoire/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) {
          router.push('/dashboard/repertoire')
          return
        }
        setSong(data)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error('Nepodařilo se načíst píseň')
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

  if (!song) return null

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/repertoire/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na detail
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upravit píseň</h1>
        <p className="text-gray-600 mt-1">Upravte údaje o písni</p>
      </div>

      <div className="max-w-2xl">
        <SongForm initialData={song} />
      </div>
    </div>
  )
}
