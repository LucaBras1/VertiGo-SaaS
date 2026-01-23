/**
 * Vyfakturuj 2.0AI - Type Definitions
 * Custom Invoicing System Types
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Document types (matches Prisma enum)
 */
export const DOCUMENT_TYPE = {
  FAKTURA: 'FAKTURA',
  PROFORMA: 'PROFORMA',
  ZALOHOVA: 'ZALOHOVA',
  VYZVA_K_PLATBE: 'VYZVA_K_PLATBE',
  OPRAVNY_DOKLAD: 'OPRAVNY_DOKLAD',
  PRIJMOVY_DOKLAD: 'PRIJMOVY_DOKLAD',
  DANOVY_DOKLAD: 'DANOVY_DOKLAD',
  CENOVA_NABIDKA: 'CENOVA_NABIDKA',
  OBJEDNAVKA: 'OBJEDNAVKA',
} as const

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]

/**
 * Document type labels in Czech
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  FAKTURA: 'Faktura',
  PROFORMA: 'Proforma faktura',
  ZALOHOVA: 'Zálohová faktura',
  VYZVA_K_PLATBE: 'Výzva k platbě',
  OPRAVNY_DOKLAD: 'Opravný doklad',
  PRIJMOVY_DOKLAD: 'Příjmový doklad',
  DANOVY_DOKLAD: 'Daňový doklad',
  CENOVA_NABIDKA: 'Cenová nabídka',
  OBJEDNAVKA: 'Objednávka',
}

/**
 * Invoice status (matches Prisma enum)
 */
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS]

/**
 * Invoice status labels in Czech
 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Koncept',
  SENT: 'Odesláno',
  VIEWED: 'Zobrazeno',
  PAID: 'Uhrazeno',
  PARTIALLY_PAID: 'Částečně uhrazeno',
  OVERDUE: 'Po splatnosti',
  CANCELLED: 'Stornováno',
  DISPUTED: 'Reklamace',
}

/**
 * Invoice status colors for badges
 */
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-indigo-100 text-indigo-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DISPUTED: 'bg-orange-100 text-orange-800',
}

/**
 * Expense status (matches Prisma enum)
 */
export const EXPENSE_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const

export type ExpenseStatus = (typeof EXPENSE_STATUS)[keyof typeof EXPENSE_STATUS]

/**
 * Expense status labels
 */
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDING: 'Nezaplaceno',
  PAID: 'Zaplaceno',
  CANCELLED: 'Zrušeno',
}

/**
 * Expense categories (matches Prisma enum)
 */
export const EXPENSE_CATEGORY = {
  TRAVEL: 'TRAVEL',
  MATERIAL: 'MATERIAL',
  SERVICE: 'SERVICE',
  EQUIPMENT: 'EQUIPMENT',
  OFFICE: 'OFFICE',
  MARKETING: 'MARKETING',
  OTHER: 'OTHER',
} as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORY)[keyof typeof EXPENSE_CATEGORY]

/**
 * Expense category labels
 */
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRAVEL: 'Cestovné',
  MATERIAL: 'Materiál',
  SERVICE: 'Služby',
  EQUIPMENT: 'Vybavení',
  OFFICE: 'Kancelář',
  MARKETING: 'Marketing',
  OTHER: 'Ostatní',
}

/**
 * Payment methods
 */
export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CARD: 'card',
  PAYPAL: 'paypal',
  OTHER: 'other',
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

/**
 * Payment method labels
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bankovní převod',
  cash: 'Hotovost',
  card: 'Platební karta',
  paypal: 'PayPal',
  other: 'Jiné',
}

/**
 * Recurring invoice frequency
 */
export const RECURRING_FREQUENCY = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const

export type RecurringFrequency = (typeof RECURRING_FREQUENCY)[keyof typeof RECURRING_FREQUENCY]

/**
 * Recurring frequency labels
 */
export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Týdně',
  monthly: 'Měsíčně',
  quarterly: 'Čtvrtletně',
  yearly: 'Ročně',
}

/**
 * Supported currencies
 */
export const CURRENCIES = [
  { code: 'CZK', name: 'Česká koruna', symbol: 'Kč' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Americký dolar', symbol: '$' },
  { code: 'GBP', name: 'Britská libra', symbol: '£' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

/**
 * Unit types for invoice items
 */
export const UNIT_LABELS: Record<string, string> = {
  ks: 'ks',
  hod: 'hod',
  den: 'den',
  mesic: 'měsíc',
  rok: 'rok',
  km: 'km',
  m: 'm',
  m2: 'm²',
  m3: 'm³',
  kg: 'kg',
  l: 'l',
  baleni: 'balení',
  sluzba: 'služba',
}

/**
 * Common VAT rates in Czech Republic
 */
export const VAT_RATES = [
  { rate: 0, label: '0% - Osvobozeno' },
  { rate: 12, label: '12% - Snížená' },
  { rate: 21, label: '21% - Základní' },
] as const

/**
 * Payment reliability levels
 */
export const PAYMENT_RELIABILITY = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor',
} as const

export type PaymentReliability = (typeof PAYMENT_RELIABILITY)[keyof typeof PAYMENT_RELIABILITY]

// ============================================================================
// INVOICE TYPES
// ============================================================================

/**
 * Invoice line item
 */
export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number // in hellers
  vatRate: number // percentage
  vatAmount: number // in hellers
  total: number // in hellers (with VAT)
  totalWithoutVat: number // in hellers
}

/**
 * Invoice data for creation
 */
export interface CreateInvoiceData {
  documentType?: DocumentType
  customerId: string
  orderId?: string
  numberSeriesId?: string
  templateId?: string

  // Dates
  issueDate?: Date | string
  dueDate: Date | string
  taxableSupplyDate?: Date | string

  // Items
  items: InvoiceItem[]

  // Totals (calculated if not provided)
  subtotal?: number
  vatRate?: number
  vatAmount?: number
  totalAmount?: number
  discount?: number
  discountType?: 'amount' | 'percentage'

  // Payment
  paymentMethod?: PaymentMethod
  bankAccount?: string
  iban?: string
  variableSymbol?: string
  constantSymbol?: string
  specificSymbol?: string
  currency?: string

  // Texts
  textBeforeItems?: string
  textAfterItems?: string
  footerNote?: string
  notes?: string
  internalNote?: string
}

/**
 * Invoice data for update
 */
export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  invoiceStatus?: InvoiceStatus
  paidAmount?: number
  paidDate?: Date | string
}

/**
 * Invoice with all relations populated
 */
export interface InvoiceWithRelations {
  id: string
  createdAt: Date
  updatedAt: Date
  invoiceNumber: string
  documentType: DocumentType
  invoiceStatus: InvoiceStatus
  status: string

  customerId: string
  customer: {
    id: string
    email: string
    firstName: string
    lastName: string
    organization?: string
    billingInfo?: BillingInfo
  }

  orderId?: string
  order?: {
    id: string
    orderNumber: string
    eventName?: string
  }

  numberSeriesId?: string
  numberSeries?: {
    id: string
    name: string
    prefix: string
  }

  templateId?: string
  template?: {
    id: string
    name: string
  }

  issueDate: Date
  dueDate: Date
  taxableSupplyDate?: Date
  paidDate?: Date

  items: InvoiceItem[]

  subtotal: number
  vatRate?: number
  vatAmount?: number
  totalAmount: number
  discount?: number
  discountType?: string
  paidAmount: number
  remainingAmount?: number

  paymentMethod?: string
  bankAccount?: string
  iban?: string
  variableSymbol?: string
  currency: string

  pdfUrl?: string
  publicUrl?: string

  textBeforeItems?: string
  textAfterItems?: string
  footerNote?: string
  notes?: string

  reminder1SentAt?: Date
  reminder2SentAt?: Date
  reminder3SentAt?: Date

  lastEmailSentAt?: Date
  emailSentCount: number

  payments?: Payment[]
  expenses?: Expense[]

  parentInvoiceId?: string
  parentInvoice?: InvoiceWithRelations
  childInvoices?: InvoiceWithRelations[]
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

/**
 * Expense data for creation
 */
export interface CreateExpenseData {
  description: string
  category: ExpenseCategory
  subcategory?: string

  amount: number
  vatRate?: number
  vatAmount?: number
  totalAmount: number
  currency?: string

  expenseDate: Date | string

  supplierName?: string
  supplierIco?: string
  supplierDic?: string

  documentNumber?: string
  documentUrl?: string
  documentType?: string

  invoiceId?: string
  orderId?: string

  paymentMethod?: string
  bankAccount?: string

  notes?: string
  internalNote?: string
  tags?: string[]
}

/**
 * Expense with relations
 */
export interface Expense {
  id: string
  createdAt: Date
  updatedAt: Date
  expenseNumber: string
  description: string
  category: ExpenseCategory
  subcategory?: string
  tags?: string[]

  amount: number
  vatRate?: number
  vatAmount?: number
  totalAmount: number
  currency: string

  expenseDate: Date
  paidDate?: Date
  status: ExpenseStatus

  supplierName?: string
  supplierIco?: string
  supplierDic?: string

  documentNumber?: string
  documentUrl?: string
  documentType?: string

  invoiceId?: string
  orderId?: string

  paymentMethod?: string
  bankAccount?: string

  notes?: string
  internalNote?: string
}

// ============================================================================
// NUMBER SERIES TYPES
// ============================================================================

/**
 * Number series pattern placeholders
 */
export const NUMBER_PATTERN_PLACEHOLDERS = {
  PREFIX: '{PREFIX}',
  SUFFIX: '{SUFFIX}',
  YEAR: '{YEAR}',
  YEAR_SHORT: '{YY}',
  MONTH: '{MM}',
  NUMBER: '{NUMBER}',
  NUMBER_PADDED: '{NUMBER:4}', // With padding
} as const

/**
 * Number series data
 */
export interface NumberSeries {
  id: string
  name: string
  documentType: DocumentType
  prefix: string
  suffix?: string
  pattern: string
  yearFormat: string
  numberPadding: number
  currentYear: number
  currentNumber: number
  isDefault: boolean
  isActive: boolean
}

/**
 * Create number series data
 */
export interface CreateNumberSeriesData {
  name: string
  documentType: DocumentType
  prefix: string
  suffix?: string
  pattern: string
  yearFormat?: string
  numberPadding?: number
  isDefault?: boolean
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Invoice template data
 */
export interface InvoiceTemplate {
  id: string
  name: string
  description?: string
  isDefault: boolean
  isActive: boolean

  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string

  showLogo: boolean
  showQrCode: boolean
  showBankDetails: boolean
  showItemNumbers: boolean
  showVatBreakdown: boolean
  paperSize: string

  headerText?: string
  footerText?: string
  textBeforeItems?: string
  textAfterItems?: string
  paymentTermsText?: string
  thankYouText?: string

  defaultVatRate: number
  defaultDaysDue: number
  defaultPaymentMethod?: string

  customCss?: string
}

// ============================================================================
// RECURRING INVOICE TYPES
// ============================================================================

/**
 * Recurring invoice data
 */
export interface RecurringInvoice {
  id: string
  name: string
  description?: string
  isActive: boolean

  customerId: string
  customer?: {
    id: string
    email: string
    firstName: string
    lastName: string
    organization?: string
  }

  frequency: RecurringFrequency
  dayOfMonth?: number
  dayOfWeek?: number
  monthOfYear?: number

  startDate: Date
  endDate?: Date
  nextGenerateAt: Date
  lastGeneratedAt?: Date
  generatedCount: number

  documentType: DocumentType
  numberSeriesId?: string
  templateId?: string

  items: InvoiceItem[]
  subtotal: number
  vatRate?: number
  vatAmount?: number
  totalAmount: number
  daysDue: number

  textBeforeItems?: string
  textAfterItems?: string
  notes?: string

  autoSend: boolean
  emailRecipients?: EmailRecipient[]
}

/**
 * Email recipient
 */
export interface EmailRecipient {
  email: string
  name?: string
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/**
 * Payment record
 */
export interface Payment {
  id: string
  createdAt: Date
  invoiceId: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  variableSymbol?: string
  transactionId?: string
  bankReference?: string
  bankAccount?: string
  notes?: string
  recordedBy?: string
}

/**
 * Create payment data
 */
export interface CreatePaymentData {
  invoiceId: string
  amount: number
  paymentDate: Date | string
  paymentMethod: PaymentMethod
  variableSymbol?: string
  transactionId?: string
  bankReference?: string
  bankAccount?: string
  notes?: string
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

/**
 * Supplier information
 */
export interface SupplierInfo {
  name?: string
  ico?: string
  dic?: string
  street?: string
  city?: string
  zip?: string
  country?: string
  email?: string
  phone?: string
  web?: string
  logoUrl?: string
}

/**
 * Bank account info
 */
export interface BankAccount {
  id?: string
  name: string
  accountNumber: string
  iban?: string
  bic?: string
  isDefault: boolean
}

/**
 * Billing info (for customers)
 */
export interface BillingInfo {
  companyName?: string
  ico?: string
  dic?: string
  billingAddress?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
}

/**
 * Invoicing settings
 */
export interface InvoicingSettings {
  id: string

  // Supplier
  supplierName?: string
  supplierIco?: string
  supplierDic?: string
  supplierStreet?: string
  supplierCity?: string
  supplierZip?: string
  supplierCountry?: string
  supplierEmail?: string
  supplierPhone?: string
  supplierWeb?: string
  supplierLogoUrl?: string

  // Bank
  bankAccountNumber?: string
  bankIban?: string
  bankBic?: string
  bankName?: string
  additionalBankAccounts?: BankAccount[]

  // Defaults
  defaultTemplateId?: string
  defaultDaysDue: number
  defaultVatRate: number
  defaultPaymentMethod?: string
  defaultCurrency: string
  defaultLanguage: string

  // VAT
  isVatPayer: boolean
  vatRegistrationDate?: Date

  // Texts
  textUnderSupplier?: string
  textInvoiceFooter?: string
  defaultTextBeforeItems?: string
  defaultTextAfterItems?: string
  thankYouText?: string
  paymentTermsText?: string
  nonVatPayerText?: string

  // Reminders
  enableReminders: boolean
  reminder1Days: number
  reminder2Days: number
  reminder3Days: number
  reminderEmailSubject?: string
  reminderEmailTemplate?: string

  // Email
  invoiceEmailSubject?: string
  invoiceEmailTemplate?: string

  // Turnover
  annualTurnoverLimit: number
  enableTurnoverWarning: boolean
  turnoverWarningThreshold: number

  // AI
  enableAiSuggestions: boolean
  enablePaymentPrediction: boolean
  enableSmartReminders: boolean
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalInvoiced: number
  totalPaid: number
  totalUnpaid: number
  totalOverdue: number
  invoiceCount: number
  paidCount: number
  unpaidCount: number
  overdueCount: number
}

/**
 * Revenue chart data point
 */
export interface RevenueDataPoint {
  month: string // "2024-01"
  year: number
  monthName: string
  totalInvoiced: number
  totalPaid: number
  totalUnpaid: number
}

/**
 * Revenue chart data
 */
export interface RevenueChartData {
  years: number[]
  data: RevenueDataPoint[]
}

/**
 * Turnover tracking data
 */
export interface TurnoverData {
  year: number
  currentTurnover: number
  limit: number
  percentage: number
  remaining: number
  isWarning: boolean
}

/**
 * Invoice aging data
 */
export interface AgingData {
  current: number // Not yet due
  days1_30: number
  days31_60: number
  days61_90: number
  over90: number
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Invoice list filters
 */
export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus[]
  documentType?: DocumentType[]
  customerId?: string
  dateFrom?: Date | string
  dateTo?: Date | string
  amountMin?: number
  amountMax?: number
  isPaid?: boolean
  isOverdue?: boolean
}

/**
 * Expense list filters
 */
export interface ExpenseFilters {
  search?: string
  status?: ExpenseStatus[]
  category?: ExpenseCategory[]
  dateFrom?: Date | string
  dateTo?: Date | string
  amountMin?: number
  amountMax?: number
  invoiceId?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * API error response
 */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, string[]>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format amount from hellers to CZK string
 */
export function formatAmount(amountInHellers: number, currency = 'CZK'): string {
  const amount = amountInHellers / 100
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Convert CZK amount to hellers
 */
export function toHellers(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert hellers to CZK amount
 */
export function fromHellers(amountInHellers: number): number {
  return amountInHellers / 100
}

/**
 * Calculate line item totals
 */
export function calculateItemTotals(
  quantity: number,
  unitPrice: number,
  vatRate: number
): { totalWithoutVat: number; vatAmount: number; total: number } {
  const totalWithoutVat = Math.round(quantity * unitPrice)
  const vatAmount = Math.round(totalWithoutVat * (vatRate / 100))
  const total = totalWithoutVat + vatAmount
  return { totalWithoutVat, vatAmount, total }
}

/**
 * Calculate invoice totals from items
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  discount = 0,
  discountType: 'amount' | 'percentage' = 'amount'
): { subtotal: number; vatAmount: number; totalAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalWithoutVat, 0)
  const vatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0)

  let discountAmount = 0
  if (discountType === 'percentage') {
    discountAmount = Math.round(subtotal * (discount / 100))
  } else {
    discountAmount = discount
  }

  const totalAmount = subtotal + vatAmount - discountAmount

  return { subtotal, vatAmount, totalAmount }
}

/**
 * Get document type label
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type] || type
}

/**
 * Get invoice status label
 */
export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status] || status
}

/**
 * Get invoice status color class
 */
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  return INVOICE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: Date, status: InvoiceStatus): boolean {
  if (status === 'PAID' || status === 'CANCELLED') return false
  return new Date(dueDate) < new Date()
}

/**
 * Generate variable symbol from invoice number
 */
export function generateVariableSymbol(invoiceNumber: string): string {
  // Remove non-numeric characters and take last 10 digits
  const numeric = invoiceNumber.replace(/\D/g, '')
  return numeric.slice(-10)
}
