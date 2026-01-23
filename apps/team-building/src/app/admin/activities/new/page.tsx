/**
 * Create New Activity Page
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ActivityForm } from '@/components/admin/ActivityForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewActivityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Aktivita byla úspěšně vytvořena')
        router.push('/admin/activities')
      } else {
        toast.error(result.error || 'Nepodařilo se vytvořit aktivitu')
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      toast.error('Nastala chyba při vytváření aktivity')
    } finally {
      setIsLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Nová aktivita</h1>
        <p className="text-gray-600 mt-2">Vytvořte novou teambuilding aktivitu</p>
      </div>

      <ActivityForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/activities')}
        isLoading={isLoading}
      />
    </div>
  )
}
