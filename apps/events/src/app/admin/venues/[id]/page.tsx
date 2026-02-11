'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  Users,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { useVenue, useDeleteVenue, useUpdateVenue } from '@/hooks/use-venues'
import { useToast } from '@/hooks/use-toast'
import { useConfirmContext } from '@vertigo/ui'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function VenueDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirmContext()
  const { data: venue, isLoading, error } = useVenue(id)
  const deleteVenue = useDeleteVenue()
  const updateVenue = useUpdateVenue()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'indoor' as 'indoor' | 'outdoor' | 'mixed',
    address: '',
    city: '',
    capacity: '',
    setupAccessTime: '',
    curfew: '',
    restrictions: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  })

  if (isLoading) {
    return <VenueDetailSkeleton />
  }

  if (error || !venue) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/venues"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Venues
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Venue Not Found</h2>
          <p className="text-gray-600 mb-4">
            The venue you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/venues" className="btn-primary inline-flex">
            Return to Venues
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = {
    indoor: { label: 'Indoor', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    outdoor: { label: 'Outdoor', color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700' },
    mixed: { label: 'Mixed', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  }

  const config = typeConfig[venue.type]

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Venue',
      message: `Are you sure you want to delete "${venue.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteVenue.mutateAsync(id)
        toast.success('Venue deleted successfully')
        router.push('/admin/venues')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete venue')
      }
    }
  }

  const handleEdit = () => {
    setEditForm({
      name: venue.name,
      type: venue.type,
      address: venue.address || '',
      city: venue.city || '',
      capacity: venue.capacity?.toString() || '',
      setupAccessTime: venue.setupAccessTime || '',
      curfew: venue.curfew || '',
      restrictions: venue.restrictions?.join(', ') || '',
      contactName: venue.contactName || '',
      contactEmail: venue.contactEmail || '',
      contactPhone: venue.contactPhone || '',
      notes: venue.notes || '',
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const restrictions = editForm.restrictions
        ? editForm.restrictions.split(',').map((r) => r.trim()).filter(Boolean)
        : []

      await updateVenue.mutateAsync({
        id,
        data: {
          name: editForm.name,
          type: editForm.type,
          address: editForm.address || undefined,
          city: editForm.city || undefined,
          capacity: editForm.capacity ? parseInt(editForm.capacity, 10) : undefined,
          setupAccessTime: editForm.setupAccessTime || undefined,
          curfew: editForm.curfew || undefined,
          restrictions,
          contactName: editForm.contactName || undefined,
          contactEmail: editForm.contactEmail || undefined,
          contactPhone: editForm.contactPhone || undefined,
          notes: editForm.notes || undefined,
        },
      })
      toast.success('Venue updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update venue')
    }
  }

  const statusConfig = {
    planning: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    in_progress: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    completed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  }

  const upcomingEvents = venue.events?.filter(
    (e) => new Date(e.date) >= new Date() && e.status !== 'cancelled'
  ) || []
  const pastEvents = venue.events?.filter(
    (e) => new Date(e.date) < new Date() || e.status === 'completed'
  ) || []

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/venues"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Venues
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center text-white`}
            >
              {venue.type === 'outdoor' ? (
                <MapPin className="w-8 h-8" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{venue.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
                {venue.city && (
                  <span className="text-gray-500 text-sm flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {venue.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteVenue.isPending}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              {deleteVenue.isPending ? (
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
          {/* Location & Capacity */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Location & Details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {venue.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-900">{venue.address}</p>
                </div>
              )}
              {venue.city && (
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-gray-900">{venue.city}</p>
                </div>
              )}
              {venue.capacity && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {venue.capacity.toLocaleString()} guests
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timing */}
          {(venue.setupAccessTime || venue.curfew) && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Timing
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {venue.setupAccessTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Setup Access</p>
                    <p className="text-gray-900">{venue.setupAccessTime}</p>
                  </div>
                )}
                {venue.curfew && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Curfew</p>
                    <p className="text-gray-900">{venue.curfew}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Restrictions */}
          {venue.restrictions && venue.restrictions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Restrictions
              </h2>

              <div className="flex flex-wrap gap-2">
                {venue.restrictions.map((restriction, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Events at this Venue ({venue.events?.length || 0})
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
                          <span className={`${status?.bg} ${status?.color} p-1 rounded-full`}>
                            <StatusIcon className="w-4 h-4" />
                          </span>
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
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!venue.events?.length && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events at this venue yet</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {venue.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Notes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{venue.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          {(venue.contactName || venue.contactEmail || venue.contactPhone) && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Venue Contact
              </h2>

              <div className="space-y-3">
                {venue.contactName && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{venue.contactName}</span>
                  </div>
                )}

                {venue.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${venue.contactEmail}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {venue.contactEmail}
                    </a>
                  </div>
                )}

                {venue.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${venue.contactPhone}`}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      {venue.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {venue.events?.length || 0}
                </p>
                <p className="text-xs text-gray-600">Total Events</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{upcomingEvents.length}</p>
                <p className="text-xs text-gray-600">Upcoming</p>
              </div>
            </div>
            {venue.capacity && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {venue.capacity.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Max Capacity</p>
              </div>
            )}
          </div>
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
            <h3 className="text-lg font-semibold mb-4">Edit Venue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as 'indoor' | 'outdoor' | 'mixed' })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Access</label>
                  <input
                    type="time"
                    value={editForm.setupAccessTime}
                    onChange={(e) => setEditForm({ ...editForm, setupAccessTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curfew</label>
                  <input
                    type="time"
                    value={editForm.curfew}
                    onChange={(e) => setEditForm({ ...editForm, curfew: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restrictions</label>
                <input
                  type="text"
                  value={editForm.restrictions}
                  onChange={(e) => setEditForm({ ...editForm, restrictions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Comma-separated"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
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
                disabled={updateVenue.isPending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {updateVenue.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VenueDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
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
