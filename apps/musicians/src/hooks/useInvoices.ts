import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateInvoiceInput, UpdateInvoiceInput } from '@/lib/services/invoices'

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  stats: () => [...invoiceKeys.all, 'stats'] as const,
}

// Fetch functions
async function fetchInvoices(filters?: {
  status?: string
  customerId?: string
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
  const res = await fetch(`/api/invoices?${params}`)
  if (!res.ok) throw new Error('Failed to fetch invoices')
  return res.json()
}

async function fetchInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`)
  if (!res.ok) throw new Error('Failed to fetch invoice')
  return res.json()
}

async function fetchInvoiceStats() {
  const res = await fetch('/api/invoices/stats')
  if (!res.ok) throw new Error('Failed to fetch invoice stats')
  return res.json()
}

// Hooks
export function useInvoices(filters?: {
  status?: string
  customerId?: string
  gigId?: string
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters || {}),
    queryFn: () => fetchInvoices(filters),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  })
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: invoiceKeys.stats(),
    queryFn: fetchInvoiceStats,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateInvoiceInput) => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create invoice')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInvoiceInput }) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update invoice')
      }
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete invoice')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() })
    },
  })
}
