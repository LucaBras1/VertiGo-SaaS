'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Calendar, User, DollarSign,
  Camera, FileText, ListChecks, ChevronRight, Loader2
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  usePackage, useDeletePackage, useUpdatePackageStatus,
  PackageStatus, STATUS_LABELS, getNextStatuses
} from '@/hooks/usePackages'

const statusConfig: Record<PackageStatus, { label: string; color: 'gray' | 'blue' | 'green' | 'red' }> = {
  INQUIRY: { label: 'Inquiry', color: 'gray' },
  QUOTE_SENT: { label: 'Quote Sent', color: 'blue' },
  CONFIRMED: { label: 'Confirmed', color: 'green' },
  COMPLETED: { label: 'Completed', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' }
}

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string

  const { data: pkg, isLoading, error } = usePackage(packageId)
  const deletePackage = useDeletePackage()
  const updateStatus = useUpdatePackageStatus()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleStatusChange = (newStatus: PackageStatus) => {
    updateStatus.mutate({ id: packageId, status: newStatus })
  }

  const handleDelete = async () => {
    try {
      await deletePackage.mutateAsync(packageId)
      router.push('/dashboard/packages')
    } catch {
      // Error handled by mutation
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Package not found</p>
        <Link href="/dashboard/packages">
          <Button>Back to Packages</Button>
        </Link>
      </div>
    )
  }

  const nextStatuses = getNextStatuses(pkg.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/packages" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
          <p className="text-gray-600 mt-1">{pkg.client.name} &bull; {pkg.eventType}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/packages/${packageId}/edit`}>
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

      {/* Status & Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant={statusConfig[pkg.status].color} size="md">
              {STATUS_LABELS[pkg.status]}
            </Badge>

            {/* Status Workflow */}
            {nextStatuses.length > 0 && (
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {nextStatuses.map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={status === 'CANCELLED' ? 'danger' : 'secondary'}
                    onClick={() => handleStatusChange(status)}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      STATUS_LABELS[status]
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/shoots/new?packageId=${pkg.id}`}>
              <Button size="sm" variant="ghost">
                <Calendar className="w-4 h-4 mr-1" />
                Add Shoot
              </Button>
            </Link>
            <Link href={`/dashboard/shot-lists/new?packageId=${pkg.id}`}>
              <Button size="sm" variant="ghost">
                <ListChecks className="w-4 h-4 mr-1" />
                Create Shot List
              </Button>
            </Link>
            <Link href={`/dashboard/invoices/new?packageId=${pkg.id}`}>
              <Button size="sm" variant="ghost">
                <FileText className="w-4 h-4 mr-1" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event Type</p>
                <p className="font-medium capitalize">{pkg.eventType || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-medium">
                  {pkg.eventDate ? new Date(pkg.eventDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Shot Count</p>
                <p className="font-medium">{pkg.shotCount || '-'} photos</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Days</p>
                <p className="font-medium">{pkg.deliveryDays || '-'} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Editing Hours</p>
                <p className="font-medium">{pkg.editingHours || '-'} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Second Shooter</p>
                <p className="font-medium">{pkg.secondShooter ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>

          {/* Style & Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>Style & Equipment</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Style Tags</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.styleTags && pkg.styleTags.length > 0 ? pkg.styleTags.map((tag, idx) => (
                    <Badge key={idx} variant="default">{tag}</Badge>
                  )) : <span className="text-gray-400">No tags</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.equipment && pkg.equipment.length > 0 ? pkg.equipment.map((item, idx) => (
                    <Badge key={idx} variant="info">{item}</Badge>
                  )) : <span className="text-gray-400">Not specified</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">RAW Files Included</p>
                <p className="font-medium">{pkg.rawFilesIncluded ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {pkg.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-gray-700 whitespace-pre-wrap">{pkg.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Client
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Link href={`/dashboard/clients/${pkg.client.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                {pkg.client.name}
              </Link>
              <p className="text-sm text-gray-600">{pkg.client.email}</p>
              {pkg.client.phone && <p className="text-sm text-gray-600">{pkg.client.phone}</p>}
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price</span>
                <span>{formatCurrency(pkg.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Travel</span>
                <span>{formatCurrency(pkg.travelCosts)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(pkg.totalPrice)}</span>
              </div>
            </div>
          </Card>

          {/* Related Shoots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Shoots ({pkg.shoots?.length || 0})
              </CardTitle>
            </CardHeader>
            {!pkg.shoots || pkg.shoots.length === 0 ? (
              <p className="text-gray-400 text-sm">No shoots scheduled</p>
            ) : (
              <div className="space-y-2">
                {pkg.shoots.map(shoot => (
                  <Link key={shoot.id} href={`/dashboard/shoots/${shoot.id}`}
                    className="block p-2 rounded hover:bg-gray-50">
                    <p className="font-medium text-sm">{new Date(shoot.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{shoot.venueName || 'No venue'}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Shot Lists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Shot Lists ({pkg.shotLists?.length || 0})
              </CardTitle>
            </CardHeader>
            {!pkg.shotLists || pkg.shotLists.length === 0 ? (
              <p className="text-gray-400 text-sm">No shot lists</p>
            ) : (
              <div className="space-y-2">
                {pkg.shotLists.map(list => (
                  <Link key={list.id} href={`/dashboard/shot-lists/${list.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <span className="font-medium text-sm">{list.name}</span>
                    <Badge variant={list.status === 'FINALIZED' ? 'green' : 'gray'} size="sm">
                      {list.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoices ({pkg.invoices?.length || 0})
              </CardTitle>
            </CardHeader>
            {!pkg.invoices || pkg.invoices.length === 0 ? (
              <p className="text-gray-400 text-sm">No invoices</p>
            ) : (
              <div className="space-y-2">
                {pkg.invoices.map(invoice => (
                  <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <span className="font-medium text-sm">{invoice.invoiceNumber}</span>
                    <Badge variant={invoice.status === 'PAID' ? 'green' : 'gray'} size="sm">
                      {invoice.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Package">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete &quot;{pkg.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deletePackage.isPending}>
              Delete Package
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
