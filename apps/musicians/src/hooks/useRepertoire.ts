import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateSongInput, UpdateSongInput } from '@/lib/services/repertoire'

// Query keys
export const repertoireKeys = {
  all: ['repertoire'] as const,
  lists: () => [...repertoireKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...repertoireKeys.lists(), filters] as const,
  details: () => [...repertoireKeys.all, 'detail'] as const,
  detail: (id: string) => [...repertoireKeys.details(), id] as const,
  stats: () => [...repertoireKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchSongs(filters?: {
  search?: string
  mood?: string
  genre?: string
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value))
    })
  }
  const res = await fetch(`/api/repertoire?${params}`)
  if (!res.ok) throw new Error('Failed to fetch songs')
  return res.json()
}

async function fetchSong(id: string) {
  const res = await fetch(`/api/repertoire/${id}`)
  if (!res.ok) throw new Error('Failed to fetch song')
  return res.json()
}

async function fetchRepertoireStats() {
  const res = await fetch('/api/repertoire/stats')
  if (!res.ok) throw new Error('Failed to fetch repertoire stats')
  return res.json()
}

// Hooks
export function useRepertoire(filters?: {
  search?: string
  mood?: string
  genre?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: repertoireKeys.list(filters || {}),
    queryFn: () => fetchSongs(filters),
  })
}

export function useSong(id: string) {
  return useQuery({
    queryKey: repertoireKeys.detail(id),
    queryFn: () => fetchSong(id),
    enabled: !!id,
  })
}

export function useRepertoireStats() {
  return useQuery({
    queryKey: repertoireKeys.stats(),
    queryFn: fetchRepertoireStats,
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSongInput) => {
      const res = await fetch('/api/repertoire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create song')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repertoireKeys.lists() })
      queryClient.invalidateQueries({ queryKey: repertoireKeys.stats() })
    },
  })
}

export function useUpdateSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSongInput }) => {
      const res = await fetch(`/api/repertoire/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update song')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: repertoireKeys.lists() })
      queryClient.invalidateQueries({ queryKey: repertoireKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: repertoireKeys.stats() })
    },
  })
}

export function useDeleteSong() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/repertoire/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete song')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repertoireKeys.lists() })
      queryClient.invalidateQueries({ queryKey: repertoireKeys.stats() })
    },
  })
}
