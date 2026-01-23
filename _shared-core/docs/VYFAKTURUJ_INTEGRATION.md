# Vyfakturuj.cz Integration

Kompletní integrace s fakturačním systémem Vyfakturuj.cz pro správu faktur, zákazníků a plateb.

**Status: DOKONČENO** (Fáze 1-4)
**Datum**: 2025-01-05

---

## Přehled Fází

### Fáze 1: Základní Infrastruktura

- [x] Prisma schema rozšíření (VyfakturujSettings, Customer fields, Invoice fields)
- [x] TypeScript typy pro Vyfakturuj API (`src/types/vyfakturuj.ts`)
- [x] API klient s retry logikou (`src/lib/vyfakturuj/client.ts`)
- [x] Šifrování API klíče
- [x] Settings stránka v administraci

### Fáze 2: Synchronizace Zákazníků

- [x] CustomerSyncService (`src/lib/vyfakturuj/customer-sync.ts`)
- [x] ARES lookup pro IČO validaci
- [x] Hromadná synchronizace zákazníků
- [x] Import/Export zákazníků z/do Vyfakturuj
- [x] UI pro sync na stránce zákazníků

### Fáze 3: Fakturace

- [x] InvoiceSyncService (`src/lib/vyfakturuj/invoice-sync.ts`)
- [x] Vytvoření faktury z objednávky
- [x] Mapování Order → Vyfakturuj Invoice
- [x] Synchronizace stavu faktur
- [x] UI pro vystavení faktury
- [x] Detail faktury s Vyfakturuj daty

---

## Architektura

```
src/
├── lib/
│   ├── vyfakturuj/
│   │   ├── index.ts              # Hlavní export, getVyfakturujClient()
│   │   ├── client.ts             # VyfakturujClient třída
│   │   ├── customer-sync.ts      # CustomerSyncService
│   │   └── invoice-sync.ts       # InvoiceSyncService
│   └── qr-payment.ts             # SPAYD QR generátor
├── types/
│   └── vyfakturuj.ts             # TypeScript typy
├── app/api/
│   ├── admin/
│   │   ├── vyfakturuj/           # Vyfakturuj settings & sync API
│   │   ├── customers/[id]/vyfakturuj/  # Customer sync API
│   │   ├── invoices/[id]/vyfakturuj/   # Invoice actions API
│   │   ├── invoices/[id]/qr/     # QR kód API
│   │   ├── invoices/sync/        # Bulk invoice sync
│   │   ├── orders/[id]/invoice/  # Create invoice from order
│   │   ├── orders/[id]/status/   # Order status (s auto-proforma)
│   │   └── orders/bulk-invoice/  # Bulk invoice creation
│   ├── webhooks/vyfakturuj/      # Webhook endpoint
│   └── cron/
│       ├── sync-invoices/        # Hodinová sync
│       └── send-reminders/       # Denní upomínky
└── app/admin/
    ├── settings/vyfakturuj/      # Settings page
    ├── customers/                # Customer list with sync
    ├── orders/                   # Order list with bulk actions
    └── invoices/                 # Invoice list & detail s QR
```

---

## API Endpointy

### Vyfakturuj Settings

| Method | Endpoint | Popis |
|--------|----------|-------|
| GET | `/api/admin/vyfakturuj/settings` | Načíst nastavení |
| POST | `/api/admin/vyfakturuj/settings` | Uložit nastavení |
| POST | `/api/admin/vyfakturuj/test` | Test připojení |
| POST | `/api/admin/vyfakturuj/refresh-cache` | Obnovit cache |

### Zákazníci

| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/admin/customers/[id]/vyfakturuj` | Sync zákazníka (action: sync/unlink) |
| POST | `/api/admin/vyfakturuj/sync` | Hromadná sync zákazníků |
| POST | `/api/admin/vyfakturuj/sync/export` | Export do Vyfakturuj |
| POST | `/api/admin/vyfakturuj/sync/import` | Import z Vyfakturuj |

### Faktury

| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/admin/orders/[id]/invoice` | Vytvořit fakturu z objednávky |
| POST | `/api/admin/orders/bulk-invoice` | Hromadné vytvoření faktur |
| GET | `/api/admin/invoices/[id]/vyfakturuj?action=pdf` | Získat PDF URL |
| GET | `/api/admin/invoices/[id]/qr` | Získat QR kód pro platbu |
| POST | `/api/admin/invoices/[id]/vyfakturuj` | Akce: sync, send-email, mark-paid, credit-note |
| POST | `/api/admin/invoices/sync` | Hromadná sync stavů faktur |

### Webhooks & Cron

| Method | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/webhooks/vyfakturuj` | Webhook pro Vyfakturuj události |
| GET | `/api/cron/sync-invoices` | Cron: hodinová sync stavů |
| GET | `/api/cron/send-reminders` | Cron: denní upomínky |

---

## Databázové Schema

### VyfakturujSettings

```prisma
model VyfakturujSettings {
  id                      String   @id @default("singleton")
  isConfigured            Boolean  @default(false)
  apiEmail                String?
  apiKeyHash              String?  // Encrypted
  defaultPaymentMethodId  Int?
  defaultNumberSeriesId   Int?
  defaultDaysDue          Int      @default(14)

  // Supplier info
  supplierName            String?
  supplierIco             String?
  supplierDic             String?
  supplierStreet          String?
  supplierCity            String?
  supplierZip             String?
  supplierEmail           String?
  supplierPhone           String?
  supplierBankAccount     String?
  supplierIban            String?

  // Cache
  cachedPaymentMethods    Json?
  cachedNumberSeries      Json?
  cachedTags              Json?
  lastSyncAt              DateTime?
}
```

### Customer (rozšíření)

```prisma
model Customer {
  // ... existing fields
  vyfakturujContactId     Int?      @unique
  vyfakturujSyncedAt      DateTime?
}
```

### Invoice (rozšíření)

```prisma
model Invoice {
  // ... existing fields
  vyfakturujId            Int?      @unique
  vyfakturujNumber        String?
  vyfakturujType          Int?
  vyfakturujFlags         Int?
  vyfakturujVS            Int?
  publicUrl               String?
  onlinePaymentUrl        String?
  vyfakturujSyncedAt      DateTime?
  vyfakturujRawData       Json?
}
```

---

## Klíčové Funkce

### VyfakturujClient

```typescript
const client = await getVyfakturujClient()

// Faktury
const invoice = await client.createInvoice(data)
const invoice = await client.getInvoice(id)
const invoices = await client.listInvoices(params)
await client.sendInvoiceEmail(id, ['email@example.com'])
await client.setInvoicePaid(id, '2025-01-04', 1000)

// Kontakty
const contact = await client.createContact(data)
const contact = await client.getContact(id)
await client.updateContact(id, data)

// Metadata
const paymentMethods = await client.getPaymentMethods()
const numberSeries = await client.getNumberSeries()
```

### CustomerSyncService

```typescript
// Sync jednotlivého zákazníka
const result = await syncCustomerToVyfakturuj(customerId)

// Hromadná sync
const stats = await syncAllCustomers()

// Export nových zákazníků
const result = await exportCustomersToVyfakturuj([customerId1, customerId2])

// Import z Vyfakturuj
const result = await importContactsFromVyfakturuj()
```

### InvoiceSyncService

```typescript
// Vytvořit fakturu z objednávky
const result = await createInvoiceFromOrder(orderId, {
  type: 'invoice',  // 'invoice' | 'proforma' | 'advance'
  sendEmail: true,
  emailRecipients: ['customer@email.com'],
  notes: 'Poznámka na fakturu'
})

// Sync stavu faktury
const result = await syncInvoiceStatus(invoiceId)

// Hromadná sync
const stats = await syncAllInvoicesStatus()

// Označit jako uhrazeno
const result = await markInvoicePaid(invoiceId, new Date(), 5000)

// Odeslat email
const result = await sendInvoiceEmail(invoiceId, ['email@example.com'])

// Získat PDF URL
const url = await getInvoicePdfUrl(invoiceId)

// Vytvořit dobropis
const result = await createCreditNote(invoiceId, items)
```

---

## UI Komponenty

### Settings Stránka

`/admin/settings/vyfakturuj`
- Konfigurace API přístupu
- Test spojení
- Nastavení dodavatele
- Výchozí platební metoda a číselná řada
- Texty faktur

### Seznam Zákazníků

`/admin/customers`
- Sloupec "Vyfakturuj" s ID a odkazem
- Tlačítko "Sync All" pro hromadnou synchronizaci
- Quick actions pro jednotlivé zákazníky

### Seznam Faktur

`/admin/invoices`
- Sloupec "Vyfakturuj" s číslem a odkazem
- Tlačítko "Sync Vyfakturuj" pro hromadnou sync

### Detail Faktury

`/admin/invoices/[id]`
- Kompletní info včetně Vyfakturuj dat
- Akce: Sync, PDF, Odeslat email, Označit uhrazeno
- Odkazy na veřejný náhled a online platbu

### Detail Objednávky

`/admin/orders/[id]`
- Tlačítko "Vystavit fakturu" pro potvrzené objednávky
- Dialog pro výběr typu faktury a emailu

---

## Typy Dokladů

| Typ | Kód | Popis |
|-----|-----|-------|
| FAKTURA | 1 | Standardní daňový doklad |
| ZALOHOVA_FAKTURA | 2 | Faktura na zálohu |
| PROFORMA | 4 | Nezávazná nabídka k platbě |

## Příznaky Faktur (Flags)

| Příznak | Hodnota | Popis |
|---------|---------|-------|
| OBSAHUJE_DPH | 1 | Faktura obsahuje DPH |
| UHRAZENO | 2 | Faktura je uhrazená |
| ODESLANO_EMAILEM | 4 | Odesláno zákazníkovi |
| STORNOVANO | 8 | Faktura je stornována |
| ODESLANA_UPOMINKA | 16 | Odeslána upomínka |

---

## Environment Variables

```env
# Vyfakturuj encryption key (32 chars, change in production!)
VYFAKTURUJ_ENCRYPTION_KEY=your-32-character-encryption-key

# Optional: Enable debug logging
VYFAKTURUJ_DEBUG=true

# Cron job authorization (for Vercel Cron or external services)
CRON_SECRET=your-cron-secret-key
```

---

## Fáze 4: Webhooks & Automatizace (DOKONČENO)

### 4.1 Webhooks pro Platby

**Endpoint**: `POST /api/webhooks/vyfakturuj`

Automatický příjem notifikací z Vyfakturuj při:
- Úhradě faktury (`invoice.paid`)
- Změně stavu faktury (`invoice.updated`)
- Stornování faktury (`invoice.cancelled`)

**Nastavení**:
1. V administraci `/admin/settings/vyfakturuj` vygenerujte Webhook Secret
2. Nastavte webhook URL ve Vyfakturuj: `https://your-domain.cz/api/webhooks/vyfakturuj`
3. Použijte stejný secret v obou systémech

### 4.2 Automatické Upomínky

**Endpoint**: `GET /api/cron/send-reminders`

Automatické odesílání upomínek pro nezaplacené faktury po splatnosti.

**Nastavení**:
- Povolit v administraci
- Nastavit intervaly (1., 2., 3. upomínka)
- Spouští se denně v 8:00 přes Vercel Cron

### 4.3 Automatická Synchronizace

**Endpoint**: `GET /api/cron/sync-invoices`

Periodická synchronizace stavů faktur z Vyfakturuj (každou hodinu).

### Vercel Cron Konfigurace

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-invoices",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

---

## Fáze 4.2: QR Kódy pro Platby (DOKONČENO)

### SPAYD QR Generátor

**Soubor**: `src/lib/qr-payment.ts`

Funkce:
- `generateSpaydString()` - Generuje SPAYD string pro QR kód
- `generateQRCodeDataUrl()` - Generuje QR kód jako base64 Data URL
- `generateQRCodeSvg()` - Generuje QR kód jako SVG
- `generateQRCodeBuffer()` - Generuje QR kód jako Buffer (PNG)
- `createPaymentDataFromInvoice()` - Vytvoří platební data z faktury

### API Endpoint

**GET** `/api/admin/invoices/[id]/qr`

Query params:
- `format`: `dataurl` (default) | `svg` | `png`
- `width`: číslo (default: 200)

### UI Integrace

QR kód se automaticky zobrazuje na detailu faktury pro nezaplacené faktury.

---

## Fáze 4.3: Hromadné Generování Faktur (DOKONČENO)

### Bulk Invoice API

**Endpoint**: `POST /api/admin/orders/bulk-invoice`

Hromadné vytvoření faktur z více objednávek najednou.

**Request Body**:
```json
{
  "orderIds": ["order-id-1", "order-id-2"],
  "options": {
    "type": "invoice",  // "invoice" | "proforma" | "advance"
    "sendEmail": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Created 5 invoices",
  "data": {
    "succeeded": 5,
    "failed": 0,
    "total": 5,
    "results": [...]
  }
}
```

### UI Integrace

V seznamu objednávek (`/admin/orders`) jsou nové bulk akce:
- **Vytvořit faktury** - Vytvoří standardní faktury pro vybrané objednávky
- **Vytvořit proformy** - Vytvoří proforma faktury pro vybrané objednávky

Podmínky:
- Objednávky musí být ve stavu `confirmed`, `approved` nebo `completed`
- Objednávka nesmí mít již existující fakturu

---

## Fáze 4.4: Auto-create Proforma (DOKONČENO)

### Automatické Vytvoření Proformy

Při změně stavu objednávky na `confirmed` se automaticky vytvoří proforma faktura.

**Podmínky pro automatické vytvoření**:
1. Status se mění NA `confirmed` (ne když už je confirmed)
2. Objednávka nemá žádnou existující fakturu
3. V nastavení je povoleno `autoCreateProforma`

**Konfigurace**:
V administraci `/admin/settings/vyfakturuj` v sekci "Automatizace":
- Zaškrtněte "Automaticky vytvořit proformu při potvrzení objednávky"

**API Response** (rozšířené):
```json
{
  "success": true,
  "data": { ... },
  "proformaCreated": true,
  "proformaError": null
}
```

---

## Co Zbývá Implementovat (Volitelné)

### Fáze 5: UX Vylepšení

- [ ] Dashboard s přehledem faktur
- [ ] Grafy příjmů a pohledávek
- [ ] Notifikace o nezaplacených fakturách
- [ ] Historie synchronizací a webhook logů
- [ ] Daňové výkazy a exporty
- [ ] Napojení na účetní systémy

---

## Troubleshooting

### API Error 401 - Unauthorized
- Zkontrolujte email a API klíč v nastavení
- Ověřte, že API klíč je aktivní ve Vyfakturuj

### Faktura se nevytváří
- Zkontrolujte, že objednávka má cenu > 0
- Ověřte, že zákazník má vyplněné údaje
- Podívejte se do konzole pro detailní chyby

### Sync selhává
- Zkontrolujte, že Vyfakturuj je nakonfigurován
- Ověřte síťové připojení
- Zkuste "Test spojení" v nastavení

---

**Autor**: Claude + Muzma
**Verze**: 1.3.0
**Datum**: 2025-01-05

### Changelog

**v1.3.0** (2025-01-05)
- Přidáno hromadné generování faktur (bulk invoice creation)
- Přidány bulk akce v seznamu objednávek
- Přidáno automatické vytvoření proformy při potvrzení objednávky
- Rozšířen status endpoint o auto-proforma logiku

**v1.2.0** (2025-01-05)
- Přidány QR kódy pro platby ve formátu SPAYD
- QR kód se zobrazuje na detailu faktury
- API endpoint pro generování QR kódů v různých formátech

**v1.1.0** (2025-01-05)
- Přidány webhooks pro automatické aktualizace stavů faktur
- Přidány automatické upomínky po splatnosti (3 úrovně)
- Přidány cron jobs pro synchronizaci a upomínky
- Přidána Vercel Cron konfigurace
- Rozšířeno UI nastavení o sekce webhooks a upomínek

**v1.0.0** (2025-01-04)
- Základní integrace (Fáze 1-3)
- API klient, synchronizace zákazníků, vytváření faktur
