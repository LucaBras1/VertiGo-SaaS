'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, MapPin } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@vertigo/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  address?: { street?: string; city?: string; zip?: string }
  notes?: string
  createdAt: string
  invoices: any[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [params.id])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/clients')
          return
        }
        throw new Error('Failed to fetch')
      }
      setClient(await response.json())
    } catch (error) {
      toast.error('Nepodařilo se načíst klienta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clients/${params.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }
      toast.success('Klient smazán')
      router.push('/admin/clients')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se smazat')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  }

  if (!client) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/clients" className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na seznam
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.firstName} {client.lastName}</h1>
          {client.company && <p className="text-neutral-600 dark:text-neutral-400 mt-1">{client.company}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/clients/${client.id}/edit`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Upravit</Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Smazat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Kontaktní údaje</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-neutral-400" />
                <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">{client.email}</a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-neutral-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-neutral-400" />
                  <span>{client.company}</span>
                </div>
              )}
              {client.address && (client.address.street || client.address.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
                  <div>
                    {client.address.street && <p>{client.address.street}</p>}
                    {(client.address.city || client.address.zip) && (
                      <p>{client.address.zip} {client.address.city}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader><CardTitle>Poznámky</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{client.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Faktury ({client.invoices.length})</CardTitle></CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Žádné faktury</p>
              ) : (
                <ul className="space-y-2">
                  {client.invoices.slice(0, 5).map((inv: any) => (
                    <li key={inv.id} className="flex justify-between text-sm">
                      <Link href={`/admin/invoices/${inv.id}`} className="text-primary-600 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <span>{formatCurrency(inv.totalAmount / 100)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/admin/invoices/new?customerId=${client.id}`} className="block mt-4">
                <Button variant="outline" className="w-full">Vytvořit fakturu</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader><DialogTitle>Smazat klienta?</DialogTitle></DialogHeader>
        <DialogContent>
          <p>Opravdu chcete smazat klienta &quot;{client.firstName} {client.lastName}&quot;?</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Zrušit</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Smazat</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
