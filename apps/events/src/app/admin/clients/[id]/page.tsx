'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  UserCircle2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Edit,
  Trash2,
  Calendar,
  CalendarPlus,
  Loader2,
  Tag,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { useClient, useDeleteClient, useUpdateClient } from '@/hooks/use-clients'
import { useToast } from '@/hooks/use-toast'
import { useConfirmContext } from '@vertigo/ui'
import { Skeleton } from '@vertigo/ui'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirmContext()
  const { data: client, isLoading, error } = useClient(id)
  const deleteClient = useDeleteClient()
  const updateClient = useUpdateClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    notes: '',
  })

  if (isLoading) {
    return <ClientDetailSkeleton />
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">
            The client you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/clients" className="btn-primary inline-flex">
            Return to Clients
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete "${client.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteClient.mutateAsync(id)
        toast.success('Client deleted successfully')
        router.push('/admin/clients')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete client')
      }
    }
  }

  const handleEdit = () => {
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      city: client.city || '',
      notes: client.notes || '',
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateClient.mutateAsync({
        id,
        data: {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || undefined,
          company: editForm.company || undefined,
          address: editForm.address || undefined,
          city: editForm.city || undefined,
          notes: editForm.notes || undefined,
        },
      })
      toast.success('Client updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update client')
    }
  }

  const statusConfig = {
    planning: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    in_progress: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  }

  const upcomingEvents = client.events?.filter(
    (e) => new Date(e.date) >= new Date() && e.status !== 'cancelled'
  ) || []
  const pastEvents = client.events?.filter(
    (e) => new Date(e.date) < new Date() || e.status === 'completed'
  ) || []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{client.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    client.clientType === 'corporate'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {client.clientType === 'corporate' ? 'Corporate' : 'Individual'}
                </span>
                {client.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/events/new?clientId=${id}`}
              className="btn-primary inline-flex items-center"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              New Event
            </Link>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteClient.isPending}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              {deleteClient.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Events Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Events ({client.events?.length || 0})
            </h2>

            {upcomingEvents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming</h3>
                <div className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const status = statusConfig[event.status as keyof typeof statusConfig]
                    const StatusIcon = status?.icon || Clock
                    return (
                      <Link
                        key={event.id}
                        href={`/admin/events/${event.id}`}
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{event.name}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 capitalize">
                              {event.type.replace('_', ' ')}
                            </span>
                            <span
                              className={`${status?.bg} ${status?.color} p-1 rounded-full`}
                            >
                              <StatusIcon className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Past Events</h3>
                <div className="space-y-2">
                  {pastEvents.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!client.events?.length && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events yet</p>
                <Link
                  href={`/admin/events/new?clientId=${id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Create first event
                </Link>
              </div>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <UserCircle2 className="w-5 h-5 mr-2 text-primary-600" />
              Contact Info
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {client.email}
                </a>
              </div>

              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${client.phone}`}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {client.phone}
                  </a>
                </div>
              )}

              {client.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{client.company}</span>
                </div>
              )}

              {(client.address || client.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">
                    {[client.address, client.city].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {client.events?.length || 0}
                </p>
                <p className="text-xs text-gray-600">Total Events</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {upcomingEvents.length}
                </p>
                <p className="text-xs text-gray-600">Upcoming</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Client since {format(new Date(client.createdAt), 'MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-600" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Client</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateClient.isPending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {updateClient.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClientDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
