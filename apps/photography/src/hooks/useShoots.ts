import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface Shoot {
  id: string
  packageId: string
  date: string
  startTime: string
  endTime: string
  venueType: string | null
  venueName: string | null
  venueAddress: string | null
  lightingNotes: string | null
  notes: string | null
  timeline: unknown | null
  locations: unknown[]
  sunsetTime: string | null
  weatherForecast: unknown | null
  createdAt: string
  updatedAt: string
  package: {
    id: string
    title: string
    status: string
    eventType: string | null
    client: {
      id: string
      name: string
      email: string
    }
  }
  shotList?: {
    id: string
    title: string
  } | null
}

export interface ShootFilters {
  dateFrom?: string
  dateTo?: string
  packageId?: string
}

export interface CreateShootInput {
  packageId: string
  date: string
  startTime: string
  endTime: string
  venueType?: string
  venueName?: string
  venueAddress?: string
  lightingNotes?: string
  notes?: string
  timeline?: unknown
  locations?: unknown[]
  sunsetTime?: string
  weatherForecast?: unknown
  shotListId?: string
}

export interface UpdateShootInput extends Partial<CreateShootInput> {
  id: string
}

// API functions
async function fetchShoots(filters: ShootFilters = {}): Promise<Shoot[]> {
  const params = new URLSearchParams()

  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.packageId) params.set('packageId', filters.packageId)

  const response = await fetch(`/api/shoots?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch shoots')
  }
  const data = await response.json()
  return Array.isArray(data) ? data : data.shoots || []
}

async function fetchShoot(id: string): Promise<Shoot> {
  const response = await fetch(`/api/shoots/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch shoot')
  }
  return response.json()
}

async function createShoot(data: CreateShootInput): Promise<Shoot> {
  const response = await fetch('/api/shoots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create shoot')
  }
  return response.json()
}

async function updateShoot({ id, ...data }: UpdateShootInput): Promise<Shoot> {
  const response = await fetch(`/api/shoots/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update shoot')
  }
  return response.json()
}

async function deleteShoot(id: string): Promise<void> {
  const response = await fetch(`/api/shoots/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete shoot')
  }
}

// Hooks

// Fetch all shoots (with optional filters)
export function useShoots(filters: ShootFilters = {}) {
  return useQuery({
    queryKey: ['shoots', filters],
    queryFn: () => fetchShoots(filters),
  })
}

// Fetch shoots for a specific week (for calendar view)
export function useShootsWeek(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['shoots', 'week', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const shoots = await fetchShoots()
      // Filter shoots within the week range
      return shoots.filter(shoot => {
        const shootDate = new Date(shoot.date)
        return shootDate >= startDate && shootDate <= endDate
      })
    },
  })
}

// Fetch a single shoot by ID
export function useShoot(id: string | undefined) {
  return useQuery({
    queryKey: ['shoot', id],
    queryFn: () => fetchShoot(id!),
    enabled: !!id,
  })
}

// Create a new shoot
export function useCreateShoot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShoot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoots'] })
      toast.success('Shoot scheduled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Update an existing shoot
export function useUpdateShoot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateShoot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shoots'] })
      queryClient.invalidateQueries({ queryKey: ['shoot', data.id] })
      toast.success('Shoot updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Delete a shoot
export function useDeleteShoot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteShoot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoots'] })
      toast.success('Shoot deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Status color mapping for calendar
export const SHOOT_STATUS_COLORS: Record<string, string> = {
  INQUIRY: 'bg-gray-100 border-gray-300 text-gray-800',
  QUOTE_SENT: 'bg-blue-100 border-blue-300 text-blue-800',
  CONFIRMED: 'bg-green-100 border-green-300 text-green-800',
  COMPLETED: 'bg-amber-100 border-amber-300 text-amber-800',
  CANCELLED: 'bg-red-100 border-red-300 text-red-800',
}

export const VENUE_TYPE_OPTIONS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'mixed', label: 'Mixed' },
]
