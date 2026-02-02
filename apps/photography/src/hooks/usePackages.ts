import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
}

export interface Shoot {
  id: string
  date: string
  startTime: string
  endTime: string
  venueName?: string
  venueAddress?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  total: number
  createdAt: string
}

export interface ShotList {
  id: string
  name: string
  status: string
  totalShots: number
}

export interface PackageAddon {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
}

export type PackageStatus = 'INQUIRY' | 'QUOTE_SENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface Package {
  id: string
  title: string
  status: PackageStatus
  eventType?: string
  eventDate?: string
  shotCount?: number
  deliveryDays?: number
  galleryUrl?: string
  editingHours?: number
  styleTags: string[]
  equipment: string[]
  secondShooter: boolean
  rawFilesIncluded: boolean
  timeline?: Record<string, unknown>
  basePrice?: number
  travelCosts?: number
  totalPrice?: number
  notes?: string
  createdAt: string
  updatedAt: string
  clientId: string
  client: Client
  shoots?: Shoot[]
  invoices?: Invoice[]
  shotLists?: ShotList[]
  addons?: PackageAddon[]
}

export interface PackagesResponse {
  data: Package[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface PackageFilters {
  search?: string
  status?: PackageStatus
  statuses?: PackageStatus[]
  clientId?: string
  eventType?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'eventDate' | 'title' | 'status' | 'totalPrice'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreatePackageInput {
  clientId: string
  title: string
  eventType?: string
  eventDate?: string
  shotCount?: number
  deliveryDays?: number
  editingHours?: number
  styleTags?: string[]
  equipment?: string[]
  secondShooter?: boolean
  rawFilesIncluded?: boolean
  timeline?: Record<string, unknown>
  basePrice?: number
  travelCosts?: number
  totalPrice?: number
  notes?: string
}

export interface UpdatePackageInput extends Partial<CreatePackageInput> {
  status?: PackageStatus
  galleryUrl?: string
}

// API functions
async function fetchPackages(filters: PackageFilters = {}): Promise<PackagesResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','))
  if (filters.clientId) params.set('clientId', filters.clientId)
  if (filters.eventType) params.set('eventType', filters.eventType)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  const response = await fetch(`/api/packages?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch packages')
  }
  return response.json()
}

async function fetchPackage(id: string): Promise<Package> {
  const response = await fetch(`/api/packages/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch package')
  }
  return response.json()
}

async function createPackage(data: CreatePackageInput): Promise<Package> {
  const response = await fetch('/api/packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create package')
  }
  return response.json()
}

async function updatePackage({ id, ...data }: UpdatePackageInput & { id: string }): Promise<Package> {
  const response = await fetch(`/api/packages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update package')
  }
  return response.json()
}

async function deletePackage(id: string): Promise<void> {
  const response = await fetch(`/api/packages/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete package')
  }
}

// Hooks
export function usePackages(filters: PackageFilters = {}) {
  return useQuery({
    queryKey: ['packages', filters],
    queryFn: () => fetchPackages(filters),
  })
}

export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => fetchPackage(id!),
    enabled: !!id,
  })
}

export function useCreatePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Package created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePackage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['package', data.id] })
      toast.success('Package updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Package deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePackageStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PackageStatus }) =>
      updatePackage({ id, status }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['package', data.id] })
      toast.success(`Status updated to ${data.status.replace('_', ' ')}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Status workflow helpers
export const STATUS_LABELS: Record<PackageStatus, string> = {
  INQUIRY: 'Inquiry',
  QUOTE_SENT: 'Quote Sent',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const STATUS_COLORS: Record<PackageStatus, string> = {
  INQUIRY: 'bg-gray-100 text-gray-800',
  QUOTE_SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function getNextStatuses(currentStatus: PackageStatus): PackageStatus[] {
  switch (currentStatus) {
    case 'INQUIRY':
      return ['QUOTE_SENT', 'CANCELLED']
    case 'QUOTE_SENT':
      return ['CONFIRMED', 'CANCELLED']
    case 'CONFIRMED':
      return ['COMPLETED', 'CANCELLED']
    case 'COMPLETED':
      return []
    case 'CANCELLED':
      return []
    default:
      return []
  }
}
