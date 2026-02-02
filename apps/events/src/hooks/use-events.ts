import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Venue } from './use-venues'
import type { Client } from './use-clients'
import type { Performer } from './use-performers'

export type EventType = 'corporate' | 'wedding' | 'festival' | 'private_party' | 'gala' | 'concert' | 'product_launch'
export type EventStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  eventId: string
  performerId: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  callTime?: string | null
  setupStart?: string | null
  performanceStart?: string | null
  performanceEnd?: string | null
  loadOut?: string | null
  agreedRate: number
  deposit?: number | null
  paidAmount: number
  contractSigned: boolean
  contractUrl?: string | null
  notes?: string | null
  performer: Performer
  createdAt: string
  updatedAt: string
}

export interface EventTask {
  id: string
  eventId: string
  title: string
  description?: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string | null
  completedAt?: string | null
  assignedTo?: string | null
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  name: string
  type: EventType
  status: EventStatus
  date: string
  startTime: string
  endTime: string
  guestCount?: number | null
  description?: string | null
  notes?: string | null
  venueId?: string | null
  venueCustom?: string | null
  clientId?: string | null
  totalBudget?: number | null
  spentAmount?: number | null
  timeline?: unknown
  tenantId: string
  createdById: string
  createdAt: string
  updatedAt: string
  venue?: Venue | null
  client?: Client | null
  bookings?: Booking[]
  tasks?: EventTask[]
  createdBy?: {
    id: string
    name?: string | null
    email: string
  }
}

export interface CreateEventData {
  name: string
  type: EventType
  status?: EventStatus
  date: string
  startTime: string
  endTime: string
  guestCount?: number
  description?: string
  venueId?: string
  clientId?: string
  totalBudget?: number
}

export interface UpdateEventData {
  name?: string
  type?: EventType
  status?: EventStatus
  date?: string
  startTime?: string
  endTime?: string
  guestCount?: number
  description?: string | null
  notes?: string | null
  venueId?: string | null
  venueCustom?: string | null
  clientId?: string | null
  totalBudget?: number | null
  spentAmount?: number
  timeline?: unknown
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch('/api/events')
  if (!res.ok) throw new Error('Failed to fetch events')
  const data = await res.json()
  return data.events
}

async function fetchEvent(id: string): Promise<Event> {
  const res = await fetch(`/api/events/${id}`)
  if (!res.ok) throw new Error('Event not found')
  const data = await res.json()
  return data.event
}

async function createEvent(data: CreateEventData): Promise<Event> {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create event')
  }
  const result = await res.json()
  return result.event
}

async function updateEvent(id: string, data: UpdateEventData): Promise<Event> {
  const res = await fetch(`/api/events/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update event')
  }
  const result = await res.json()
  return result.event
}

async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete event')
  }
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) =>
      updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Task hooks
async function createTask(eventId: string, data: { title: string; description?: string; priority?: string; dueDate?: string }): Promise<EventTask> {
  const res = await fetch(`/api/events/${eventId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create task')
  }
  const result = await res.json()
  return result.task
}

async function updateTask(eventId: string, taskId: string, data: Partial<EventTask>): Promise<EventTask> {
  const res = await fetch(`/api/events/${eventId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update task')
  }
  const result = await res.json()
  return result.task
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: { title: string; description?: string; priority?: string; dueDate?: string } }) =>
      createTask(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, taskId, data }: { eventId: string; taskId: string; data: Partial<EventTask> }) =>
      updateTask(eventId, taskId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
