import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateClientInput, UpdateClientInput } from '@/lib/services/clients'

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  stats: () => [...clientKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchClients(filters?: {
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
  const res = await fetch(`/api/clients?${params}`)
  if (!res.ok) throw new Error('Failed to fetch clients')
  return res.json()
}

async function fetchClient(id: string) {
  const res = await fetch(`/api/clients/${id}`)
  if (!res.ok) throw new Error('Failed to fetch client')
  return res.json()
}

async function fetchClientStats() {
  const res = await fetch('/api/clients/stats')
  if (!res.ok) throw new Error('Failed to fetch client stats')
  return res.json()
}

// Hooks
export function useClients(filters?: {
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: clientKeys.list(filters || {}),
    queryFn: () => fetchClients(filters),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
  })
}

export function useClientStats() {
  return useQuery({
    queryKey: clientKeys.stats(),
    queryFn: fetchClientStats,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateClientInput) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create client')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientInput }) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update client')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete client')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientKeys.stats() })
    },
  })
}
