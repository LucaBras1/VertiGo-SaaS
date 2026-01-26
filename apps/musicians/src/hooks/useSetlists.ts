import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateSetlistInput, UpdateSetlistInput } from '@/lib/services/setlists'
import { SetlistStatus } from '@/generated/prisma'

// Query keys
export const setlistKeys = {
  all: ['setlists'] as const,
  lists: () => [...setlistKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...setlistKeys.lists(), filters] as const,
  details: () => [...setlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...setlistKeys.details(), id] as const,
  stats: () => [...setlistKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchSetlists(filters?: {
  status?: SetlistStatus
  gigId?: string
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
  const res = await fetch(`/api/setlists?${params}`)
  if (!res.ok) throw new Error('Failed to fetch setlists')
  return res.json()
}

async function fetchSetlist(id: string) {
  const res = await fetch(`/api/setlists/${id}`)
  if (!res.ok) throw new Error('Failed to fetch setlist')
  return res.json()
}

async function fetchSetlistStats() {
  const res = await fetch('/api/setlists/stats')
  if (!res.ok) throw new Error('Failed to fetch setlist stats')
  return res.json()
}

// Hooks
export function useSetlists(filters?: {
  status?: SetlistStatus
  gigId?: string
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: setlistKeys.list(filters || {}),
    queryFn: () => fetchSetlists(filters),
  })
}

export function useSetlist(id: string) {
  return useQuery({
    queryKey: setlistKeys.detail(id),
    queryFn: () => fetchSetlist(id),
    enabled: !!id,
  })
}

export function useSetlistStats() {
  return useQuery({
    queryKey: setlistKeys.stats(),
    queryFn: fetchSetlistStats,
  })
}

export function useCreateSetlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSetlistInput) => {
      const res = await fetch('/api/setlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create setlist')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setlistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: setlistKeys.stats() })
    },
  })
}

export function useUpdateSetlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSetlistInput }) => {
      const res = await fetch(`/api/setlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update setlist')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: setlistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: setlistKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: setlistKeys.stats() })
    },
  })
}

export function useDeleteSetlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/setlists/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete setlist')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setlistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: setlistKeys.stats() })
    },
  })
}
