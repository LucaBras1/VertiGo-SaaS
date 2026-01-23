/**
 * Order Workflow Configuration
 *
 * Defines all possible order statuses, their properties, and valid transitions
 */

export type OrderStatus =
  | 'new'
  | 'reviewing'
  | 'awaiting_info'
  | 'quote_sent'
  | 'confirmed'
  | 'approved'
  | 'completed'
  | 'cancelled'

export interface StatusConfig {
  label: string
  description: string
  color: string // Tailwind color class
  bgColor: string
  borderColor: string
  icon: string
  nextStatuses: OrderStatus[] // Valid transitions from this status
}

export const ORDER_STATUSES: Record<OrderStatus, StatusConfig> = {
  new: {
    label: 'Nova',
    description: 'Ceka na zpracovani',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: '📥',
    nextStatuses: ['reviewing', 'quote_sent', 'cancelled'],
  },
  reviewing: {
    label: 'V posouzeni',
    description: 'Zakaznik zaslal pripominky, ceka na upravu nabidky',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: '💬',
    nextStatuses: ['awaiting_info', 'quote_sent', 'cancelled'],
  },
  awaiting_info: {
    label: 'Ceka na informace',
    description: 'Cekame na doplnujici informace od klienta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: '⏳',
    nextStatuses: ['reviewing', 'quote_sent', 'cancelled'],
  },
  quote_sent: {
    label: 'Nabidka odeslana',
    description: 'Nabidka byla odeslana zakaznikovi k potvrzeni',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: '📤',
    nextStatuses: ['confirmed', 'reviewing', 'awaiting_info', 'cancelled'],
  },
  confirmed: {
    label: 'Potvrzeno',
    description: 'Klient potvrdil objednavku',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-300',
    icon: '✅',
    nextStatuses: ['approved', 'cancelled'],
  },
  approved: {
    label: 'Schvaleno',
    description: 'Objednavka je schvalena a pripravena k realizaci',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: '🎯',
    nextStatuses: ['completed', 'cancelled'],
  },
  completed: {
    label: 'Dokonceno',
    description: 'Objednavka byla uspesne realizovana',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    icon: '🏁',
    nextStatuses: [], // Terminal state
  },
  cancelled: {
    label: 'Zruseno',
    description: 'Objednavka byla zrusena',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: '❌',
    nextStatuses: ['new'], // Can be reopened
  },
}

// Status workflow order for progress visualization
export const STATUS_WORKFLOW_ORDER: OrderStatus[] = [
  'new',
  'reviewing',
  'awaiting_info',
  'quote_sent',
  'confirmed',
  'approved',
  'completed',
]

/**
 * Get progress percentage based on status
 */
export function getStatusProgress(status: OrderStatus): number {
  if (status === 'cancelled') return 0
  const index = STATUS_WORKFLOW_ORDER.indexOf(status)
  if (index === -1) return 0
  return Math.round((index / (STATUS_WORKFLOW_ORDER.length - 1)) * 100)
}

/**
 * Check if a transition from one status to another is valid
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const config = ORDER_STATUSES[from]
  return config.nextStatuses.includes(to)
}

/**
 * Get all valid next statuses for a given status
 */
export function getNextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES[status].nextStatuses
}

/**
 * Get status config
 */
export function getStatusConfig(status: OrderStatus): StatusConfig {
  return ORDER_STATUSES[status]
}
