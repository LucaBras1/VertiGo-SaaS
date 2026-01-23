/**
 * Customer Sync Service
 *
 * Bidirectional synchronization between local Customer database
 * and Vyfakturuj.cz contacts
 */

import { prisma } from '@/lib/prisma'
import { getVyfakturujClient } from './index'
import type { VyfakturujContact, CreateContactData } from '@/types/vyfakturuj'

// ============================================================================
// TYPES
// ============================================================================

export interface SyncResult {
  success: boolean
  message: string
  stats?: {
    imported: number
    exported: number
    updated: number
    skipped: number
    errors: number
  }
  errors?: SyncError[]
}

export interface SyncError {
  type: 'import' | 'export' | 'update'
  id: string | number
  name?: string
  error: string
}

interface MatchResult {
  customerId: string
  contactId: number
  matchedBy: 'vyfakturuj_id' | 'ico' | 'email' | 'phone' | 'name_city'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract billing info from Prisma JSON field
 */
function extractBillingInfo(billingInfo: unknown): {
  ico?: string
  dic?: string
  companyName?: string
} {
  if (!billingInfo || typeof billingInfo !== 'object') return {}
  const info = billingInfo as Record<string, unknown>
  return {
    ico: typeof info.ico === 'string' ? info.ico : undefined,
    dic: typeof info.dic === 'string' ? info.dic : undefined,
    companyName: typeof info.companyName === 'string' ? info.companyName : undefined,
  }
}

/**
 * Extract address from Prisma JSON field
 */
function extractAddress(address: unknown): {
  street?: string
  city?: string
  postalCode?: string
  country?: string
} {
  if (!address || typeof address !== 'object') return {}
  const addr = address as Record<string, unknown>
  return {
    street: typeof addr.street === 'string' ? addr.street : undefined,
    city: typeof addr.city === 'string' ? addr.city : undefined,
    postalCode: typeof addr.postalCode === 'string' ? addr.postalCode : undefined,
    country: typeof addr.country === 'string' ? addr.country : undefined,
  }
}

/**
 * Convert Vyfakturuj contact to local Customer data
 */
function contactToCustomerData(contact: VyfakturujContact) {
  // Use firstname/lastname if available, otherwise parse from name or company
  let firstName = contact.firstname || ''
  let lastName = contact.lastname || ''

  if (!firstName && !lastName) {
    // Try to split name or company
    const nameSource = contact.name || contact.company || ''
    const nameParts = nameSource.split(' ')
    lastName = nameParts.pop() || ''
    firstName = nameParts.join(' ') || lastName
  }

  return {
    email: contact.mail_to || `vyfakturuj-${contact.id}@placeholder.local`,
    firstName: firstName || 'N/A',
    lastName: lastName || 'N/A',
    phone: contact.tel || null,
    organization: contact.company || contact.name || null,
    organizationType: null,
    address: {
      street: contact.street || undefined,
      city: contact.city || undefined,
      postalCode: contact.zip || undefined,
      country: contact.country_code || 'CZ',
    },
    billingInfo: {
      companyName: contact.company || contact.name || undefined,
      ico: contact.IC || undefined,
      dic: contact.DIC || undefined,
    },
    vyfakturujContactId: contact.id,
    vyfakturujSyncedAt: new Date(),
    source: 'vyfakturuj_import' as const,
  }
}

/**
 * Convert local Customer to Vyfakturuj contact data
 */
function customerToContactData(customer: {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  organization?: string | null
  address?: unknown
  billingInfo?: unknown
}): CreateContactData {
  const billing = extractBillingInfo(customer.billingInfo)
  const address = extractAddress(customer.address)

  return {
    name: customer.organization || `${customer.firstName} ${customer.lastName}`,
    company: customer.organization || undefined,
    firstname: customer.firstName,
    lastname: customer.lastName,
    IC: billing.ico,
    DIC: billing.dic,
    street: address.street,
    city: address.city,
    zip: address.postalCode,
    country_code: address.country || 'CZ',
    mail_to: customer.email,
    tel: customer.phone || undefined,
  }
}

// ============================================================================
// MATCHING FUNCTIONS
// ============================================================================

/**
 * Try to match Vyfakturuj contact with local customer
 * Priority: vyfakturujContactId > IČO > email > phone > name+city
 */
async function findMatchingCustomer(
  contact: VyfakturujContact
): Promise<MatchResult | null> {
  // 1. Match by vyfakturujContactId (already linked)
  const byVyfakturujId = await prisma.customer.findUnique({
    where: { vyfakturujContactId: contact.id },
  })
  if (byVyfakturujId) {
    return {
      customerId: byVyfakturujId.id,
      contactId: contact.id,
      matchedBy: 'vyfakturuj_id',
    }
  }

  // 2. Match by IČO (most reliable for companies)
  if (contact.IC) {
    const customers = await prisma.customer.findMany({
      where: { vyfakturujContactId: null },
    })

    for (const customer of customers) {
      const billing = extractBillingInfo(customer.billingInfo)
      if (billing.ico === contact.IC) {
        return {
          customerId: customer.id,
          contactId: contact.id,
          matchedBy: 'ico',
        }
      }
    }
  }

  // 3. Match by email
  if (contact.mail_to) {
    const byEmail = await prisma.customer.findFirst({
      where: {
        email: contact.mail_to,
        vyfakturujContactId: null,
      },
    })
    if (byEmail) {
      return {
        customerId: byEmail.id,
        contactId: contact.id,
        matchedBy: 'email',
      }
    }
  }

  // 4. Match by phone
  const phone = contact.tel
  if (phone) {
    const normalizedPhone = phone.replace(/\s+/g, '').replace(/^\+420/, '')
    const byPhone = await prisma.customer.findFirst({
      where: {
        phone: { contains: normalizedPhone },
        vyfakturujContactId: null,
      },
    })
    if (byPhone) {
      return {
        customerId: byPhone.id,
        contactId: contact.id,
        matchedBy: 'phone',
      }
    }
  }

  // 5. Match by name + city (least reliable)
  const contactName = contact.company || contact.name
  if (contactName && contact.city) {
    const customers = await prisma.customer.findMany({
      where: {
        organization: { contains: contactName },
        vyfakturujContactId: null,
      },
    })

    for (const customer of customers) {
      const address = extractAddress(customer.address)
      if (address.city?.toLowerCase() === contact.city.toLowerCase()) {
        return {
          customerId: customer.id,
          contactId: contact.id,
          matchedBy: 'name_city',
        }
      }
    }
  }

  return null
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Import all contacts from Vyfakturuj to local database
 */
export async function importAllContactsFromVyfakturuj(): Promise<SyncResult> {
  const errors: SyncError[] = []
  const stats = {
    imported: 0,
    exported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    const client = await getVyfakturujClient()
    const contacts = await client.listContacts({ rows_limit: 1000 })

    for (const contact of contacts) {
      try {
        const match = await findMatchingCustomer(contact)

        if (match) {
          // Update existing customer with Vyfakturuj link
          await prisma.customer.update({
            where: { id: match.customerId },
            data: {
              vyfakturujContactId: contact.id,
              vyfakturujSyncedAt: new Date(),
            },
          })
          stats.updated++
        } else {
          // Check if customer with this email exists
          const existingByEmail = await prisma.customer.findUnique({
            where: { email: contact.mail_to || `vyfakturuj-${contact.id}@placeholder.local` },
          })

          if (existingByEmail) {
            // Link existing customer
            await prisma.customer.update({
              where: { id: existingByEmail.id },
              data: {
                vyfakturujContactId: contact.id,
                vyfakturujSyncedAt: new Date(),
              },
            })
            stats.updated++
          } else {
            // Create new customer
            const customerData = contactToCustomerData(contact)
            await prisma.customer.create({
              data: customerData,
            })
            stats.imported++
          }
        }
      } catch (error) {
        stats.errors++
        errors.push({
          type: 'import',
          id: contact.id,
          name: contact.company || contact.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Update last sync time
    await prisma.vyfakturujSettings.update({
      where: { id: 'singleton' },
      data: { lastSyncAt: new Date() },
    })

    return {
      success: stats.errors === 0,
      message: `Import dokončen. Importováno: ${stats.imported}, aktualizováno: ${stats.updated}, chyb: ${stats.errors}`,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import selhal',
      stats,
      errors,
    }
  }
}

/**
 * Import single contact from Vyfakturuj by ID
 */
export async function importContactById(contactId: number): Promise<SyncResult> {
  try {
    const client = await getVyfakturujClient()
    const contact = await client.getContact(contactId)

    // Check if already linked
    const existing = await prisma.customer.findUnique({
      where: { vyfakturujContactId: contactId },
    })

    if (existing) {
      return {
        success: true,
        message: 'Kontakt je již propojen s lokálním zákazníkem',
        stats: { imported: 0, exported: 0, updated: 0, skipped: 1, errors: 0 },
      }
    }

    // Try to find matching customer
    const match = await findMatchingCustomer(contact)

    if (match) {
      await prisma.customer.update({
        where: { id: match.customerId },
        data: {
          vyfakturujContactId: contact.id,
          vyfakturujSyncedAt: new Date(),
        },
      })

      return {
        success: true,
        message: `Kontakt propojen s existujícím zákazníkem (shoda: ${match.matchedBy})`,
        stats: { imported: 0, exported: 0, updated: 1, skipped: 0, errors: 0 },
      }
    }

    // Create new customer
    const customerData = contactToCustomerData(contact)

    // Check email uniqueness
    const existingByEmail = await prisma.customer.findUnique({
      where: { email: customerData.email },
    })

    if (existingByEmail) {
      await prisma.customer.update({
        where: { id: existingByEmail.id },
        data: {
          vyfakturujContactId: contact.id,
          vyfakturujSyncedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Kontakt propojen s existujícím zákazníkem (shoda emailu)',
        stats: { imported: 0, exported: 0, updated: 1, skipped: 0, errors: 0 },
      }
    }

    await prisma.customer.create({
      data: customerData,
    })

    return {
      success: true,
      message: 'Kontakt importován jako nový zákazník',
      stats: { imported: 1, exported: 0, updated: 0, skipped: 0, errors: 0 },
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import selhal',
    }
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export single customer to Vyfakturuj
 */
export async function exportCustomerToVyfakturuj(customerId: string): Promise<SyncResult> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return {
        success: false,
        message: 'Zákazník nebyl nalezen',
      }
    }

    const client = await getVyfakturujClient()

    if (customer.vyfakturujContactId) {
      // Update existing contact
      const contactData = customerToContactData(customer)
      await client.updateContact(customer.vyfakturujContactId, contactData)

      await prisma.customer.update({
        where: { id: customerId },
        data: { vyfakturujSyncedAt: new Date() },
      })

      return {
        success: true,
        message: 'Kontakt aktualizován ve Vyfakturuj',
        stats: { imported: 0, exported: 0, updated: 1, skipped: 0, errors: 0 },
      }
    } else {
      // Create new contact
      const contactData = customerToContactData(customer)
      const newContact = await client.createContact(contactData)

      await prisma.customer.update({
        where: { id: customerId },
        data: {
          vyfakturujContactId: newContact.id,
          vyfakturujSyncedAt: new Date(),
        },
      })

      return {
        success: true,
        message: 'Zákazník exportován do Vyfakturuj',
        stats: { imported: 0, exported: 1, updated: 0, skipped: 0, errors: 0 },
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Export selhal',
    }
  }
}

/**
 * Export all unlinked customers to Vyfakturuj
 */
export async function exportAllCustomersToVyfakturuj(): Promise<SyncResult> {
  const errors: SyncError[] = []
  const stats = {
    imported: 0,
    exported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    const client = await getVyfakturujClient()

    const customersToExport = await prisma.customer.findMany({
      where: { vyfakturujContactId: null },
    })

    for (const customer of customersToExport) {
      try {
        // Try to find matching contact in Vyfakturuj by email or IČO
        const billing = extractBillingInfo(customer.billingInfo)

        let existingContact: VyfakturujContact | null = null

        if (billing.ico) {
          existingContact = await client.findContactByIco(billing.ico)
        }

        if (!existingContact && customer.email) {
          existingContact = await client.findContactByEmail(customer.email)
        }

        if (existingContact) {
          // Link to existing contact
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              vyfakturujContactId: existingContact.id,
              vyfakturujSyncedAt: new Date(),
            },
          })
          stats.updated++
        } else {
          // Create new contact
          const contactData = customerToContactData(customer)
          const newContact = await client.createContact(contactData)

          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              vyfakturujContactId: newContact.id,
              vyfakturujSyncedAt: new Date(),
            },
          })
          stats.exported++
        }
      } catch (error) {
        stats.errors++
        errors.push({
          type: 'export',
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      success: stats.errors === 0,
      message: `Export dokončen. Exportováno: ${stats.exported}, propojeno: ${stats.updated}, chyb: ${stats.errors}`,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Export selhal',
      stats,
      errors,
    }
  }
}

// ============================================================================
// FULL SYNC
// ============================================================================

/**
 * Full bidirectional sync
 */
export async function fullSync(): Promise<SyncResult> {
  const allErrors: SyncError[] = []
  const totalStats = {
    imported: 0,
    exported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  // First, import from Vyfakturuj
  const importResult = await importAllContactsFromVyfakturuj()
  if (importResult.stats) {
    totalStats.imported += importResult.stats.imported
    totalStats.updated += importResult.stats.updated
    totalStats.errors += importResult.stats.errors
  }
  if (importResult.errors) {
    allErrors.push(...importResult.errors)
  }

  // Then, export to Vyfakturuj
  const exportResult = await exportAllCustomersToVyfakturuj()
  if (exportResult.stats) {
    totalStats.exported += exportResult.stats.exported
    totalStats.updated += exportResult.stats.updated
    totalStats.errors += exportResult.stats.errors
  }
  if (exportResult.errors) {
    allErrors.push(...exportResult.errors)
  }

  return {
    success: totalStats.errors === 0,
    message: `Synchronizace dokončena. Importováno: ${totalStats.imported}, exportováno: ${totalStats.exported}, aktualizováno: ${totalStats.updated}, chyb: ${totalStats.errors}`,
    stats: totalStats,
    errors: allErrors.length > 0 ? allErrors : undefined,
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  isConfigured: boolean
  lastSyncAt: Date | null
  linkedCustomers: number
  unlinkedCustomers: number
}> {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
  })

  const linkedCount = await prisma.customer.count({
    where: { vyfakturujContactId: { not: null } },
  })

  const unlinkedCount = await prisma.customer.count({
    where: { vyfakturujContactId: null },
  })

  return {
    isConfigured: settings?.isConfigured ?? false,
    lastSyncAt: settings?.lastSyncAt ?? null,
    linkedCustomers: linkedCount,
    unlinkedCustomers: unlinkedCount,
  }
}
