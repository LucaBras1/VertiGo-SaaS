/**
 * Edit Activity Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ActivityForm } from '@/components/admin/ActivityForm'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export default function EditActivityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activity, setActivity] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Fetch activity data
    fetch(`/api/activities/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActivity(data.data)
        } else {
          toast.error('Aktivita nebyla nalezena')
          router.push('/admin/activities')
        }
      })
      .catch((error) => {
        console.error('Error fetching activity:', error)
        toast.error('Nepodařilo se načíst data')
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }, [params.id, router])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Aktivita byla úspěšně aktualizována')
        router.push('/admin/activities')
      } else {
        toast.error(result.error || 'Nepodařilo se aktualizovat aktivitu')
      }
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Nastala chyba při aktualizaci aktivity')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tuto aktivitu? Tuto akci nelze vrátit zpět.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/activities/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Aktivita byla úspěšně smazána')
        router.push('/admin/activities')
      } else {
        toast.error(result.error || 'Nepodařilo se smazat aktivitu')
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Nastala chyba při mazání aktivity')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám data...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/activities"
          className="inline-flex items-center text-cyan-600 hover:text-cyan-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na aktivity
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upravit aktivitu</h1>
            <p className="text-gray-600 mt-2">{activity.title}</p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat aktivitu
          </Button>
        </div>
      </div>

      <ActivityForm
        initialData={activity}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/activities')}
        isLoading={isLoading}
      />
    </div>
  )
}
