/**
 * Create New Program Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProgramForm } from '@/components/admin/ProgramForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewProgramPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    // Fetch activities for linking
    fetch('/api/activities?status=active')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActivities(data.data)
        }
      })
      .catch((error) => {
        console.error('Error fetching activities:', error)
      })
  }, [])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Program byl úspěšně vytvořen')
        router.push('/admin/programs')
      } else {
        toast.error(result.error || 'Nepodařilo se vytvořit program')
      }
    } catch (error) {
      console.error('Error creating program:', error)
      toast.error('Nastala chyba při vytváření programu')
    } finally {
      setIsLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Nový program</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Vytvořte nový teambuilding program</p>
      </div>

      <ProgramForm
        activities={activities}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/programs')}
        isLoading={isLoading}
      />
    </div>
  )
}
