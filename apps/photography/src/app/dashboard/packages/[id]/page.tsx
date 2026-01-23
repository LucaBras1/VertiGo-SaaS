'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Calendar, User, DollarSign,
  Camera, Clock, FileText, Images, ListChecks, Send
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface Package {
  id: string
  title: string
  status: 'INQUIRY' | 'QUOTE_SENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  eventType: string | null
  eventDate: string | null
  shotCount: number | null
  deliveryDays: number | null
  editingHours: number | null
  styleTags: string[]
  equipment: string[]
  secondShooter: boolean
  rawFilesIncluded: boolean
  basePrice: number | null
  travelCosts: number | null
  totalPrice: number | null
  notes: string | null
  createdAt: string
  client: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  shoots: Array<{
    id: string
    date: string
    venueName: string | null
  }>
  shotLists: Array<{
    id: string
    name: string
    status: string
  }>
  invoices: Array<{
    id: string
    invoiceNumber: string
    status: string
    total: number
  }>
}

const statusConfig = {
  INQUIRY: { label: 'Inquiry', color: 'gray' as const },
  QUOTE_SENT: { label: 'Quote Sent', color: 'blue' as const },
  CONFIRMED: { label: 'Confirmed', color: 'green' as const },
  COMPLETED: { label: 'Completed', color: 'green' as const },
  CANCELLED: { label: 'Cancelled', color: 'red' as const }
}

const statusOptions = ['INQUIRY', 'QUOTE_SENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [pkg, setPkg] = useState<Package | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchPackage()
  }, [params.id])

  const fetchPackage = async () => {
    try {
      const res = await fetch(`/api/packages/${params.id}`)
      if (!res.ok) throw new Error('Package not found')
      const data = await res.json()
      setPkg(data)
    } catch (error) {
      console.error('Failed to fetch package:', error)
      toast.error('Package not found')
      router.push('/dashboard/packages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!pkg) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/packages/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setPkg({ ...pkg, status: newStatus as Package['status'] })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/packages/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete package')
      toast.success('Package deleted')
      router.push('/dashboard/packages')
    } catch (error) {
      toast.error('Failed to delete package')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!pkg) return null

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
          <Link href={`/dashboard/packages/${params.id}/edit`}>
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
            <select
              value={pkg.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {statusConfig[status as keyof typeof statusConfig].label}
                </option>
              ))}
            </select>
            <Badge variant={statusConfig[pkg.status].color}>
              {statusConfig[pkg.status].label}
            </Badge>
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
                <p className="font-medium">{pkg.eventType || '-'}</p>
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
                  {pkg.styleTags.length > 0 ? pkg.styleTags.map((tag, idx) => (
                    <Badge key={idx} variant="default">{tag}</Badge>
                  )) : <span className="text-gray-400">No tags</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.equipment.length > 0 ? pkg.equipment.map((item, idx) => (
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
                <span>{formatCurrency(pkg.totalPrice)}</span>
              </div>
            </div>
          </Card>

          {/* Related Shoots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Shoots ({pkg.shoots.length})
              </CardTitle>
            </CardHeader>
            {pkg.shoots.length === 0 ? (
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

          {/* Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoices ({pkg.invoices.length})
              </CardTitle>
            </CardHeader>
            {pkg.invoices.length === 0 ? (
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
            Are you sure you want to delete "{pkg.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Package
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
