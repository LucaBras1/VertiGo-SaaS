/**
 * Create New Session Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionForm } from '@/components/admin/SessionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewSessionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [programs, setPrograms] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    // Fetch programs and customers
    Promise.all([
      fetch('/api/programs?status=active'),
      fetch('/api/customers'),
    ])
      .then(async ([programsRes, customersRes]) => {
        const programsData = await programsRes.json()
        const customersData = await customersRes.json()

        if (programsData.success) {
          setPrograms(programsData.data)
        }

        if (customersData.success) {
          setCustomers(customersData.data)
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Workshop byl úspěšně vytvořen')
        router.push('/admin/sessions')
      } else {
        toast.error(result.error || 'Nepodařilo se vytvořit workshop')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Nastala chyba při vytváření workshopu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/sessions"
          className="inline-flex items-center text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na workshopy
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Nový workshop</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Vytvořte nový teambuilding workshop</p>
      </div>

      <SessionForm
        programs={programs}
        customers={customers}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/sessions')}
        isLoading={isLoading}
      />
    </div>
  )
}
