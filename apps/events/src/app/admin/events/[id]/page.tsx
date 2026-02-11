'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  User,
  Sparkles,
  ListTodo,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { useEvent, useDeleteEvent, useUpdateEvent, useCreateTask, useUpdateTask } from '@/hooks/use-events'
import { useToast } from '@/hooks/use-toast'
import { useConfirmContext } from '@vertigo/ui'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{ id: string }>
}

type Tab = 'overview' | 'timeline' | 'performers' | 'tasks'

const eventTypeConfig = {
  corporate: { label: 'Corporate', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  wedding: { label: 'Wedding', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-700' },
  festival: { label: 'Festival', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-700' },
  private_party: { label: 'Private Party', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  gala: { label: 'Gala', color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  concert: { label: 'Concert', color: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-700' },
  product_launch: { label: 'Product Launch', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50', text: 'text-teal-700' },
}

const statusConfig = {
  planning: { icon: Clock, label: 'Planning', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'text-green-600', bg: 'bg-green-50' },
  in_progress: { icon: PlayCircle, label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirmContext()
  const { data: event, isLoading, error } = useEvent(id)
  const deleteEvent = useDeleteEvent()
  const updateEvent = useUpdateEvent()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'corporate' as string,
    date: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    description: '',
    notes: '',
    totalBudget: '',
  })

  if (isLoading) {
    return <EventDetailSkeleton />
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            The event you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/events" className="btn-primary inline-flex">
            Return to Events
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = eventTypeConfig[event.type as keyof typeof eventTypeConfig] || eventTypeConfig.corporate
  const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.planning
  const StatusIcon = status.icon

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (confirmed) {
      try {
        await deleteEvent.mutateAsync(id)
        toast.success('Event deleted successfully')
        router.push('/admin/events')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete event')
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEvent.mutateAsync({
        id,
        data: { status: newStatus as typeof event.status },
      })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    setIsAddingTask(true)
    try {
      await createTask.mutateAsync({
        eventId: id,
        data: { title: newTaskTitle.trim() },
      })
      setNewTaskTitle('')
      toast.success('Task added')
    } catch (error) {
      toast.error('Failed to add task')
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      await updateTask.mutateAsync({
        eventId: id,
        taskId,
        data: { status: newStatus },
      })
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleEdit = () => {
    if (!event) return
    setEditForm({
      name: event.name,
      type: event.type,
      date: event.date.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      guestCount: event.guestCount?.toString() || '',
      description: event.description || '',
      notes: event.notes || '',
      totalBudget: event.totalBudget?.toString() || '',
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateEvent.mutateAsync({
        id,
        data: {
          name: editForm.name,
          type: editForm.type as typeof event.type,
          date: editForm.date,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          guestCount: editForm.guestCount ? parseInt(editForm.guestCount) : undefined,
          description: editForm.description || null,
          notes: editForm.notes || null,
          totalBudget: editForm.totalBudget ? parseFloat(editForm.totalBudget) : null,
        },
      })
      toast.success('Event updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update event')
    }
  }

  const budget = event.totalBudget ? Number(event.totalBudget) : 0
  const spent = event.spentAmount ? Number(event.spentAmount) : 0
  const remaining = budget - spent
  const budgetPercentage = budget > 0 ? (spent / budget) * 100 : 0

  const completedTasks = event.tasks?.filter((t) => t.status === 'completed').length || 0
  const totalTasks = event.tasks?.length || 0

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: FileText },
    { id: 'timeline' as Tab, label: 'Timeline', icon: Clock },
    { id: 'performers' as Tab, label: 'Performers', icon: Users, count: event.bookings?.length },
    { id: 'tasks' as Tab, label: 'Tasks', icon: ListTodo, count: totalTasks },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold">{event.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                {typeConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border-2 font-medium text-sm ${status.bg} ${status.color} border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              {Object.entries(statusConfig).map(([value, cfg]) => (
                <option key={value} value={value}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              {deleteEvent.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors inline-flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Venue</p>
                      <Link
                        href={`/admin/venues/${event.venue.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {event.venue.name}
                      </Link>
                    </div>
                  </div>
                )}
                {event.client && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client</p>
                      <Link
                        href={`/admin/clients/${event.client.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {event.client.name}
                      </Link>
                    </div>
                  </div>
                )}
                {event.guestCount && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Guest Count</p>
                      <p className="font-medium">{event.guestCount.toLocaleString()} guests</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created By</p>
                    <p className="font-medium">{event.createdBy?.name || event.createdBy?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Performers Summary */}
            {event.bookings && event.bookings.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Performers</h2>
                  <button
                    onClick={() => setActiveTab('performers')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-2">
                  {event.bookings.slice(0, 3).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/performers/${booking.performer.id}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {booking.performer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.performer.stageName || booking.performer.name}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {booking.performer.type}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-50 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            {budget > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                  Budget
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-medium">{budgetPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          budgetPercentage > 100
                            ? 'bg-red-500'
                            : budgetPercentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-900">${budget.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="font-semibold text-red-600">${spent.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <ListTodo className="w-5 h-5 mr-2 text-primary-600" />
                  Tasks
                </h2>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="text-sm text-gray-500">Tasks Completed</p>
              </div>
              {totalTasks > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">AI Timeline Generator</h2>
              <p className="text-gray-600">
                Generate an optimized event schedule considering all performers, setup times, and guest experience flow.
              </p>
            </div>
          </div>

          {event.timeline ? (
            <div className="space-y-4">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>Timeline has been generated for this event.</span>
              </div>
              <pre className="p-4 bg-gray-50 rounded-lg overflow-auto text-sm">
                {JSON.stringify(event.timeline, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No timeline generated yet</p>
              <p className="text-sm text-gray-500">
                Add performers and venue details, then generate an AI-optimized timeline.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performers' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Booked Performers</h2>
            <button className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Performer
            </button>
          </div>

          {event.bookings && event.bookings.length > 0 ? (
            <div className="space-y-4">
              {event.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-medium">
                        {booking.performer.name.charAt(0)}
                      </div>
                      <div>
                        <Link
                          href={`/admin/performers/${booking.performer.id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {booking.performer.stageName || booking.performer.name}
                        </Link>
                        <p className="text-sm text-gray-500 capitalize">{booking.performer.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {booking.callTime && (
                      <div>
                        <p className="text-gray-500">Call Time</p>
                        <p className="font-medium">{booking.callTime}</p>
                      </div>
                    )}
                    {booking.performanceStart && (
                      <div>
                        <p className="text-gray-500">Performance</p>
                        <p className="font-medium">
                          {booking.performanceStart} - {booking.performanceEnd}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Rate</p>
                      <p className="font-medium text-green-600">
                        ${Number(booking.agreedRate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contract</p>
                      <p className="font-medium">
                        {booking.contractSigned ? (
                          <span className="text-green-600">Signed</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No performers booked yet</p>
              <button className="btn-primary inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add First Performer
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Event Tasks</h2>

          {/* Add Task */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || isAddingTask}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isAddingTask ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>

          {event.tasks && event.tasks.length > 0 ? (
            <div className="space-y-2">
              {event.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    task.status === 'completed' ? 'bg-gray-50' : 'bg-white border border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-500">{task.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    task.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'high'
                      ? 'bg-orange-100 text-orange-700'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ListTodo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No tasks yet</p>
              <p className="text-sm text-gray-500">Add tasks to track your event preparation</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
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
                  Event Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(eventTypeConfig).map(([value, cfg]) => (
                    <option key={value} value={value}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Count
                </label>
                <input
                  type="number"
                  value={editForm.guestCount}
                  onChange={(e) => setEditForm({ ...editForm, guestCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget
                </label>
                <input
                  type="number"
                  value={editForm.totalBudget}
                  onChange={(e) => setEditForm({ ...editForm, totalBudget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="md:col-span-2">
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
                disabled={updateEvent.isPending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center"
              >
                {updateEvent.isPending && (
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

function EventDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
