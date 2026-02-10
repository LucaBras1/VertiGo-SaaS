'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Mail, Phone, MapPin,
  Package, Calendar, FileText, Plus, Loader2
} from 'lucide-react'
import { useClient, useDeleteClient, CLIENT_TYPE_LABELS } from '@/hooks/useClients'
import { Badge, Button, Card, CardHeader, CardTitle, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

interface ClientWithRelations {
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

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: client, isLoading, error } = useClient(clientId) as {
    data: ClientWithRelations | undefined
    isLoading: boolean
    error: Error | null
  }

  const deleteClientMutation = useDeleteClient()

  const handleDelete = async () => {
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        router.push('/admin/clients')
      },
      onSettled: () => {
        setShowDeleteModal(false)
      }
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Client not found</p>
        <Link href="/admin/clients">
          <Button className="mt-4">Back to Clients</Button>
        </Link>
      </div>
    )
  }

  const totalRevenue = client.invoices
    ?.filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin/clients" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h1>
            <Badge variant="info">{CLIENT_TYPE_LABELS[client.type] || client.type}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/clients/${clientId}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/packages/new?clientId=${client.id}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Package
            </Button>
          </Link>
          <Link href={`/admin/invoices/new?clientId=${client.id}`}>
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
                  Packages ({client.packages?.length || 0})
                </CardTitle>
                <Link href={`/admin/packages/new?clientId=${client.id}`}>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            {!client.packages || client.packages.length === 0 ? (
              <p className="text-neutral-400 dark:text-neutral-500">No packages yet</p>
            ) : (
              <div className="space-y-3">
                {client.packages.map(pkg => (
                  <Link key={pkg.id} href={`/admin/packages/${pkg.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {pkg.eventType} &bull; {pkg.eventDate ? new Date(pkg.eventDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={pkg.status === 'COMPLETED' ? 'success' : pkg.status === 'CONFIRMED' ? 'info' : 'default'}>
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
                  Invoices ({client.invoices?.length || 0})
                </CardTitle>
                <Link href={`/admin/invoices/new?clientId=${client.id}`}>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            {!client.invoices || client.invoices.length === 0 ? (
              <p className="text-neutral-400 dark:text-neutral-500">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {client.invoices.map(invoice => (
                  <Link key={invoice.id} href={`/admin/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'danger' : 'default'}>
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
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{client.notes}</p>
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
                <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <a href={`mailto:${client.email}`} className="text-amber-600 hover:text-amber-700">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <a href={`tel:${client.phone}`} className="text-neutral-700 dark:text-neutral-300">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mt-0.5" />
                  <span className="text-neutral-700 dark:text-neutral-300">{client.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
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
                <span className="text-neutral-600 dark:text-neutral-400">Total Packages</span>
                <span className="font-medium">{client.packages?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Total Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Client Since</span>
                <span className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onOpenChange={(open: boolean) => { if (!open) setShowDeleteModal(false) }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Client</ModalTitle>
          </ModalHeader>
          <ModalBody>
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete &quot;{client.name}&quot;? This will also delete all associated packages, shoots, and invoices.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleteClientMutation.isPending}>
              Delete Client
            </Button>
          </div>
        </div>
      </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}
