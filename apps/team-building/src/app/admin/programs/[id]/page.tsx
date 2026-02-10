/**
 * Edit Program Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProgramForm } from '@/components/admin/ProgramForm'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export default function EditProgramPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [program, setProgram] = useState<any>(null)
  const [activities, setActivities] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Fetch program data and activities
    Promise.all([
      fetch(`/api/programs/${params.id}`),
      fetch('/api/activities?status=active'),
    ])
      .then(async ([programRes, activitiesRes]) => {
        const programData = await programRes.json()
        const activitiesData = await activitiesRes.json()

        if (programData.success) {
          setProgram(programData.data)
        } else {
          toast.error('Program nebyl nalezen')
          router.push('/admin/programs')
        }

        if (activitiesData.success) {
          setActivities(activitiesData.data)
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
        toast.error('Nepodařilo se načíst data')
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }, [params.id, router])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/programs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Program byl úspěšně aktualizován')
        router.push('/admin/programs')
      } else {
        toast.error(result.error || 'Nepodařilo se aktualizovat program')
      }
    } catch (error) {
      console.error('Error updating program:', error)
      toast.error('Nastala chyba při aktualizaci programu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento program? Tuto akci nelze vrátit zpět.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/programs/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Program byl úspěšně smazán')
        router.push('/admin/programs')
      } else {
        toast.error(result.error || 'Nepodařilo se smazat program')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Nastala chyba při mazání programu')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Načítám data...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/programs"
          className="inline-flex items-center text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na programy
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upravit program</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">{program.title}</p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat program
          </Button>
        </div>
      </div>

      <ProgramForm
        initialData={program}
        activities={activities}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/programs')}
        isLoading={isLoading}
      />
    </div>
  )
}
