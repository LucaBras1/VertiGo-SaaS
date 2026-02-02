import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateGigInput, UpdateGigInput } from '@/lib/services/gigs'
import { GigStatus } from '@/generated/prisma'

// Query keys
export const gigKeys = {
  all: ['gigs'] as const,
  lists: () => [...gigKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...gigKeys.lists(), filters] as const,
  details: () => [...gigKeys.all, 'detail'] as const,
  detail: (id: string) => [...gigKeys.details(), id] as const,
  stats: () => [...gigKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchGigs(filters?: {
  status?: GigStatus
  search?: string
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value))
    })
  }
  const res = await fetch(`/api/gigs?${params}`)
  if (!res.ok) throw new Error('Failed to fetch gigs')
  return res.json()
}

async function fetchGig(id: string) {
  const res = await fetch(`/api/gigs/${id}`)
  if (!res.ok) throw new Error('Failed to fetch gig')
  return res.json()
}

async function fetchGigStats() {
  const res = await fetch('/api/gigs/stats')
  if (!res.ok) throw new Error('Failed to fetch gig stats')
  return res.json()
}

// Hooks
export function useGigs(filters?: {
  status?: GigStatus
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: gigKeys.list(filters || {}),
    queryFn: () => fetchGigs(filters),
  })
}

export function useGig(id: string) {
  return useQuery({
    queryKey: gigKeys.detail(id),
    queryFn: () => fetchGig(id),
    enabled: !!id,
  })
}

export function useGigStats() {
  return useQuery({
    queryKey: gigKeys.stats(),
    queryFn: fetchGigStats,
  })
}

export function useCreateGig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateGigInput) => {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create gig')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gigKeys.stats() })
    },
  })
}

export function useUpdateGig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGigInput }) => {
      const res = await fetch(`/api/gigs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update gig')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gigKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: gigKeys.stats() })
    },
  })
}

export function useDeleteGig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gigs/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete gig')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gigKeys.stats() })
    },
  })
}

// Bulk operations
export function useBulkDeleteGigs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/gigs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete gigs')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gigKeys.stats() })
    },
  })
}

export function useBulkUpdateGigStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: GigStatus }) => {
      const res = await fetch('/api/gigs/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update gigs')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gigKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gigKeys.stats() })
    },
  })
}
