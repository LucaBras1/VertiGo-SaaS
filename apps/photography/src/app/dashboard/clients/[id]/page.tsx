'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin,
  Package, Calendar, FileText, Plus
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  type: string
  tags: string[]
  notes: string | null
  createdAt: string
  packages: Array<{
    id: string
    title: string
    status: string
    eventType: string | null
    eventDate: string | null
    totalPrice: number | null
  }>
  invoices: Array<{
    id: string
    invoiceNumber: string
    status: string
    total: number
  }>
}

const typeLabels = {
  individual: 'Individual',
  couple: 'Couple',
  business: 'Business'
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [params.id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`)
      if (!res.ok) throw new Error('Client not found')
      const data = await res.json()
      setClient(data)
    } catch (error) {
      console.error('Failed to fetch client:', error)
      toast.error('Client not found')
      router.push('/dashboard/clients')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete client')
      toast.success('Client deleted')
      router.push('/dashboard/clients')
    } catch (error) {
      toast.error('Failed to delete client')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const totalRevenue = client?.invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0) || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/clients" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <Badge variant="info">{typeLabels[client.type as keyof typeof typeLabels] || client.type}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/clients/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/packages/new?clientId=${client.id}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Package
            </Button>
          </Link>
          <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
            <Button size="sm" variant="secondary">
              <FileText className="w-4 h-4 mr-1" />
              Create Invoice
            </Button>
          </Link>
          <a href={`mailto:${client.email}`}>
            <Button size="sm" variant="ghost">
              <Mail className="w-4 h-4 mr-1" />
              Send Email
            </Button>
          </a>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Packages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Packages ({client.packages.length})
                </CardTitle>
                <Link href={`/dashboard/packages/new?clientId=${client.id}`}>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            {client.packages.length === 0 ? (
              <p className="text-gray-400">No packages yet</p>
            ) : (
              <div className="space-y-3">
                {client.packages.map(pkg => (
                  <Link key={pkg.id} href={`/dashboard/packages/${pkg.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="text-sm text-gray-500">
                        {pkg.eventType} &bull; {pkg.eventDate ? new Date(pkg.eventDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={pkg.status === 'COMPLETED' ? 'green' : pkg.status === 'CONFIRMED' ? 'blue' : 'gray'}>
                        {pkg.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{formatCurrency(pkg.totalPrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoices ({client.invoices.length})
                </CardTitle>
                <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            {client.invoices.length === 0 ? (
              <p className="text-gray-400">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {client.invoices.map(invoice => (
                  <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <Badge variant={invoice.status === 'PAID' ? 'green' : invoice.status === 'OVERDUE' ? 'red' : 'gray'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <span className="font-medium">{formatCurrency(invoice.total)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${client.email}`} className="text-amber-600 hover:text-amber-700">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-gray-700">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{client.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {client.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag, idx) => (
                  <Badge key={idx} variant="default">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Packages</span>
                <span className="font-medium">{client.packages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client Since</span>
                <span className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Client">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{client.name}"? This will also delete all associated packages, shoots, and invoices.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
