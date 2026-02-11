'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Sparkles,
  Edit,
  Trash2,
  Calendar,
  Loader2,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Globe,
  Star,
  AlertCircle,
  FileText,
  Flame,
  Wand2,
  Music,
  Smile,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { usePerformer, useDeletePerformer, useUpdatePerformer } from '@/hooks/use-performers'
import { useToast } from '@/hooks/use-toast'
import { useConfirmContext } from '@vertigo/ui'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{ id: string }>
}

const performerTypes = {
  fire: { label: 'Fire', icon: Flame, color: 'from-orange-500 to-red-600', bg: 'bg-orange-50', text: 'text-orange-700' },
  magic: { label: 'Magic', icon: Wand2, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  circus: { label: 'Circus', icon: Sparkles, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-700' },
  music: { label: 'Music', icon: Music, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  dance: { label: 'Dance', icon: Users, color: 'from-teal-500 to-green-600', bg: 'bg-teal-50', text: 'text-teal-700' },
  comedy: { label: 'Comedy', icon: Smile, color: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  interactive: { label: 'Interactive', icon: Users, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700' },
}

export default function PerformerDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirmContext()
  const { data: performer, isLoading, error } = usePerformer(id)
  const deletePerformer = useDeletePerformer()
  const updatePerformer = useUpdatePerformer()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    stageName: '',
    type: 'fire' as keyof typeof performerTypes,
    bio: '',
    specialties: '',
    setupTime: '',
    performanceTime: '',
    breakdownTime: '',
    email: '',
    phone: '',
    website: '',
    standardRate: '',
  })

  if (isLoading) {
    return <PerformerDetailSkeleton />
  }

  if (error || !performer) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/performers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Performers
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Performer Not Found</h2>
          <p className="text-gray-600 mb-4">
            The performer you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/performers" className="btn-primary inline-flex">
            Return to Performers
          </Link>
        </div>
      </div>
    )
  }

  const config = performerTypes[performer.type as keyof typeof performerTypes] || performerTypes.fire
  const Icon = config.icon

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Performer',
      message: `Are you sure you want to delete "${performer.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deletePerformer.mutateAsync(id)
        toast.success('Performer deleted successfully')
        router.push('/admin/performers')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete performer')
      }
    }
  }

  const handleEdit = () => {
    setEditForm({
      name: performer.name,
      stageName: performer.stageName || '',
      type: performer.type as keyof typeof performerTypes,
      bio: performer.bio || '',
      specialties: performer.specialties?.join(', ') || '',
      setupTime: performer.setupTime?.toString() || '30',
      performanceTime: performer.performanceTime?.toString() || '30',
      breakdownTime: performer.breakdownTime?.toString() || '15',
      email: performer.email || '',
      phone: performer.phone || '',
      website: performer.website || '',
      standardRate: performer.standardRate?.toString() || '',
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const specialties = editForm.specialties
        ? editForm.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      await updatePerformer.mutateAsync({
        id,
        data: {
          name: editForm.name,
          stageName: editForm.stageName || undefined,
          type: editForm.type,
          bio: editForm.bio || undefined,
          specialties,
          setupTime: parseInt(editForm.setupTime, 10) || 30,
          performanceTime: parseInt(editForm.performanceTime, 10) || 30,
          breakdownTime: parseInt(editForm.breakdownTime, 10) || 15,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          website: editForm.website || undefined,
          standardRate: editForm.standardRate ? parseFloat(editForm.standardRate) : undefined,
        },
      })
      toast.success('Performer updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update performer')
    }
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Confirmed' },
    completed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Completed' },
    cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  }

  const upcomingBookings = performer.bookings?.filter(
    (b) => new Date(b.event.date) >= new Date() && b.status !== 'cancelled'
  ) || []
  const pastBookings = performer.bookings?.filter(
    (b) => new Date(b.event.date) < new Date() || b.status === 'completed'
  ) || []

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : i === fullStars && hasHalf
                ? 'text-yellow-400 fill-yellow-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/performers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Performers
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center text-white`}
            >
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">
                {performer.stageName || performer.name}
              </h1>
              {performer.stageName && (
                <p className="text-gray-500">{performer.name}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
                {performer.rating && renderStars(Number(performer.rating))}
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
              disabled={deletePerformer.isPending}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              {deletePerformer.isPending ? (
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
          {/* Bio */}
          {performer.bio && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Bio
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{performer.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {performer.specialties && performer.specialties.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {performer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-medium`}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Timing Information
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{performer.setupTime}</p>
                <p className="text-sm text-gray-500">Setup (min)</p>
              </div>
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{performer.performanceTime}</p>
                <p className="text-sm text-gray-500">Performance (min)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{performer.breakdownTime}</p>
                <p className="text-sm text-gray-500">Breakdown (min)</p>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Bookings ({performer.totalBookings || 0})
            </h2>

            {upcomingBookings.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming</h3>
                <div className="space-y-2">
                  {upcomingBookings.map((booking) => {
                    const status = statusConfig[booking.status as keyof typeof statusConfig]
                    const StatusIcon = status?.icon || Clock
                    return (
                      <Link
                        key={booking.id}
                        href={`/admin/events/${booking.event.id}`}
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{booking.event.name}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(booking.event.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">
                              ${Number(booking.agreedRate).toLocaleString()}
                            </span>
                            <span className={`${status?.bg} ${status?.color} px-2 py-0.5 rounded-full text-xs flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {status?.label}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Past Bookings</h3>
                <div className="space-y-2">
                  {pastBookings.slice(0, 5).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/events/${booking.event.id}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{booking.event.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.event.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className="text-sm text-gray-600">
                          ${Number(booking.agreedRate).toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!performer.bookings?.length && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Contact Info
            </h2>

            <div className="space-y-3">
              {performer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${performer.email}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {performer.email}
                  </a>
                </div>
              )}

              {performer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${performer.phone}`}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {performer.phone}
                  </a>
                </div>
              )}

              {performer.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={performer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 truncate"
                  >
                    {performer.website}
                  </a>
                </div>
              )}

              {!performer.email && !performer.phone && !performer.website && (
                <p className="text-gray-500 text-sm">No contact info available</p>
              )}
            </div>
          </div>

          {/* Rate Card */}
          {performer.standardRate && (
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                <DollarSign className="w-5 h-5 mr-2" />
                Standard Rate
              </h2>
              <p className="text-3xl font-bold text-green-600">
                ${Number(performer.standardRate).toLocaleString()}
              </p>
              <p className="text-sm text-green-700 mt-1">per performance</p>
            </div>
          )}

          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {performer.totalBookings || 0}
                </p>
                <p className="text-xs text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {upcomingBookings.length}
                </p>
                <p className="text-xs text-gray-600">Upcoming</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Added {format(new Date(performer.createdAt), 'MMM yyyy')}
              </p>
            </div>
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
            <h3 className="text-lg font-semibold mb-4">Edit Performer</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={editForm.stageName}
                    onChange={(e) => setEditForm({ ...editForm, stageName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as keyof typeof performerTypes })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(performerTypes).map(([value, cfg]) => (
                    <option key={value} value={value}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                <input
                  type="text"
                  value={editForm.specialties}
                  onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Comma-separated"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup (min)</label>
                  <input
                    type="number"
                    value={editForm.setupTime}
                    onChange={(e) => setEditForm({ ...editForm, setupTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perform (min)</label>
                  <input
                    type="number"
                    value={editForm.performanceTime}
                    onChange={(e) => setEditForm({ ...editForm, performanceTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breakdown</label>
                  <input
                    type="number"
                    value={editForm.breakdownTime}
                    onChange={(e) => setEditForm({ ...editForm, breakdownTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.standardRate}
                  onChange={(e) => setEditForm({ ...editForm, standardRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
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
                disabled={updatePerformer.isPending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {updatePerformer.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PerformerDetailSkeleton() {
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
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="card">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
