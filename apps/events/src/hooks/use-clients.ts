import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  address?: string | null
  city?: string | null
  clientType: 'individual' | 'corporate'
  tags: string[]
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

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  city?: string
  clientType?: 'individual' | 'corporate'
  tags?: string[]
  notes?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {}

async function fetchClients(search?: string, type?: string): Promise<Client[]> {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (type) params.append('type', type)

  const res = await fetch(`/api/clients?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch clients')
  const data = await res.json()
  return data.clients
}

async function fetchClient(id: string): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`)
  if (!res.ok) throw new Error('Client not found')
  const data = await res.json()
  return data.client
}

async function createClient(data: CreateClientData): Promise<Client> {
  const res = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create client')
  }
  const result = await res.json()
  return result.client
}

async function updateClient(id: string, data: UpdateClientData): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update client')
  }
  const result = await res.json()
  return result.client
}

async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to delete client')
  }
}

export function useClients(search?: string, type?: string) {
  return useQuery({
    queryKey: ['clients', search, type],
    queryFn: () => fetchClients(search, type),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
