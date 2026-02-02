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

// API functions
async function fetchClients(filters: ClientFilters = {}): Promise<Client[]> {
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
  const data = await response.json()
  // API might return array directly or with pagination wrapper
  return Array.isArray(data) ? data : data.data || []
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

// Client type labels
export const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  couple: 'Couple',
  business: 'Business',
}
