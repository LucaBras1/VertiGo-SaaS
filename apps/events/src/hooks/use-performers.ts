import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type PerformerType = 'fire' | 'magic' | 'circus' | 'music' | 'dance' | 'comedy' | 'interactive'

export interface Performer {
  id: string
  name: string
  stageName?: string | null
  type: PerformerType
  bio?: string | null
  specialties: string[]
  setupTime: number
  performanceTime: number
  breakdownTime: number
  requirements?: Record<string, unknown> | null
  email?: string | null
  phone?: string | null
  website?: string | null
  standardRate?: number | null
  rating?: number | null
  totalBookings: number
  createdAt: string
  updatedAt: string
  bookings?: Array<{
    id: string
    status: string
    agreedRate: number
    event: {
      id: string
      name: string
      date: string
      type: string
    }
  }>
  _count?: {
    bookings: number
  }
}

export interface CreatePerformerData {
  name: string
  stageName?: string
  type: PerformerType
  bio?: string
  specialties?: string[]
  setupTime?: number
  performanceTime?: number
  breakdownTime?: number
  requirements?: Record<string, unknown>
  email?: string
  phone?: string
  website?: string
  standardRate?: number
}

export interface UpdatePerformerData extends Partial<CreatePerformerData> {
  rating?: number
}

async function fetchPerformers(type?: string): Promise<Performer[]> {
  const params = new URLSearchParams()
  if (type) params.append('type', type)

  const res = await fetch(`/api/performers?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch performers')
  const data = await res.json()
  return data.performers
}

async function fetchPerformer(id: string): Promise<Performer> {
  const res = await fetch(`/api/performers/${id}`)
  if (!res.ok) throw new Error('Performer not found')
  const data = await res.json()
  return data.performer
}

async function createPerformer(data: CreatePerformerData): Promise<Performer> {
  const res = await fetch('/api/performers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create performer')
  }
  const result = await res.json()
  return result.performer
}

async function updatePerformer(id: string, data: UpdatePerformerData): Promise<Performer> {
  const res = await fetch(`/api/performers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update performer')
  }
  const result = await res.json()
  return result.performer
}

async function deletePerformer(id: string): Promise<void> {
  const res = await fetch(`/api/performers/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete performer')
  }
}

export function usePerformers(type?: string) {
  return useQuery({
    queryKey: ['performers', type],
    queryFn: () => fetchPerformers(type),
  })
}

export function usePerformer(id: string) {
  return useQuery({
    queryKey: ['performers', id],
    queryFn: () => fetchPerformer(id),
    enabled: !!id,
  })
}

export function useCreatePerformer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPerformer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performers'] })
    },
  })
}

export function useUpdatePerformer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePerformerData }) =>
      updatePerformer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['performers'] })
      queryClient.invalidateQueries({ queryKey: ['performers', id] })
    },
  })
}

export function useDeletePerformer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePerformer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performers'] })
    },
  })
}
