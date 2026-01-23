# Plán integrace Vyfakturuj.cz API do administrace Divadlo Studna

## Přehled

Tento dokument popisuje kompletní plán integrace fakturačního systému Vyfakturuj.cz s administrační částí webu Divadlo Studna. Integrace umožní automatizovanou fakturaci, synchronizaci zákazníků a sledování plateb.

---

## 1. Analýza současného stavu

### 1.1 Stávající admin moduly
- **Zákazníci (Customers)**: Lokální databáze zákazníků s IČO, DIČ, adresami
- **Objednávky (Orders)**: Správa objednávek představení, her a služeb
- **Faktury (Invoices)**: Lokální evidence faktur (aktuálně bez externího systému)
- **Komunikace**: Historie emailů a poznámek

### 1.2 Vyfakturuj.cz API funkcionality
- **Faktury**: CRUD operace, různé typy dokladů (faktura, zálohová, proforma, dobropis)
- **Adresář (Contacts)**: CRUD operace na zákaznících
- **Šablony**: Pravidelné faktury
- **Nastavení**: Platební metody, číselné řady, štítky
- **Webhooky**: Notifikace při platbách

---

## 2. Architektura integrace

### 2.1 Hybridní model (Single Source of Truth v Vyfakturuj.cz)
```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│  Zákazníci  │  Objednávky  │  Faktury  │  Statistiky            │
└──────┬──────┴──────┬───────┴─────┬─────┴────────┬───────────────┘
       │             │             │              │
       ▼             ▼             ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ VyfakturujAPI│  │CustomerSync  │  │InvoiceSync   │           │
│  │    Client    │  │   Service    │  │  Service     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  VYFAKTURUJ.CZ API     │       LOKÁLNÍ DB (Prisma/SQLite)       │
│  - Faktury (master)    │       - Zákazníci (master)             │
│  - Zákazníci (sync)    │       - Objednávky                     │
│  - Platební metody     │       - vyfakturujId (reference)       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Klíčová rozhodnutí
1. **Zákazníci**: **Obousměrná synchronizace** - lokální DB i Vyfakturuj jsou propojeny
   - Import existujících kontaktů z Vyfakturuj do lokální DB
   - Automatický export nových zákazníků do Vyfakturuj při vytvoření v admin panelu
   - Aktualizace údajů v obou směrech
2. **Faktury**: Master data ve Vyfakturuj.cz, lokální DB uchovává reference (`vyfakturujId`)
3. **Platby**: Sledovány přes webhooky z Vyfakturuj.cz
4. **PDF**: Generované přímo z Vyfakturuj.cz (žádná duplikace)

---

## 3. Databázové změny

### 3.1 Rozšíření modelu Customer
```prisma
model Customer {
  // Stávající pole...

  // Nová pole pro Vyfakturuj integraci
  vyfakturujContactId  Int?     @unique  // ID kontaktu ve Vyfakturuj
  vyfakturujSyncedAt   DateTime?          // Poslední synchronizace
  ico                  String?            // IČO (již v billingInfo, ale explicitně)
  dic                  String?            // DIČ
}
```

### 3.2 Rozšíření modelu Invoice
```prisma
model Invoice {
  // Stávající pole...

  // Nová pole pro Vyfakturuj integraci
  vyfakturujId         Int?     @unique  // ID faktury ve Vyfakturuj
  vyfakturujNumber     String?           // Číslo faktury z Vyfakturuj (FA250001)
  vyfakturujType       Int?              // Typ dokladu (1=faktura, 2=zálohová, 4=proforma, atd.)
  vyfakturujFlags      Int?              // Příznaky (1=DPH, 2=uhrazeno, atd.)
  vyfakturujVS         Int?              // Variabilní symbol

  // URL z Vyfakturuj
  publicUrl            String?           // URL veřejné stránky faktury
  pdfUrl               String?           // URL pro stažení PDF
  onlinePaymentUrl     String?           // URL pro online platbu

  // Platební údaje
  paymentMethod        String?           // Platební metoda
  bankAccount          String?           // Číslo účtu
  iban                 String?           // IBAN

  // Synchronizace
  vyfakturujSyncedAt   DateTime?         // Poslední synchronizace
  vyfakturujRawData    Json?             // Surová data z API (pro debugging)
}
```

### 3.3 Nový model pro nastavení integrace
```prisma
model VyfakturujSettings {
  id                   String   @id @default("singleton")

  // Konfigurace
  apiEmail             String?           // API login email
  apiKeyEncrypted      String?           // Šifrovaný API klíč
  defaultPaymentMethod Int?              // ID výchozí platební metody
  defaultNumberSeries  Int?              // ID výchozí číselné řady
  defaultDaysDue       Int     @default(14) // Výchozí splatnost

  // Supplier info (dodavatel = divadlo)
  supplierName         String?
  supplierIco          String?
  supplierDic          String?
  supplierStreet       String?
  supplierCity         String?
  supplierZip          String?
  supplierCountry      String? @default("CZ")
  supplierEmail        String?
  supplierPhone        String?
  supplierWeb          String?
  supplierBankAccount  String?
  supplierIban         String?
  supplierBic          String?

  // Šablony textů
  textUnderSupplier    String?           // Text pod dodavatelem
  textInvoiceFooter    String?           // Patička faktury

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

---

## 4. Implementační komponenty

### 4.1 API Client (`src/lib/vyfakturuj/client.ts`)
```typescript
// Hlavní API klient s metodami:
class VyfakturujClient {
  // Test spojení
  test(): Promise<TestResponse>

  // Faktury
  createInvoice(data: CreateInvoiceData): Promise<Invoice>
  getInvoice(id: number): Promise<Invoice>
  updateInvoice(id: number, data: UpdateInvoiceData): Promise<Invoice>
  deleteInvoice(id: number): Promise<void>
  listInvoices(params: ListParams): Promise<Invoice[]>
  setInvoicePaid(id: number, date: string, amount: number): Promise<Invoice>
  sendInvoiceEmail(id: number, emails: string[]): Promise<void>

  // Kontakty (zákazníci)
  createContact(data: CreateContactData): Promise<Contact>
  getContact(id: number): Promise<Contact>
  updateContact(id: number, data: UpdateContactData): Promise<Contact>
  deleteContact(id: number): Promise<void>
  listContacts(params: ListParams): Promise<Contact[]>

  // Nastavení
  getPaymentMethods(): Promise<PaymentMethod[]>
  getNumberSeries(): Promise<NumberSeries[]>
  getTags(): Promise<Tag[]>
}
```

### 4.2 Synchronizační služby

#### CustomerSyncService (`src/lib/vyfakturuj/services/customer-sync.ts`)
```typescript
class CustomerSyncService {
  // ===== EXPORT: Lokální DB → Vyfakturuj =====

  // Automaticky voláno při vytvoření zákazníka v admin panelu
  // Vytvoří kontakt ve Vyfakturuj a uloží vyfakturujContactId
  exportCustomerToVyfakturuj(customerId: string): Promise<number>

  // Aktualizace existujícího zákazníka ve Vyfakturuj
  updateCustomerInVyfakturuj(customerId: string): Promise<void>

  // Smazání zákazníka z Vyfakturuj (volitelné, závisí na business pravidlech)
  deleteCustomerFromVyfakturuj(customerId: string): Promise<void>

  // ===== IMPORT: Vyfakturuj → Lokální DB =====

  // Import všech kontaktů z Vyfakturuj do lokální DB
  // Používá se při úvodní synchronizaci nebo periodicky
  importAllContactsFromVyfakturuj(): Promise<ImportResult>

  // Import jednoho kontaktu z Vyfakturuj (podle ID)
  importContactFromVyfakturuj(vyfakturujContactId: number): Promise<Customer>

  // Inkrementální synchronizace - pouze změněné kontakty od posledního syncu
  syncChangedContacts(since: Date): Promise<SyncResult>

  // ===== OBOUSMĚRNÁ SYNCHRONIZACE =====

  // Párování existujících zákazníků podle IČO/emailu
  // Najde shody mezi lokální DB a Vyfakturuj a propojí je
  matchAndLinkContacts(): Promise<MatchResult>

  // Řešení konfliktů - který zdroj má přednost při rozdílech
  resolveConflict(customerId: string, strategy: 'local' | 'vyfakturuj' | 'merge'): Promise<Customer>

  // Hromadná synchronizace obou směrů
  fullBidirectionalSync(): Promise<FullSyncResult>
}

// Typy pro výsledky synchronizace
interface ImportResult {
  imported: number      // Počet nově importovaných
  updated: number       // Počet aktualizovaných
  skipped: number       // Počet přeskočených (již existují)
  errors: SyncError[]   // Chyby při importu
}

interface MatchResult {
  matched: number           // Počet spárovaných
  unmatched_local: number   // Lokální bez páru ve Vyfakturuj
  unmatched_vf: number      // Ve Vyfakturuj bez páru v lokální DB
  conflicts: ConflictInfo[] // Konflikty (rozdílná data)
}

interface FullSyncResult {
  exported: ImportResult    // Export do Vyfakturuj
  imported: ImportResult    // Import z Vyfakturuj
  matched: MatchResult      // Párování
  duration: number          // Délka synchronizace v ms
}
```

#### InvoiceSyncService (`src/lib/vyfakturuj/services/invoice-sync.ts`)
```typescript
class InvoiceSyncService {
  // Vytvoření faktury ve Vyfakturuj z objednávky
  createInvoiceFromOrder(orderId: string, options: InvoiceOptions): Promise<Invoice>

  // Synchronizace stavu faktury z Vyfakturuj
  syncInvoiceStatus(invoiceId: string): Promise<void>

  // Hromadná synchronizace stavů
  syncAllInvoiceStatuses(): Promise<SyncResult>

  // Storno faktury
  cancelInvoice(invoiceId: string): Promise<void>

  // Vytvoření dobropisu
  createCreditNote(invoiceId: string): Promise<Invoice>
}
```

### 4.3 Webhook handler (`src/app/api/webhooks/vyfakturuj/route.ts`)
```typescript
// Endpoint pro příjem webhooků z Vyfakturuj
// POST /api/webhooks/vyfakturuj

// Zpracovávané události:
// - Úhrada faktury (aktualizace status na 'paid')
// - Změna faktury
```

---

## 5. Integrační body v administraci

### 5.1 Objednávky → Faktury
**Umístění**: Detail objednávky (`/admin/orders/[id]`)

**Nová funkcionalita**:
- Tlačítko "Vystavit fakturu" - vytvoří fakturu ve Vyfakturuj z dat objednávky
- Možnost vybrat typ dokladu (faktura, zálohová faktura, proforma)
- Automatické mapování položek objednávky na položky faktury
- Odkaz na vystavenou fakturu

**UI komponenta**: `CreateInvoiceButton`

### 5.2 Zákazníci → Obousměrná synchronizace
**Umístění**: Detail zákazníka (`/admin/customers/[id]`)

**Nová funkcionalita**:
- Indikátor synchronizace s Vyfakturuj (ikona/badge)
- Zobrazení ID ve Vyfakturuj
- Historie faktur zákazníka (z Vyfakturuj)
- Tlačítko "Synchronizovat" s možností výběru směru

**Automatická synchronizace při vytvoření zákazníka**:
- Při vytvoření nového zákazníka v admin panelu se automaticky vytvoří kontakt ve Vyfakturuj
- Uloží se `vyfakturujContactId` pro budoucí propojení

**Umístění**: Seznam zákazníků (`/admin/customers`)

**Nová funkcionalita**:
- Tlačítko "Import z Vyfakturuj" - načte všechny kontakty z Vyfakturuj
- Tlačítko "Synchronizovat vše" - obousměrná synchronizace
- Filtr "Synchronizováno / Nesynchronizováno"
- Indikátor stavu synchronizace u každého zákazníka

**Umístění**: Nastavení (`/admin/settings/vyfakturuj`)

**Nová funkcionalita pro sync**:
- Sekce "Synchronizace zákazníků"
- Tlačítko "Úvodní import z Vyfakturuj" (jednorázově načte všechny existující kontakty)
- Tlačítko "Spárovat existující zákazníky" (propojí zákazníky podle IČO/email)
- Nastavení automatické synchronizace (zapnout/vypnout)
- Log posledních synchronizací

### 5.3 Faktury - rozšíření stránky
**Umístění**: Seznam faktur (`/admin/invoices`)

**Nová funkcionalita**:
- Zobrazení faktury z Vyfakturuj (číslo, stav, částka)
- Filtrování podle stavu platby (uhrazeno/neuhrazeno)
- Odkaz na PDF faktury
- Odkaz na online platbu
- Odeslání faktury emailem

**Detail faktury**:
- Zobrazení kompletních dat z Vyfakturuj
- Akce: Odeslat email, Stáhnout PDF, Označit jako uhrazeno
- Historie faktury (log z Vyfakturuj)

### 5.4 Nastavení Vyfakturuj
**Umístění**: Nastavení (`/admin/settings/vyfakturuj`)

**Funkcionalita**:
- Konfigurace API přístupu (email, API klíč)
- Test spojení
- Výběr výchozí platební metody
- Výběr výchozí číselné řady
- Nastavení splatnosti
- Údaje dodavatele (divadla)
- Texty na fakturách

---

## 6. Workflow automatizace

### 6.1 Workflow: Nová objednávka → Faktura
```
1. Zákazník vyplní objednávkový formulář
2. Vytvoří se objednávka v systému (status: new)
3. Admin zpracuje objednávku, vytvoří cenovou nabídku
4. Po potvrzení zákazníkem (status: confirmed):
   - Admin klikne "Vystavit fakturu"
   - Systém zkontroluje/vytvoří zákazníka ve Vyfakturuj
   - Systém vytvoří fakturu ve Vyfakturuj
   - Faktura se uloží do lokální DB s referencí
5. Faktura je automaticky/manuálně odeslána zákazníkovi
6. Webhook informuje o úhradě
7. Stav objednávky se aktualizuje na "completed"
```

### 6.2 Workflow: Zálohová faktura → Daňový doklad
```
1. Pro objednávky nad určitou částku se vystaví zálohová faktura
2. Po úhradě zálohy Vyfakturuj automaticky vytvoří daňový doklad
3. Systém synchronizuje nový doklad do lokální DB
```

### 6.3 Workflow: Storno/Dobropis
```
1. Při zrušení objednávky (status: cancelled):
   - Pokud faktura nebyla uhrazena: storno faktury
   - Pokud faktura byla uhrazena: vytvoření dobropisu
2. Systém aktualizuje lokální záznamy
```

---

## 7. Mapování dat

### 7.1 Customer → Vyfakturuj Contact (EXPORT)
```typescript
// Mapování lokálního zákazníka na Vyfakturuj kontakt
const mapCustomerToVyfakturujContact = (customer: Customer): CreateContactData => ({
  IC: customer.billingInfo?.ico || '',
  DIC: customer.billingInfo?.dic || '',
  name: customer.organization || `${customer.firstName} ${customer.lastName}`,
  company: customer.organization || '',
  firstname: customer.firstName,
  lastname: customer.lastName,
  street: customer.billingInfo?.billingAddress?.street || customer.address?.street || '',
  city: customer.billingInfo?.billingAddress?.city || customer.address?.city || '',
  zip: customer.billingInfo?.billingAddress?.postalCode || customer.address?.postalCode || '',
  country_code: 'CZ',
  tel: customer.phone || '',
  mail_to: customer.email,
  // Poznámka pro identifikaci v CRM
  note: `Divadlo Studna CRM ID: ${customer._id}`,
})
```

### 7.2 Vyfakturuj Contact → Customer (IMPORT)
```typescript
// Mapování Vyfakturuj kontaktu na lokálního zákazníka
const mapVyfakturujContactToCustomer = (contact: VyfakturujContact): Prisma.CustomerCreateInput => ({
  // Základní údaje
  firstName: contact.firstname || '',
  lastName: contact.lastname || '',
  email: contact.mail_to || '',
  phone: contact.tel || '',
  organization: contact.company || contact.name || '',

  // Typ organizace - pokusíme se odhadnout z názvu
  organizationType: guessOrganizationType(contact.company || contact.name),

  // Adresa
  address: {
    street: contact.street || '',
    city: contact.city || '',
    postalCode: contact.zip || '',
    country: contact.country_code || 'CZ',
  },

  // Fakturační údaje
  billingInfo: {
    ico: contact.IC || '',
    dic: contact.DIC || '',
    billingAddress: {
      street: contact.street || '',
      city: contact.city || '',
      postalCode: contact.zip || '',
      country: contact.country_code || 'CZ',
    },
  },

  // Doručovací adresa (pokud je zadána)
  ...(contact.delivery_street && {
    deliveryAddress: {
      street: contact.delivery_street,
      city: contact.delivery_city || '',
      postalCode: contact.delivery_zip || '',
      country: contact.delivery_country_code || 'CZ',
    },
  }),

  // Vyfakturuj reference
  vyfakturujContactId: contact.id,
  vyfakturujSyncedAt: new Date(),

  // Metadata
  source: 'vyfakturuj_import',
  notes: contact.note || '',
})

// Pomocná funkce pro odhad typu organizace z názvu
function guessOrganizationType(name: string): string | null {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('základní škola') || lowerName.includes('zš')) return 'elementary_school'
  if (lowerName.includes('mateřská škola') || lowerName.includes('mš')) return 'kindergarten'
  if (lowerName.includes('střední škola') || lowerName.includes('gymnázium')) return 'high_school'
  if (lowerName.includes('kulturní') || lowerName.includes('kino')) return 'cultural_center'
  if (lowerName.includes('městský úřad') || lowerName.includes('obec')) return 'municipality'
  if (lowerName.includes('s.r.o.') || lowerName.includes('a.s.')) return 'private_company'
  if (lowerName.includes('spolek') || lowerName.includes('o.p.s.')) return 'nonprofit'
  return null
}
```

### 7.3 Párování existujících zákazníků
```typescript
// Strategie párování zákazníků mezi systémy
interface MatchStrategy {
  // Priorita párování (vyšší = důležitější)
  priority: number
  // Porovnávací funkce
  match: (local: Customer, vf: VyfakturujContact) => boolean
}

const matchStrategies: MatchStrategy[] = [
  // 1. Přesná shoda podle IČO (nejvyšší priorita)
  {
    priority: 100,
    match: (local, vf) =>
      local.billingInfo?.ico && vf.IC &&
      local.billingInfo.ico === vf.IC
  },
  // 2. Shoda podle emailu
  {
    priority: 80,
    match: (local, vf) =>
      local.email && vf.mail_to &&
      local.email.toLowerCase() === vf.mail_to.toLowerCase()
  },
  // 3. Shoda podle telefonu
  {
    priority: 60,
    match: (local, vf) =>
      local.phone && vf.tel &&
      normalizePhone(local.phone) === normalizePhone(vf.tel)
  },
  // 4. Shoda podle názvu organizace + města
  {
    priority: 40,
    match: (local, vf) =>
      local.organization && vf.company &&
      local.address?.city && vf.city &&
      local.organization.toLowerCase() === vf.company.toLowerCase() &&
      local.address.city.toLowerCase() === vf.city.toLowerCase()
  },
]
```

### 7.4 Order → Vyfakturuj Invoice
```typescript
const mapOrderToInvoice = (order: Order, customer: Customer, settings: VyfakturujSettings): CreateInvoiceData => ({
  type: 1, // Faktura (nebo 2 pro zálohovou, 4 pro proformu)
  id_payment_method: settings.defaultPaymentMethod,
  id_number_series: settings.defaultNumberSeries,
  days_due: settings.defaultDaysDue,

  // Zákazník
  id_customer: customer.vyfakturujContactId,
  // nebo inline data pokud není v adresáři
  customer_IC: customer.billingInfo?.ico,
  customer_DIC: customer.billingInfo?.dic,
  customer_name: customer.organization || `${customer.firstName} ${customer.lastName}`,
  customer_street: customer.address?.street,
  customer_city: customer.address?.city,
  customer_zip: customer.address?.postalCode,
  customer_country_code: 'CZ',

  // Položky
  items: order.items.map(item => ({
    text: item.performance?.title || item.game?.title || item.service?.title || 'Služba',
    quantity: 1,
    unit: 'ks',
    unit_price: item.price,
    vat_rate: settings.vatRate || 21,
  })),

  // Příplatky (doprava, atd.)
  // ... přidáno pokud existuje order.pricing.travelCosts

  // Texty
  order_number: order.orderNumber,
  text_invoice_footer: settings.textInvoiceFooter,
  note_internal: `Objednávka: ${order.orderNumber}`,
})
```

### 7.5 Vyfakturuj Invoice → Local Invoice
```typescript
const mapVyfakturujInvoiceToLocal = (vfInvoice: VyfakturujInvoice, orderId?: string): Prisma.InvoiceCreateInput => ({
  invoiceNumber: vfInvoice.number,
  customerId: // najít podle vyfakturujContactId nebo vytvořit
  orderId: orderId,

  // Základní údaje
  issueDate: new Date(vfInvoice.date_created),
  dueDate: new Date(vfInvoice.date_due),
  status: mapVyfakturujFlagsToStatus(vfInvoice.flags),

  // Položky a částky
  items: vfInvoice.items.map(i => ({
    description: i.text,
    quantity: i.quantity,
    unitPrice: parseFloat(i.unit_price),
    total: parseFloat(i.total),
  })),
  subtotal: parseFloat(vfInvoice.total_without_vat) * 100,
  vatRate: 21, // nebo z položek
  vatAmount: (parseFloat(vfInvoice.total) - parseFloat(vfInvoice.total_without_vat)) * 100,
  totalAmount: parseFloat(vfInvoice.total) * 100,

  // Vyfakturuj reference
  vyfakturujId: vfInvoice.id,
  vyfakturujNumber: vfInvoice.number,
  vyfakturujType: vfInvoice.type,
  vyfakturujFlags: vfInvoice.flags,
  vyfakturujVS: vfInvoice.VS,

  // URL
  pdfUrl: vfInvoice.url_download_pdf,
  publicUrl: vfInvoice.url_public_webpage,
  onlinePaymentUrl: vfInvoice.url_online_payment,

  // Metadata
  vyfakturujSyncedAt: new Date(),
  vyfakturujRawData: vfInvoice,
})
```

---

## 8. API Endpointy

### 8.1 Nové endpointy
```
# === Vyfakturuj konfigurace ===
POST   /api/admin/vyfakturuj/test                    # Test API spojení
GET    /api/admin/vyfakturuj/settings                # Načtení nastavení
PUT    /api/admin/vyfakturuj/settings                # Uložení nastavení
GET    /api/admin/vyfakturuj/payment-methods         # Seznam platebních metod
GET    /api/admin/vyfakturuj/number-series           # Seznam číselných řad

# === Synchronizace zákazníků (OBOUSMĚRNÁ) ===
POST   /api/admin/vyfakturuj/customers/import        # Import všech kontaktů z Vyfakturuj
POST   /api/admin/vyfakturuj/customers/export        # Export všech zákazníků do Vyfakturuj
POST   /api/admin/vyfakturuj/customers/sync          # Obousměrná synchronizace
POST   /api/admin/vyfakturuj/customers/match         # Spárovat existující zákazníky
GET    /api/admin/vyfakturuj/customers/status        # Stav synchronizace

# === Jednotlivý zákazník ===
POST   /api/admin/customers/[id]/vyfakturuj/export   # Export zákazníka do Vyfakturuj
POST   /api/admin/customers/[id]/vyfakturuj/import   # Aktualizace z Vyfakturuj
DELETE /api/admin/customers/[id]/vyfakturuj          # Odpojit od Vyfakturuj

# === Faktury ===
POST   /api/admin/orders/[id]/invoice                # Vystavit fakturu z objednávky
POST   /api/admin/invoices/[id]/send-email           # Odeslat fakturu emailem
POST   /api/admin/invoices/[id]/mark-paid            # Označit jako uhrazeno
POST   /api/admin/invoices/[id]/cancel               # Stornovat fakturu
POST   /api/admin/invoices/[id]/credit-note          # Vytvořit dobropis

# === Webhooky ===
POST   /api/webhooks/vyfakturuj                      # Webhook endpoint pro platby
```

### 8.2 Rozšíření stávajících endpointů
```
GET    /api/admin/invoices                           # + parametr source=vyfakturuj
GET    /api/admin/invoices/[id]                      # + data z Vyfakturuj
GET    /api/admin/customers/[id]                     # + vyfakturuj info
GET    /api/admin/orders/[id]                        # + propojené faktury
```

---

## 9. Bezpečnostní opatření

### 9.1 API klíč
- Uložení šifrovaně v databázi
- Nikdy neposílat do frontendu
- Použití pouze na server-side

### 9.2 Webhook validace
- Ověření IP adresy (pokud Vyfakturuj poskytuje whitelist)
- Ověření signatury (pokud podporováno)
- Rate limiting

### 9.3 HTTPS
- Veškerá komunikace přes HTTPS
- Kontrola SSL certifikátu

---

## 10. Implementační fáze

### Fáze 1: Základní infrastruktura
1. Databázové migrace (rozšíření modelů Customer, Invoice, VyfakturujSettings)
2. Vyfakturuj API klient (`src/lib/vyfakturuj/client.ts`)
3. Stránka nastavení Vyfakturuj (`/admin/settings/vyfakturuj`)
4. Test spojení a validace API klíče

### Fáze 2: Obousměrná synchronizace zákazníků
1. **CustomerSyncService** s metodami:
   - `importAllContactsFromVyfakturuj()` - úvodní import
   - `exportCustomerToVyfakturuj()` - export při vytvoření zákazníka
   - `matchAndLinkContacts()` - párování existujících
   - `fullBidirectionalSync()` - kompletní sync
2. **API endpointy** pro synchronizaci
3. **UI komponenty**:
   - Tlačítko "Import z Vyfakturuj" na stránce zákazníků
   - Indikátor synchronizace u každého zákazníka
   - Sekce synchronizace v nastavení
4. **Automatický export** - hook při vytvoření/úpravě zákazníka v admin panelu
5. **Řešení konfliktů** - UI pro manuální řešení rozdílů

### Fáze 3: Faktury
1. InvoiceSyncService
2. Vytváření faktur z objednávek
3. Rozšíření stránky faktur
4. Detail faktury s daty z Vyfakturuj

### Fáze 4: Automatizace
1. Webhook handler pro platby
2. Automatická aktualizace stavů objednávek
3. Notifikace při platbách
4. Periodická synchronizace zákazníků (cron job)

### Fáze 5: Pokročilé funkce
1. Zálohové faktury a daňové doklady
2. Storno a dobropisy
3. Pravidelné faktury (šablony)
4. Statistiky a reporty

---

## 11. Testování

### 11.1 Unit testy
- VyfakturujClient metody
- Mapovací funkce
- Synchronizační služby

### 11.2 Integration testy
- API komunikace s Vyfakturuj (test účet)
- Webhook zpracování
- Databázová synchronizace

### 11.3 E2E testy
- Vytvoření faktury z objednávky
- Synchronizace zákazníka
- Webhook flow

---

## 12. Monitoring a logging

### 12.1 Logy
- Všechna API volání do Vyfakturuj
- Chyby a výjimky
- Webhook příchody

### 12.2 Metriky
- Počet vystavených faktur
- Úspěšnost synchronizací
- Latence API

### 12.3 Alerting
- Selhání API spojení
- Neúspěšné webhooky
- Nekonzistence dat

---

## Závěr

Tato integrace přinese:
- Automatizovanou fakturaci přímo z objednávkového systému
- Synchronizovanou databázi zákazníků
- Real-time sledování plateb
- Profesionální PDF faktury
- Snížení manuální práce a chyb

Doporučuji začít Fází 1 a postupně přidávat další funkcionality podle priority a dostupných zdrojů.
