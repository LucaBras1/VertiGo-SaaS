/**
 * Vyfakturuj.cz Migration Service
 *
 * Nástroj pro migraci dat z Vyfakturuj.cz do lokálního fakturačního systému.
 * Provádí export všech faktur a kontaktů a jejich import do nového systému.
 */

import prisma from '@/lib/prisma'
import { getVyfakturujClient, isVyfakturujConfigured } from '@/lib/vyfakturuj'
import type {
  VyfakturujInvoice,
  VyfakturujContact,
  INVOICE_TYPE,
  INVOICE_FLAGS,
} from '@/types/vyfakturuj'
import type { DocumentType, InvoiceStatus } from '@/types/invoicing'

// ============================================================================
// TYPES
// ============================================================================

export interface MigrationResult {
  success: boolean
  message: string
  stats: MigrationStats
  errors: MigrationError[]
}

export interface MigrationStats {
  invoicesTotal: number
  invoicesMigrated: number
  invoicesSkipped: number
  contactsTotal: number
  contactsMigrated: number
  contactsSkipped: number
  errors: number
}

export interface MigrationError {
  type: 'invoice' | 'contact' | 'system'
  id: number | string
  identifier?: string
  error: string
}

export interface MigrationProgress {
  phase: 'idle' | 'contacts' | 'invoices' | 'verification' | 'complete' | 'error'
  current: number
  total: number
  message: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Mapování Vyfakturuj type na DocumentType
const TYPE_MAP: Record<number, DocumentType> = {
  1: 'FAKTURA',
  2: 'ZALOHOVA',
  4: 'PROFORMA',
  8: 'VYZVA_K_PLATBE',
  16: 'DANOVY_DOKLAD',
  32: 'OPRAVNY_DOKLAD',
  64: 'PRIJMOVY_DOKLAD',
  128: 'OPRAVNY_DOKLAD',
  2048: 'CENOVA_NABIDKA',
}

// Vyfakturuj flags
const FLAGS = {
  UHRAZENO: 2,
  ODESLANO_EMAILEM: 4,
  STORNOVANO: 8,
  PREPLATEK: 32,
  NEDOPLATEK: 64,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mapuje Vyfakturuj status flags na InvoiceStatus
 */
function mapStatusFromFlags(flags: number, dueDate: string): InvoiceStatus {
  if (flags & FLAGS.STORNOVANO) return 'CANCELLED'
  if (flags & FLAGS.UHRAZENO) return 'PAID'
  if (flags & FLAGS.NEDOPLATEK) return 'PARTIALLY_PAID'

  // Kontrola splatnosti
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (due < today) return 'OVERDUE'
  if (flags & FLAGS.ODESLANO_EMAILEM) return 'SENT'

  return 'DRAFT'
}

/**
 * Mapuje Vyfakturuj type na DocumentType
 */
function mapDocumentType(type: number): DocumentType {
  return TYPE_MAP[type] || 'FAKTURA'
}

/**
 * Parsuje částku z Vyfakturuj formátu
 */
function parseAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount
  return parseFloat(amount.replace(',', '.').replace(/\s/g, '')) || 0
}

/**
 * Formátuje datum pro Prisma
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '0000-00-00') return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migruje kontakt z Vyfakturuj do lokálního Customer modelu
 */
async function migrateContact(
  contact: VyfakturujContact,
  errors: MigrationError[]
): Promise<boolean> {
  try {
    // Zkontrolovat, zda již existuje zákazník s tímto vyfakturujContactId
    const existing = await prisma.customer.findUnique({
      where: { vyfakturujContactId: contact.id },
    })

    if (existing) {
      // Aktualizovat existujícího zákazníka
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          ico: contact.IC || existing.ico,
          dic: contact.DIC || existing.dic,
          billingStreet: contact.street || existing.billingStreet,
          billingCity: contact.city || existing.billingCity,
          billingZip: contact.zip || existing.billingZip,
          billingCountry: contact.country_code || existing.billingCountry,
          vyfakturujSyncedAt: new Date(),
        },
      })
      return true
    }

    // Zkontrolovat, zda existuje zákazník s tímto IČO nebo emailem
    let customerId: string | null = null

    if (contact.IC) {
      const byIco = await prisma.customer.findFirst({
        where: { ico: contact.IC },
      })
      if (byIco) customerId = byIco.id
    }

    if (!customerId && contact.mail_to) {
      const byEmail = await prisma.customer.findFirst({
        where: { email: contact.mail_to },
      })
      if (byEmail) customerId = byEmail.id
    }

    if (customerId) {
      // Propojit existujícího zákazníka
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          vyfakturujContactId: contact.id,
          ico: contact.IC || undefined,
          dic: contact.DIC || undefined,
          billingStreet: contact.street || undefined,
          billingCity: contact.city || undefined,
          billingZip: contact.zip || undefined,
          billingCountry: contact.country_code || undefined,
          vyfakturujSyncedAt: new Date(),
        },
      })
      return true
    }

    // Vytvořit nového zákazníka
    const firstName = contact.firstname || ''
    const lastName = contact.lastname || ''
    const name = contact.company || contact.name || `${firstName} ${lastName}`.trim()

    await prisma.customer.create({
      data: {
        name: name || 'Neznámý zákazník',
        email: contact.mail_to || `vyfakturuj-${contact.id}@migrated.local`,
        phone: contact.tel || null,
        ico: contact.IC || null,
        dic: contact.DIC || null,
        billingStreet: contact.street || null,
        billingCity: contact.city || null,
        billingZip: contact.zip || null,
        billingCountry: contact.country_code || 'CZ',
        vyfakturujContactId: contact.id,
        vyfakturujSyncedAt: new Date(),
      },
    })

    return true
  } catch (error) {
    errors.push({
      type: 'contact',
      id: contact.id,
      identifier: contact.company || contact.name || contact.mail_to,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    })
    return false
  }
}

/**
 * Migruje fakturu z Vyfakturuj do lokálního Invoice modelu
 */
async function migrateInvoice(
  invoice: VyfakturujInvoice,
  errors: MigrationError[]
): Promise<boolean> {
  try {
    // Zkontrolovat, zda již existuje faktura s tímto vyfakturujId
    const existing = await prisma.invoice.findFirst({
      where: { vyfakturujId: invoice.id },
    })

    if (existing) {
      // Aktualizovat existující fakturu
      await prisma.invoice.update({
        where: { id: existing.id },
        data: {
          status: mapStatusFromFlags(invoice.flags, invoice.date_due),
          paidAmount: (invoice.flags & FLAGS.UHRAZENO)
            ? parseAmount(invoice.total)
            : existing.paidAmount,
          paidAt: parseDate(invoice.date_paid),
          vyfakturujFlags: invoice.flags,
          vyfakturujSyncedAt: new Date(),
        },
      })
      return true
    }

    // Najít zákazníka
    let customerId: string | null = null

    if (invoice.id_customer) {
      const customer = await prisma.customer.findFirst({
        where: { vyfakturujContactId: invoice.id_customer },
      })
      if (customer) customerId = customer.id
    }

    // Pokud zákazník neexistuje, vytvořit ho z dat na faktuře
    if (!customerId) {
      const customerName =
        invoice.customer_name ||
        `${invoice.customer_firstname} ${invoice.customer_lastname}`.trim() ||
        'Neznámý zákazník'

      // Zkusit najít podle IČO
      if (invoice.customer_IC) {
        const byIco = await prisma.customer.findFirst({
          where: { ico: invoice.customer_IC },
        })
        if (byIco) customerId = byIco.id
      }

      // Vytvořit nového zákazníka z dat na faktuře
      if (!customerId) {
        const newCustomer = await prisma.customer.create({
          data: {
            name: customerName,
            email: invoice.mail_to[0] || `invoice-${invoice.id}@migrated.local`,
            phone: invoice.customer_tel || null,
            ico: invoice.customer_IC || null,
            dic: invoice.customer_DIC || null,
            billingStreet: invoice.customer_street || null,
            billingCity: invoice.customer_city || null,
            billingZip: invoice.customer_zip || null,
            billingCountry: invoice.customer_country_code || 'CZ',
            vyfakturujContactId: invoice.id_customer || null,
          },
        })
        customerId = newCustomer.id
      }
    }

    // Připravit položky faktury
    const items = invoice.items.map((item, index) => ({
      position: index,
      description: item.text,
      quantity: parseAmount(item.quantity),
      unit: item.unit || 'ks',
      unitPrice: parseAmount(item.unit_price),
      vatRate: parseAmount(item.vat_rate),
      discount: 0,
      discountType: 'PERCENTAGE' as const,
      totalWithoutVat: parseAmount(item.total_without_vat),
      vatAmount: parseAmount(item.vat),
      totalWithVat: parseAmount(item.total),
    }))

    // Vytvořit fakturu
    const issueDate = parseDate(invoice.date_created)
    const dueDate = parseDate(invoice.date_due)

    await prisma.invoice.create({
      data: {
        invoiceNumber: invoice.number,
        documentType: mapDocumentType(invoice.type),
        status: mapStatusFromFlags(invoice.flags, invoice.date_due),
        customerId: customerId!,
        issueDate: issueDate || new Date(),
        dueDate: dueDate || new Date(),
        taxableSupplyDate: parseDate(invoice.date_taxable_supply),
        currency: invoice.currency || 'CZK',
        paymentMethod: 'BANK_TRANSFER',
        bankAccount: invoice.bank_account_number || null,
        iban: invoice.bank_IBAN || null,
        swift: invoice.bank_BIC || null,
        variableSymbol: invoice.VS?.toString() || null,
        constantSymbol: invoice.KS || null,
        totalWithoutVat: parseAmount(invoice.total_without_vat),
        vatAmount:
          parseAmount(invoice.total) - parseAmount(invoice.total_without_vat),
        totalAmount: parseAmount(invoice.total),
        paidAmount: (invoice.flags & FLAGS.UHRAZENO) ? parseAmount(invoice.total) : 0,
        paidAt: parseDate(invoice.date_paid),
        sentAt: (invoice.flags & FLAGS.ODESLANO_EMAILEM) ? issueDate : null,
        note: invoice.note_internal || null,
        headerText: invoice.text_before_items || null,
        footerText: invoice.text_invoice_footer || null,
        // Snapshot dodavatele
        supplierSnapshot: {
          name: invoice.supplier_name,
          ico: invoice.supplier_IC,
          dic: invoice.supplier_DIC,
          street: invoice.supplier_street,
          city: invoice.supplier_city,
          zip: invoice.supplier_zip,
          country: invoice.supplier_country_code,
          email: invoice.supplier_contact_mail,
          phone: invoice.supplier_contact_tel,
          web: invoice.supplier_contact_web,
        },
        // Snapshot zákazníka
        customerSnapshot: {
          name: invoice.customer_name,
          ico: invoice.customer_IC,
          dic: invoice.customer_DIC,
          street: invoice.customer_street,
          city: invoice.customer_city,
          zip: invoice.customer_zip,
          country: invoice.customer_country_code,
        },
        // Vyfakturuj propojení
        vyfakturujId: invoice.id,
        vyfakturujNumber: invoice.number,
        vyfakturujType: invoice.type,
        vyfakturujFlags: invoice.flags,
        vyfakturujVS: invoice.VS,
        publicUrl: invoice.url_public_webpage || null,
        onlinePaymentUrl: invoice.url_online_payment || null,
        vyfakturujSyncedAt: new Date(),
        vyfakturujRawData: invoice as unknown as Parameters<typeof prisma.invoice.create>[0]['data']['vyfakturujRawData'],
        // Vytvořit položky
        items: {
          create: items,
        },
      },
    })

    return true
  } catch (error) {
    errors.push({
      type: 'invoice',
      id: invoice.id,
      identifier: invoice.number,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    })
    return false
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Provede kompletní migraci z Vyfakturuj.cz
 */
export async function migrateFromVyfakturuj(
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  const errors: MigrationError[] = []
  const stats: MigrationStats = {
    invoicesTotal: 0,
    invoicesMigrated: 0,
    invoicesSkipped: 0,
    contactsTotal: 0,
    contactsMigrated: 0,
    contactsSkipped: 0,
    errors: 0,
  }

  const reportProgress = (progress: MigrationProgress) => {
    if (onProgress) onProgress(progress)
    console.log(`[Migration] ${progress.phase}: ${progress.current}/${progress.total} - ${progress.message}`)
  }

  try {
    // Zkontrolovat, zda je Vyfakturuj nakonfigurován
    const isConfigured = await isVyfakturujConfigured()
    if (!isConfigured) {
      return {
        success: false,
        message: 'Vyfakturuj není nakonfigurován',
        stats,
        errors: [{ type: 'system', id: 0, error: 'Vyfakturuj není nakonfigurován' }],
      }
    }

    const client = await getVyfakturujClient()

    // =========================================================================
    // FÁZE 1: Migrace kontaktů
    // =========================================================================
    reportProgress({
      phase: 'contacts',
      current: 0,
      total: 0,
      message: 'Načítání kontaktů z Vyfakturuj...',
    })

    const contacts = await client.listContacts({ rows_limit: 10000 })
    stats.contactsTotal = contacts.length

    reportProgress({
      phase: 'contacts',
      current: 0,
      total: contacts.length,
      message: `Nalezeno ${contacts.length} kontaktů`,
    })

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]
      const success = await migrateContact(contact, errors)

      if (success) {
        stats.contactsMigrated++
      } else {
        stats.contactsSkipped++
        stats.errors++
      }

      if (i % 10 === 0 || i === contacts.length - 1) {
        reportProgress({
          phase: 'contacts',
          current: i + 1,
          total: contacts.length,
          message: `Migrováno ${stats.contactsMigrated} kontaktů`,
        })
      }
    }

    // =========================================================================
    // FÁZE 2: Migrace faktur
    // =========================================================================
    reportProgress({
      phase: 'invoices',
      current: 0,
      total: 0,
      message: 'Načítání faktur z Vyfakturuj...',
    })

    // Načíst všechny faktury po dávkách
    const allInvoices: VyfakturujInvoice[] = []
    let offset = 0
    const batchSize = 100

    while (true) {
      const batch = await client.listInvoices({
        rows_limit: batchSize,
        rows_offset: offset,
      })

      if (batch.length === 0) break

      allInvoices.push(...batch)
      offset += batchSize

      reportProgress({
        phase: 'invoices',
        current: allInvoices.length,
        total: allInvoices.length,
        message: `Načteno ${allInvoices.length} faktur...`,
      })

      // Bezpečnostní limit
      if (allInvoices.length >= 10000) break
    }

    stats.invoicesTotal = allInvoices.length

    reportProgress({
      phase: 'invoices',
      current: 0,
      total: allInvoices.length,
      message: `Nalezeno ${allInvoices.length} faktur`,
    })

    for (let i = 0; i < allInvoices.length; i++) {
      const invoice = allInvoices[i]
      const success = await migrateInvoice(invoice, errors)

      if (success) {
        stats.invoicesMigrated++
      } else {
        stats.invoicesSkipped++
        stats.errors++
      }

      if (i % 10 === 0 || i === allInvoices.length - 1) {
        reportProgress({
          phase: 'invoices',
          current: i + 1,
          total: allInvoices.length,
          message: `Migrováno ${stats.invoicesMigrated} faktur`,
        })
      }
    }

    // =========================================================================
    // FÁZE 3: Verifikace
    // =========================================================================
    reportProgress({
      phase: 'verification',
      current: 0,
      total: 1,
      message: 'Ověřování migrace...',
    })

    // Spočítat statistiky
    const localInvoiceCount = await prisma.invoice.count({
      where: { vyfakturujId: { not: null } },
    })

    const localCustomerCount = await prisma.customer.count({
      where: { vyfakturujContactId: { not: null } },
    })

    reportProgress({
      phase: 'complete',
      current: 1,
      total: 1,
      message: `Migrace dokončena. Faktury: ${localInvoiceCount}, Zákazníci: ${localCustomerCount}`,
    })

    // Uložit čas migrace
    await prisma.vyfakturujSettings.update({
      where: { id: 'singleton' },
      data: { lastSyncAt: new Date() },
    })

    return {
      success: stats.errors === 0,
      message: `Migrace dokončena. Faktury: ${stats.invoicesMigrated}/${stats.invoicesTotal}, Kontakty: ${stats.contactsMigrated}/${stats.contactsTotal}, Chyby: ${stats.errors}`,
      stats,
      errors,
    }
  } catch (error) {
    reportProgress({
      phase: 'error',
      current: 0,
      total: 0,
      message: error instanceof Error ? error.message : 'Neznámá chyba',
    })

    errors.push({
      type: 'system',
      id: 0,
      error: error instanceof Error ? error.message : 'Neznámá chyba',
    })

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Migrace selhala',
      stats,
      errors,
    }
  }
}

/**
 * Získá stav migrace
 */
export async function getMigrationStatus(): Promise<{
  isConfigured: boolean
  totalInvoices: number
  migratedInvoices: number
  totalCustomers: number
  migratedCustomers: number
  lastMigrationAt: Date | null
}> {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
  })

  const totalInvoices = await prisma.invoice.count()
  const migratedInvoices = await prisma.invoice.count({
    where: { vyfakturujId: { not: null } },
  })

  const totalCustomers = await prisma.customer.count()
  const migratedCustomers = await prisma.customer.count({
    where: { vyfakturujContactId: { not: null } },
  })

  return {
    isConfigured: settings?.isConfigured ?? false,
    totalInvoices,
    migratedInvoices,
    totalCustomers,
    migratedCustomers,
    lastMigrationAt: settings?.lastSyncAt ?? null,
  }
}

/**
 * Ověří integritu migrovaných dat
 */
export async function verifyMigration(): Promise<{
  success: boolean
  issues: string[]
  stats: {
    invoicesWithoutCustomer: number
    duplicateInvoiceNumbers: number
    orphanedItems: number
  }
}> {
  const issues: string[] = []

  // Faktury bez zákazníka
  const invoicesWithoutCustomer = await prisma.invoice.count({
    where: { customerId: { equals: undefined } },
  })
  if (invoicesWithoutCustomer > 0) {
    issues.push(`${invoicesWithoutCustomer} faktur nemá přiřazeného zákazníka`)
  }

  // Duplicitní čísla faktur
  const duplicates = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*) as count FROM (
      SELECT "invoiceNumber" FROM "Invoice"
      GROUP BY "invoiceNumber"
      HAVING COUNT(*) > 1
    ) as dups
  `
  const duplicateInvoiceNumbers = duplicates[0]?.count || 0
  if (duplicateInvoiceNumbers > 0) {
    issues.push(`${duplicateInvoiceNumbers} duplicitních čísel faktur`)
  }

  // Osiřelé položky (bez faktury)
  const orphanedItems = await prisma.invoiceItem.count({
    where: { invoice: { is: null } },
  })
  if (orphanedItems > 0) {
    issues.push(`${orphanedItems} osiřelých položek faktur`)
  }

  return {
    success: issues.length === 0,
    issues,
    stats: {
      invoicesWithoutCustomer,
      duplicateInvoiceNumbers,
      orphanedItems,
    },
  }
}
