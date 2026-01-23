/**
 * Vyfakturuj.cz API Types
 * Based on API Blueprint v3.0
 * @see https://app.vyfakturuj.cz/api/3.0/
 */

// ============================================================================
// CONSTANTS / ENUMS
// ============================================================================

/**
 * Typy dokladů
 */
export const INVOICE_TYPE = {
  FAKTURA: 1,                // Faktura
  ZALOHOVA_FAKTURA: 2,       // Zálohová faktura
  PROFORMA: 4,               // Proforma faktura
  VYZVA_K_PLATBE: 8,         // Výzva k platbě
  DANOVY_DOKLAD: 16,         // Daňový doklad
  OPRAVNY_DANOVY_DOKLAD: 32, // Opravný daňový doklad
  PRIJMOVY_DOKLAD: 64,       // Příjmový doklad
  OPRAVNY_DOKLAD: 128,       // Opravný doklad
  OBJEDNAVKA: 512,           // Objednávka
  NAKLAD: 1024,              // Náklad
  CENOVA_NABIDKA: 2048,      // Cenová nabídka
} as const

export type InvoiceType = (typeof INVOICE_TYPE)[keyof typeof INVOICE_TYPE]

/**
 * Příznaky dokladů (bitové masky)
 */
export const INVOICE_FLAGS = {
  OBSAHUJE_DPH: 1,           // Dokument obsahuje DPH
  UHRAZENO: 2,               // Uhrazeno
  ODESLANO_EMAILEM: 4,       // Odesláno e-mailem zákazníkovi
  STORNOVANO: 8,             // Doklad je stornován
  ODESLANA_UPOMINKA: 16,     // Odeslána upomínka
  PREPLATEK: 32,             // Přeplatek
  NEDOPLATEK: 64,            // Nedoplatek
  STAZENO_UCETNIM: 256,      // Doklad byl stažen účetním
  CEKA_NA_ODESLANI: 1024,    // Čeká na odeslání přepravní společnosti
  ARCHIVOVANO: 4096,         // Archivováno
  V_OSS: 65536,              // Doklad v OSS
  VYZADUJE_POZORNOST: 1048576, // Vyžaduje pozornost
} as const

export type InvoiceFlags = (typeof INVOICE_FLAGS)[keyof typeof INVOICE_FLAGS]

/**
 * Typy platebních metod
 */
export const PAYMENT_TYPE = {
  PREVOD: 1,         // Bankovní převod
  HOTOVOST: 2,       // Hotovost
  DOBIRKA: 4,        // Dobírka
  KARTOU: 8,         // Online kartou
  ZAPOCTEM: 32,      // Zápočtem
  ZRYCHLENY_PREVOD: 64, // Zrychlený převod
  PAYPAL: 128,       // PayPal
  VLASTNI: 256,      // Vlastní
} as const

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE]

/**
 * Poskytovatelé online plateb
 */
export const PAYMENT_PROVIDER = {
  GOPAY: 1,
  THEPAY_1: 2,
  PAYPAL: 4,
  COMGATE: 8,
  STRIPE: 64,
  THEPAY_2: 128,
  GLOBAL_PAYMENTS: 256,
} as const

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER]

/**
 * Typy výpočtu DPH
 */
export const CALCULATE_VAT = {
  ZAKLAD_DANE: 1,           // Položky jsou uvedeny jako základ daně
  KONCOVA_CENA: 2,          // Položky mají koncovou cenu s DPH
  SPECIALNI_REZIM: 3,       // DPH ve speciálním režimu
  PRENESENA_TUZEMSKO: 4,    // Přenesená daňová povinnost v tuzemsku
  NEPLATCE: 5,              // Neplátce DPH
  PRENESENA_ZAHRANICI: 6,   // Přenesená daňová povinnost do zahraničí
} as const

export type CalculateVat = (typeof CALCULATE_VAT)[keyof typeof CALCULATE_VAT]

// ============================================================================
// INVOICE TYPES
// ============================================================================

/**
 * Položka faktury
 */
export interface VyfakturujInvoiceItem {
  quantity: number | string
  unit: string
  text: string
  unit_price: number | string
  vat_rate: number | string
  vat_rate_type?: number
  vat: string
  total: string
  total_without_vat: string
  'domestic-unit_price'?: string
  'domestic-vat'?: string
  'domestic-total'?: string
  'domestic-total_without_vat'?: string
  data?: unknown
  id_cleneniDPH?: number
  id_predkontace?: number
}

/**
 * DPH sazba na faktuře
 */
export interface VyfakturujInvoiceVat {
  vat_rate: number
  base: string
  vat: string
  total: string
}

/**
 * Log záznam faktury
 */
export interface VyfakturujInvoiceLog {
  date: string
  text: string
}

/**
 * Kompletní faktura z API
 */
export interface VyfakturujInvoice {
  // Základní identifikace
  id: number
  id_identity: number
  id_customer: number
  id_number_series: number
  id_payment_method: number
  id_center: number
  id_tag: number
  id_predkontace: number
  id_cleneniDPH: number
  id_coupon: number
  id_parent: number
  type: InvoiceType
  flags: number
  number: string

  // Data
  date_created: string
  date_due: string
  date_taxable_supply: string
  date_paid: string
  date_reminder: string
  date_reminder_2: string
  date_reminder_3: string
  days_due: number

  // Dodavatel (supplier)
  supplier_IC: string
  supplier_DIC: string
  supplier_IDNUM3: string
  supplier_name: string
  supplier_street: string
  supplier_city: string
  supplier_zip: string
  supplier_country_code: string
  supplier_contact_name: string
  supplier_contact_tel: string
  supplier_contact_mail: string
  supplier_contact_web: string

  // Odběratel (customer)
  customer_IC: string
  customer_DIC: string
  customer_IDNUM3: string
  customer_name: string
  customer_firstname: string
  customer_lastname: string
  customer_street: string
  customer_city: string
  customer_zip: string
  customer_country_code: string
  customer_tel: string

  // Doručovací adresa zákazníka
  customer_delivery_company: string
  customer_delivery_firstname: string
  customer_delivery_lastname: string
  customer_delivery_street: string
  customer_delivery_city: string
  customer_delivery_zip: string
  customer_delivery_country_code: string
  customer_delivery_tel: string

  // Bankovní údaje
  bank_account_number: string
  bank_IBAN: string
  bank_BIC: string
  VS: number
  KS: string
  SS: number

  // Nastavení
  calculate_vat: CalculateVat
  round_invoice: number
  order_number: string
  language: string
  currency: string
  currency_domestic: string
  exchange_rate: number
  discount: number

  // Texty
  text_under_subscriber: string
  text_under_customer: string
  text_before_items: string
  text_invoice_footer: string
  note_internal: string

  // Emaily
  mail_to: string[]

  // Položky a ceny
  items: VyfakturujInvoiceItem[]
  vats: VyfakturujInvoiceVat[]
  total: string
  total_without_vat: string
  'domestic-total_without_vat': string
  total_before_discount: string

  // Reverse charge
  foreign_reverse_charge_code: string
  domestic_reverse_charge_code: string

  // Příznaky
  disable_automated_mails: boolean
  storno: boolean
  oss: boolean
  need_attention: boolean
  test_mode: boolean

  // Webhook
  webhook_paid: string

  // Vlastní pole
  X_1: string
  X_2: string
  X_3: string

  // Search string
  search: string

  // URL
  url_public_webpage: string
  url_online_payment: string
  url_download_pdf: string
  url_download_pdf_no_stamp: string
  url_app_detail: string

  // Log
  log: VyfakturujInvoiceLog[]

  // Související dokumenty
  related_documents?: Record<string, VyfakturujInvoice>
}

/**
 * Data pro vytvoření faktury
 */
export interface CreateInvoiceData {
  type?: InvoiceType

  // Zákazník - buď ID z adresáře nebo inline data
  id_customer?: number
  customer_IC?: string
  customer_DIC?: string
  customer_IDNUM3?: string
  customer_name?: string
  customer_firstname?: string
  customer_lastname?: string
  customer_street?: string
  customer_city?: string
  customer_zip?: string
  customer_country_code?: string
  customer_tel?: string
  customer_mail_to?: string

  // Doručovací adresa
  customer_delivery_company?: string
  customer_delivery_firstname?: string
  customer_delivery_lastname?: string
  customer_delivery_street?: string
  customer_delivery_city?: string
  customer_delivery_zip?: string
  customer_delivery_country_code?: string
  customer_delivery_tel?: string

  // Data
  date_created?: string
  date_due?: string
  date_taxable_supply?: string
  days_due?: number

  // Položky (povinné)
  items: Array<{
    quantity: number
    unit?: string
    text: string
    unit_price: number
    vat_rate?: number
  }>

  // Nastavení
  id_payment_method?: number
  id_number_series?: number
  calculate_vat?: CalculateVat
  round_invoice?: number
  currency?: string
  language?: string
  discount?: number

  // Symboly
  VS?: number | string
  KS?: string
  SS?: number | string

  // Texty
  order_number?: string
  text_under_subscriber?: string
  text_under_customer?: string
  text_before_items?: string
  text_invoice_footer?: string
  note_internal?: string

  // Dodavatel (supplier) - volitelné přepsání výchozích hodnot
  supplier_name?: string
  supplier_IC?: string
  supplier_DIC?: string
  supplier_street?: string
  supplier_city?: string
  supplier_zip?: string
  supplier_country_code?: string
  supplier_contact_mail?: string
  supplier_contact_tel?: string
  supplier_contact_web?: string

  // Bankovní údaje
  bank_account_number?: string
  bank_IBAN?: string
  bank_BIC?: string

  // Email
  mail_to?: string[]

  // Vlastní pole
  X_1?: string
  X_2?: string
  X_3?: string

  // Štítky
  id_tag?: number

  // Webhook
  webhook_paid?: string
}

/**
 * Data pro aktualizaci faktury
 */
export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  flags?: number
  date_paid?: string
}

// ============================================================================
// CONTACT TYPES
// ============================================================================

/**
 * Kontakt (adresář) z API
 */
export interface VyfakturujContact {
  id: number
  IC: string
  DIC: string
  IDNUM3: string
  name: string
  note: string
  company: string
  firstname: string
  lastname: string
  street: string
  city: string
  zip: string
  country_code: string

  // Doručovací adresa
  delivery_company: string
  delivery_firstname: string
  delivery_lastname: string
  delivery_street: string
  delivery_city: string
  delivery_zip: string
  delivery_country_code: string
  delivery_tel: string

  // Kontakt
  web: string
  tel: string
  mail_to: string
  mail_cc: string
  mail_bcc: string

  // Nastavení pro faktury
  days_due: number
  text_under_subscriber: string
  text_before_items: string
  text_invoice_footer: string

  // Vlastní pole
  X_1: string
  X_2: string
  X_3: string
}

/**
 * Data pro vytvoření kontaktu
 */
export interface CreateContactData {
  IC?: string
  DIC?: string
  IDNUM3?: string
  name?: string
  note?: string
  company?: string
  firstname?: string
  lastname?: string
  street?: string
  city?: string
  zip?: string
  country_code?: string

  // Doručovací adresa
  delivery_company?: string
  delivery_firstname?: string
  delivery_lastname?: string
  delivery_street?: string
  delivery_city?: string
  delivery_zip?: string
  delivery_country_code?: string
  delivery_tel?: string

  // Kontakt
  web?: string
  tel?: string
  mail_to?: string
  mail_cc?: string
  mail_bcc?: string

  // Nastavení
  days_due?: number
  text_under_subscriber?: string
  text_before_items?: string
  text_invoice_footer?: string
}

/**
 * Data pro aktualizaci kontaktu
 */
export type UpdateContactData = Partial<CreateContactData>

// ============================================================================
// SETTINGS TYPES
// ============================================================================

/**
 * Platební metoda
 */
export interface VyfakturujPaymentMethod {
  id_payment_method: string | number
  flags: string | number
  type: string | number
  provider: string | number
  name: string
}

/**
 * Číselná řada
 */
export interface VyfakturujNumberSeries {
  id_number_series: string | number
  id_number_series_child: string | number
  type: string | number
  name: string
  pattern: string
}

/**
 * Štítek
 */
export interface VyfakturujTag {
  id_tag: number
  name: string
  color: string
}

/**
 * Data pro vytvoření štítku
 */
export interface CreateTagData {
  name: string
  color?: string
}

/**
 * Data pro aktualizaci štítku
 */
export type UpdateTagData = Partial<CreateTagData>

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Chyba z API
 */
export interface VyfakturujError {
  status: 'error'
  code?: number
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

/**
 * Úspěšná odpověď s daty
 */
export interface VyfakturujSuccessResponse<T> {
  status: 'success'
  data: T
}

/**
 * Odpověď pro smazání
 */
export interface VyfakturujDeleteResponse {
  status: 'ok'
  message: 'Deleted'
}

/**
 * Odpověď pro odeslání emailu
 */
export interface VyfakturujSendEmailResponse {
  status: 'ok'
  message: string
}

/**
 * Parametry pro filtrování seznamů
 */
export interface ListParams {
  // Pagination
  rows_limit?: number
  rows_offset?: number

  // Filtering
  type?: InvoiceType
  flags?: number
  id_customer?: number
  id_payment_method?: number
  id_number_series?: number
  id_tag?: number

  // Date filters
  date_created_from?: string
  date_created_to?: string
  date_due_from?: string
  date_due_to?: string
  date_paid_from?: string
  date_paid_to?: string

  // Search
  q?: string
  search?: string

  // Sorting (format: "column~asc|column~desc")
  sort?: string

  // Advanced filter
  filter?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Kontroluje, zda je faktura zaplacená
 */
export function isInvoicePaid(invoice: VyfakturujInvoice): boolean {
  return (invoice.flags & INVOICE_FLAGS.UHRAZENO) !== 0
}

/**
 * Kontroluje, zda je faktura stornovaná
 */
export function isInvoiceCancelled(invoice: VyfakturujInvoice): boolean {
  return (invoice.flags & INVOICE_FLAGS.STORNOVANO) !== 0
}

/**
 * Kontroluje, zda byla faktura odeslána emailem
 */
export function isInvoiceSent(invoice: VyfakturujInvoice): boolean {
  return (invoice.flags & INVOICE_FLAGS.ODESLANO_EMAILEM) !== 0
}

/**
 * Kontroluje, zda faktura vyžaduje pozornost
 */
export function needsAttention(invoice: VyfakturujInvoice): boolean {
  return (invoice.flags & INVOICE_FLAGS.VYZADUJE_POZORNOST) !== 0
}

/**
 * Vrátí název typu faktury
 */
export function getInvoiceTypeName(type: InvoiceType): string {
  const names: Record<InvoiceType, string> = {
    [INVOICE_TYPE.FAKTURA]: 'Faktura',
    [INVOICE_TYPE.ZALOHOVA_FAKTURA]: 'Zálohová faktura',
    [INVOICE_TYPE.PROFORMA]: 'Proforma faktura',
    [INVOICE_TYPE.VYZVA_K_PLATBE]: 'Výzva k platbě',
    [INVOICE_TYPE.DANOVY_DOKLAD]: 'Daňový doklad',
    [INVOICE_TYPE.OPRAVNY_DANOVY_DOKLAD]: 'Opravný daňový doklad',
    [INVOICE_TYPE.PRIJMOVY_DOKLAD]: 'Příjmový doklad',
    [INVOICE_TYPE.OPRAVNY_DOKLAD]: 'Opravný doklad',
    [INVOICE_TYPE.OBJEDNAVKA]: 'Objednávka',
    [INVOICE_TYPE.NAKLAD]: 'Náklad',
    [INVOICE_TYPE.CENOVA_NABIDKA]: 'Cenová nabídka',
  }
  return names[type] || 'Neznámý typ'
}

/**
 * Vrátí název platební metody
 */
export function getPaymentTypeName(type: PaymentType): string {
  const names: Record<PaymentType, string> = {
    [PAYMENT_TYPE.PREVOD]: 'Bankovní převod',
    [PAYMENT_TYPE.HOTOVOST]: 'Hotovost',
    [PAYMENT_TYPE.DOBIRKA]: 'Dobírka',
    [PAYMENT_TYPE.KARTOU]: 'Platba kartou',
    [PAYMENT_TYPE.ZAPOCTEM]: 'Zápočtem',
    [PAYMENT_TYPE.ZRYCHLENY_PREVOD]: 'Zrychlený převod',
    [PAYMENT_TYPE.PAYPAL]: 'PayPal',
    [PAYMENT_TYPE.VLASTNI]: 'Vlastní',
  }
  return names[type] || 'Neznámá metoda'
}

/**
 * Parsuje částku z Vyfakturuj formátu (string s desetinnou čárkou) na number
 */
export function parseVyfakturujAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount
  return parseFloat(amount.replace(',', '.').replace(/\s/g, ''))
}

/**
 * Formátuje částku pro Vyfakturuj API
 */
export function formatVyfakturujAmount(amount: number): string {
  return amount.toFixed(2)
}
