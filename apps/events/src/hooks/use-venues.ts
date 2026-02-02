import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Venue {
  id: string
  name: string
  type: 'indoor' | 'outdoor' | 'mixed'
  address?: string | null
  city?: string | null
  capacity?: number | null
  setupAccessTime?: string | null
  curfew?: string | null
  restrictions: string[]
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  events?: Array<{
    id: string
    name: string
    date: string
    type: string
    status: string
  }>
  _count?: {
    events: number
  }
}

export interface CreateVenueData {
  name: string
  type: 'indoor' | 'outdoor' | 'mixed'
  address?: string
  city?: string
  capacity?: number
  setupAccessTime?: string
  curfew?: string
  restrictions?: string[]
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
}

export interface UpdateVenueData extends Partial<CreateVenueData> {}

async function fetchVenues(type?: string): Promise<Venue[]> {
  const params = new URLSearchParams()
  if (type) params.append('type', type)

  const res = await fetch(`/api/venues?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch venues')
  const data = await res.json()
  return data.venues
}

async function fetchVenue(id: string): Promise<Venue> {
  const res = await fetch(`/api/venues/${id}`)
  if (!res.ok) throw new Error('Venue not found')
  const data = await res.json()
  return data.venue
}

async function createVenue(data: CreateVenueData): Promise<Venue> {
  const res = await fetch('/api/venues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create venue')
  }
  const result = await res.json()
  return result.venue
}

async function updateVenue(id: string, data: UpdateVenueData): Promise<Venue> {
  const res = await fetch(`/api/venues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update venue')
  }
  const result = await res.json()
  return result.venue
}

async function deleteVenue(id: string): Promise<void> {
  const res = await fetch(`/api/venues/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete venue')
  }
}

export function useVenues(type?: string) {
  return useQuery({
    queryKey: ['venues', type],
    queryFn: () => fetchVenues(type),
  })
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: () => fetchVenue(id),
    enabled: !!id,
  })
}

export function useCreateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

export function useUpdateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVenueData }) =>
      updateVenue(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venues', id] })
    },
  })
}

export function useDeleteVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}
