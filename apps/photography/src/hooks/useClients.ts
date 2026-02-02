import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  type: 'individual' | 'couple' | 'business'
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  packages?: Array<{
    id: string
    title: string
    status: string
    totalPrice: number | null
  }>
  _count?: {
    packages: number
    invoices: number
  }
}

export interface ClientsResponse {
  data: Client[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ClientFilters {
  search?: string
  type?: 'individual' | 'couple' | 'business'
  sortBy?: 'createdAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateClientInput {
  name: string
  email: string
  phone?: string
  address?: string
  type?: 'individual' | 'couple' | 'business'
  tags?: string[]
  notes?: string
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface ClientStats {
  total: number
  byType: {
    individual: number
    couple: number
    business: number
  }
  active: number
  newThisMonth: number
  lifetimeValue: number
  topClients: Array<{
    id: string
    name: string
    email: string
    revenue: number
    packageCount: number
  }>
}

export interface BulkDeleteResult {
  success: boolean
  deleted: number
  failed: Array<{
    id: string
    name: string
    reason: string
  }>
}

// API functions
async function fetchClients(filters: ClientFilters = {}): Promise<ClientsResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.type) params.set('type', filters.type)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  const response = await fetch(`/api/clients?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch clients')
  }
  return response.json()
}

async function fetchClientStats(): Promise<ClientStats> {
  const response = await fetch('/api/clients/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch client stats')
  }
  return response.json()
}

async function bulkDeleteClients(ids: string[]): Promise<BulkDeleteResult> {
  const response = await fetch('/api/clients/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', ids }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete clients')
  }
  return response.json()
}

async function fetchClient(id: string): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch client')
  }
  return response.json()
}

async function createClient(data: CreateClientInput): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create client')
  }
  return response.json()
}

async function updateClient({ id, ...data }: UpdateClientInput & { id: string }): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update client')
  }
  return response.json()
}

async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete client')
  }
}

// Hooks
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => fetchClients(filters),
    select: (data) => ({
      clients: data.data,
      pagination: data.pagination,
    }),
  })
}

export function useClientStats() {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: fetchClientStats,
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id!),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', data.id] })
      toast.success('Client updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkDeleteClients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bulkDeleteClients,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      if (result.failed.length > 0) {
        toast.success(`Deleted ${result.deleted} clients. ${result.failed.length} could not be deleted.`)
      } else {
        toast.success(`Successfully deleted ${result.deleted} clients`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Client type labels
export const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  couple: 'Couple',
  business: 'Business',
}
