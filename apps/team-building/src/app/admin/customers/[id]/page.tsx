/**
 * Edit Customer Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerForm } from '@/components/admin/CustomerForm'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomer(data.data)
        } else {
          toast.error('Zákazník nebyl nalezen')
          router.push('/admin/customers')
        }
      })
      .catch((error) => {
        console.error('Error fetching customer:', error)
        toast.error('Nepodařilo se načíst data')
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }, [params.id, router])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Zákazník byl úspěšně aktualizován')
        router.push('/admin/customers')
      } else {
        toast.error(result.error || 'Nepodařilo se aktualizovat zákazníka')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Nastala chyba při aktualizaci zákazníka')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tohoto zákazníka? Tuto akci nelze vrátit zpět.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Zákazník byl úspěšně smazán')
        router.push('/admin/customers')
      } else {
        toast.error(result.error || 'Nepodařilo se smazat zákazníka')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Nastala chyba při mazání zákazníka')
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

  if (!customer) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na zákazníky
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upravit zákazníka</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {customer.firstName} {customer.lastName}
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat zákazníka
          </Button>
        </div>
      </div>

      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/customers')}
        isLoading={isLoading}
      />
    </div>
  )
}
