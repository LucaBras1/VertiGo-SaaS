import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
  }
  package: {
    id: string
    title: string
    eventType: string | null
  } | null
}

export interface InvoiceFilters {
  search?: string
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  clientId?: string
  sortBy?: 'createdAt' | 'dueDate' | 'total'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateInvoiceInput {
  clientId: string
  packageId?: string
  items: LineItem[]
  subtotal: number
  tax?: number
  total: number
  dueDate?: string
  notes?: string
}

export interface UpdateInvoiceInput {
  status?: Invoice['status']
  items?: LineItem[]
  subtotal?: number
  tax?: number
  total?: number
  dueDate?: string
  notes?: string
  paidAt?: string
}

export interface InvoiceStats {
  total: number
  byStatus: {
    DRAFT: number
    SENT: number
    PAID: number
    OVERDUE: number
    CANCELLED: number
  }
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
}

// API functions
async function fetchInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.clientId) params.set('clientId', filters.clientId)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  const response = await fetch(`/api/invoices?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch invoices')
  }
  return response.json()
}

async function fetchInvoice(id: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch invoice')
  }
  return response.json()
}

async function createInvoice(data: CreateInvoiceInput): Promise<Invoice> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create invoice')
  }
  return response.json()
}

async function updateInvoice({ id, ...data }: UpdateInvoiceInput & { id: string }): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update invoice')
  }
  return response.json()
}

async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete invoice')
  }
}

async function sendInvoice(id: string): Promise<Invoice> {
  // Send invoice via email and update status to SENT
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'SENT' }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send invoice')
  }
  return response.json()
}

async function markAsPaid(id: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'PAID',
      paidAt: new Date().toISOString()
    }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to mark invoice as paid')
  }
  return response.json()
}

// Hooks
export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id!),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] })
      toast.success('Invoice updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] })
      toast.success('Invoice sent to client')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAsPaid,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] })
      toast.success('Invoice marked as paid')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Invoice status labels and colors
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'gray',
  SENT: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
  CANCELLED: 'gray',
}

// Utility functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

export function calculateInvoiceTotals(items: LineItem[], taxRate: number = 0): {
  subtotal: number
  tax: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal + tax

  return { subtotal, tax, total }
}
