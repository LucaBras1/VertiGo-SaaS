/**
 * Import Library
 *
 * Main export file for CSV import functionality
 */

// CSV Parser
export {
  parseCSV,
  parseCSVFile,
  detectDelimiter,
  detectEncoding,
  getPreview,
  analyzeColumns,
  validateCSVStructure,
  type ParsedCSV,
  type ParseOptions,
  type ColumnStats,
  type ValidationResult as CSVValidationResult,
} from './csv-parser'

// Transformers
export {
  parseDate,
  normalizePhone,
  normalizeICO,
  normalizeDIC,
  parsePrice,
  parseMinutes,
  parseGPS,
  splitName,
  slugify,
  toTiptapJSON,
  parseTime,
  parseSize,
  normalizePSC,
  normalizeEmail,
  generatePlaceholderEmail,
  cleanString,
  mapOrganizationType,
  mapPaymentMethod,
} from './transformers'

// Validators
export {
  validateData,
  getValidationRules,
  findDuplicates,
  generateValidationSummary,
  customerValidationRules,
  customerCompanyValidationRules,
  invoiceValidationRules,
  orderValidationRules,
  performanceValidationRules,
  gameValidationRules,
  type ValidationRule,
  type ValidationError,
  type ValidationResult,
} from './validators'

// Customer Mapper
import {
  mapCompanyToCustomer as _mapCompanyToCustomer,
  mapPersonToCustomer as _mapPersonToCustomer,
  suggestColumnMapping as _suggestCustomerColumnMapping,
  companyColumnMapping as _companyColumnMapping,
  personColumnMapping as _personColumnMapping,
  customerTargetFields as _customerTargetFields,
} from './mappers/customer.mapper'
export {
  _mapCompanyToCustomer as mapCompanyToCustomer,
  _mapPersonToCustomer as mapPersonToCustomer,
  _suggestCustomerColumnMapping as suggestCustomerColumnMapping,
  _companyColumnMapping as companyColumnMapping,
  _personColumnMapping as personColumnMapping,
  _customerTargetFields as customerTargetFields,
}
export type { CustomerImportData, MappedCustomer } from './mappers/customer.mapper'

// Invoice Mapper
import {
  mapToInvoice as _mapToInvoice,
  suggestColumnMapping as _suggestInvoiceColumnMapping,
  invoiceColumnMapping as _invoiceColumnMapping,
  invoiceTargetFields as _invoiceTargetFields,
} from './mappers/invoice.mapper'
export {
  _mapToInvoice as mapToInvoice,
  _suggestInvoiceColumnMapping as suggestInvoiceColumnMapping,
  _invoiceColumnMapping as invoiceColumnMapping,
  _invoiceTargetFields as invoiceTargetFields,
}
export type { InvoiceImportData, MappedInvoice } from './mappers/invoice.mapper'

// Order Mapper
import {
  mapToOrder as _mapToOrder,
  suggestColumnMapping as _suggestOrderColumnMapping,
  orderColumnMapping as _orderColumnMapping,
  orderTargetFields as _orderTargetFields,
} from './mappers/order.mapper'
export {
  _mapToOrder as mapToOrder,
  _suggestOrderColumnMapping as suggestOrderColumnMapping,
  _orderColumnMapping as orderColumnMapping,
  _orderTargetFields as orderTargetFields,
}
export type { OrderImportData, MappedOrder } from './mappers/order.mapper'

// Performance Mapper
import {
  mapToPerformance as _mapToPerformance,
  suggestColumnMapping as _suggestPerformanceColumnMapping,
  performanceColumnMapping as _performanceColumnMapping,
  performanceTargetFields as _performanceTargetFields,
} from './mappers/performance.mapper'
export {
  _mapToPerformance as mapToPerformance,
  _suggestPerformanceColumnMapping as suggestPerformanceColumnMapping,
  _performanceColumnMapping as performanceColumnMapping,
  _performanceTargetFields as performanceTargetFields,
}
export type { PerformanceImportData, MappedPerformance } from './mappers/performance.mapper'

// Game Mapper
import {
  mapToGame as _mapToGame,
  suggestColumnMapping as _suggestGameColumnMapping,
  gameColumnMapping as _gameColumnMapping,
  gameTargetFields as _gameTargetFields,
} from './mappers/game.mapper'
export {
  _mapToGame as mapToGame,
  _suggestGameColumnMapping as suggestGameColumnMapping,
  _gameColumnMapping as gameColumnMapping,
  _gameTargetFields as gameTargetFields,
}
export type { GameImportData, MappedGame } from './mappers/game.mapper'

// Import types
export type ImportEntityType =
  | 'customer_company'
  | 'customer_person'
  | 'invoice'
  | 'order'
  | 'performance'
  | 'game'

export interface ImportConfig {
  entityType: ImportEntityType
  label: string
  description: string
  icon: string
  requiredFields: string[]
  targetFields: { value: string; label: string; required: boolean }[]
  defaultMapping: Record<string, string>
  suggestMapping: (headers: string[]) => Record<string, string>
}

/**
 * Import configurations for each entity type
 */
export const importConfigs: Record<ImportEntityType, ImportConfig> = {
  customer_company: {
    entityType: 'customer_company',
    label: 'Zákazníci - Firmy',
    description: 'Import firem a organizací s IČO, DIČ a kontaktními údaji',
    icon: 'Building2',
    requiredFields: ['organization'],
    targetFields: _customerTargetFields,
    defaultMapping: _companyColumnMapping,
    suggestMapping: (headers) => _suggestCustomerColumnMapping(headers, 'company'),
  },
  customer_person: {
    entityType: 'customer_person',
    label: 'Zákazníci - Osoby',
    description: 'Import fyzických osob s kontaktními údaji',
    icon: 'User',
    requiredFields: ['firstName', 'lastName'],
    targetFields: _customerTargetFields,
    defaultMapping: _personColumnMapping,
    suggestMapping: (headers) => _suggestCustomerColumnMapping(headers, 'person'),
  },
  invoice: {
    entityType: 'invoice',
    label: 'Faktury',
    description: 'Import historických faktur',
    icon: 'FileText',
    requiredFields: ['invoiceNumber', 'customerRef', 'issueDate'],
    targetFields: _invoiceTargetFields,
    defaultMapping: _invoiceColumnMapping,
    suggestMapping: _suggestInvoiceColumnMapping,
  },
  order: {
    entityType: 'order',
    label: 'Akce / Objednávky',
    description: 'Import historických akcí a objednávek',
    icon: 'Calendar',
    requiredFields: ['eventDate', 'customerRef'],
    targetFields: _orderTargetFields,
    defaultMapping: _orderColumnMapping,
    suggestMapping: _suggestOrderColumnMapping,
  },
  performance: {
    entityType: 'performance',
    label: 'Představení',
    description: 'Import divadelních představení',
    icon: 'Theater',
    requiredFields: ['title'],
    targetFields: _performanceTargetFields,
    defaultMapping: _performanceColumnMapping,
    suggestMapping: _suggestPerformanceColumnMapping,
  },
  game: {
    entityType: 'game',
    label: 'Hry',
    description: 'Import her a doprovodného programu',
    icon: 'Gamepad2',
    requiredFields: ['title'],
    targetFields: _gameTargetFields,
    defaultMapping: _gameColumnMapping,
    suggestMapping: _suggestGameColumnMapping,
  },
}

/**
 * Get import config by entity type
 */
export function getImportConfig(entityType: ImportEntityType): ImportConfig {
  return importConfigs[entityType]
}

/**
 * Get all import configs as array
 */
export function getAllImportConfigs(): ImportConfig[] {
  return Object.values(importConfigs)
}
