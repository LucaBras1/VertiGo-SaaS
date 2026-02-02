import { Document, Page, Text, View } from '@react-pdf/renderer'
import { invoiceStyles as styles } from './invoice-styles'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface CustomerInfo {
  name: string
  address?: string
  email?: string
  ico?: string
  dic?: string
  phone?: string
}

interface TenantInfo {
  name: string
  address?: string
  ico?: string
  dic?: string
  email?: string
  phone?: string
  website?: string
  bankAccount?: string
  iban?: string
  swift?: string
}

interface PartyDetails {
  date?: string
  childName?: string // Already redacted (e.g., "E***a")
  theme?: string
  packageName?: string
}

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  customer: CustomerInfo
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  bankAccount?: string
  variableSymbol?: string
  tenant: TenantInfo
  party?: PartyDetails
}

function formatCzechCurrency(amount: number): string {
  const czk = amount / 100
  return `${czk.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kc`
}

function formatCzechDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with company info and invoice details */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>{data.tenant.name}</Text>
            {data.tenant.address && <Text style={styles.text}>{data.tenant.address}</Text>}
            {data.tenant.ico && <Text style={styles.text}>ICO: {data.tenant.ico}</Text>}
            {data.tenant.dic && <Text style={styles.text}>DIC: {data.tenant.dic}</Text>}
            {data.tenant.email && <Text style={styles.text}>{data.tenant.email}</Text>}
            {data.tenant.phone && <Text style={styles.text}>{data.tenant.phone}</Text>}
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>Faktura c. {data.invoiceNumber}</Text>
            <Text style={styles.text}>Datum vystaveni: {formatCzechDate(data.issueDate)}</Text>
            <Text style={styles.text}>Datum splatnosti: {formatCzechDate(data.dueDate)}</Text>
            {data.variableSymbol && (
              <Text style={styles.textBold}>Variabilni symbol: {data.variableSymbol}</Text>
            )}
          </View>
        </View>

        {/* Customer section */}
        <View style={styles.customerSection}>
          <Text style={styles.customerTitle}>Odberatel</Text>
          <Text style={styles.textBold}>{data.customer.name}</Text>
          {data.customer.address && <Text style={styles.text}>{data.customer.address}</Text>}
          {data.customer.ico && <Text style={styles.text}>ICO: {data.customer.ico}</Text>}
          {data.customer.dic && <Text style={styles.text}>DIC: {data.customer.dic}</Text>}
          {data.customer.email && <Text style={styles.text}>{data.customer.email}</Text>}
          {data.customer.phone && <Text style={styles.text}>{data.customer.phone}</Text>}
        </View>

        {/* Party details section */}
        {data.party && (
          <View style={styles.partySection}>
            <Text style={styles.partyTitle}>Detaily oslavy</Text>
            {data.party.date && (
              <Text style={styles.partyText}>Datum: {formatCzechDate(data.party.date)}</Text>
            )}
            {data.party.childName && (
              <Text style={styles.partyText}>Oslavenec: {data.party.childName}</Text>
            )}
            {data.party.theme && (
              <Text style={styles.partyText}>Tema: {data.party.theme}</Text>
            )}
            {data.party.packageName && (
              <Text style={styles.partyText}>Balicek: {data.party.packageName}</Text>
            )}
          </View>
        )}

        {/* Items table */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableColDescriptionHeader}>Popis</Text>
            <Text style={styles.tableColQuantityHeader}>Mnozstvi</Text>
            <Text style={styles.tableColPriceHeader}>Jedn. cena</Text>
            <Text style={styles.tableColTotalHeader}>Celkem</Text>
          </View>

          {/* Table rows */}
          {data.items.map((item, index) => (
            <View
              key={index}
              style={index === data.items.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              <Text style={styles.tableColDescription}>{item.description}</Text>
              <Text style={styles.tableColQuantity}>{item.quantity}</Text>
              <Text style={styles.tableColPrice}>{formatCzechCurrency(item.unitPrice)}</Text>
              <Text style={styles.tableColTotal}>{formatCzechCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Mezisoucet:</Text>
            <Text style={styles.totalValue}>{formatCzechCurrency(data.subtotal)}</Text>
          </View>

          {data.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>DPH ({data.taxRate}%):</Text>
              <Text style={styles.totalValue}>{formatCzechCurrency(data.taxAmount)}</Text>
            </View>
          )}

          <View style={styles.totalRowBorder}>
            <Text style={styles.totalLabelFinal}>Celkem k uhrade:</Text>
            <Text style={styles.totalValueFinal}>{formatCzechCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Bank details */}
        {(data.bankAccount || data.tenant.bankAccount) && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Platebni udaje</Text>
            {(data.bankAccount || data.tenant.bankAccount) && (
              <Text style={styles.bankText}>
                Cislo uctu: {data.bankAccount || data.tenant.bankAccount}
              </Text>
            )}
            {data.tenant.iban && (
              <Text style={styles.bankText}>IBAN: {data.tenant.iban}</Text>
            )}
            {data.tenant.swift && (
              <Text style={styles.bankText}>SWIFT/BIC: {data.tenant.swift}</Text>
            )}
            {data.variableSymbol && (
              <Text style={styles.bankText}>Variabilni symbol: {data.variableSymbol}</Text>
            )}
            <Text style={styles.bankText}>
              Splatnost: {formatCzechDate(data.dueDate)}
            </Text>
          </View>
        )}

        {/* Notes section */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Poznamky</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerTextBold}>{data.tenant.name}</Text>
            {data.tenant.email && <Text style={styles.footerText}>{data.tenant.email}</Text>}
            {data.tenant.website && <Text style={styles.footerText}>{data.tenant.website}</Text>}
          </View>
          <View style={{ textAlign: 'right' }}>
            {data.tenant.ico && <Text style={styles.footerText}>ICO: {data.tenant.ico}</Text>}
            {data.tenant.dic && <Text style={styles.footerText}>DIC: {data.tenant.dic}</Text>}
            {data.tenant.phone && <Text style={styles.footerText}>{data.tenant.phone}</Text>}
          </View>
        </View>
      </Page>
    </Document>
  )
}
