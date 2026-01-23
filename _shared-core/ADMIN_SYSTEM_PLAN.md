# ARCHITEKTURA ADMINISTRAČNÍHO SYSTÉMU DIVADLA STUDNA
## Komplexní technický plán implementace

**Verze:** 1.0
**Datum:** 2025-11-13
**Projekt:** Divadlo Studna - Admin systém pro správu objednávek
**Současná technologie:** Next.js 14, TypeScript, Sanity CMS

---

## I. ARCHITEKTON

ICK

É ROZHODNUTÍ

### Doporučení: **Rozšířit stávající Sanity CMS + Standalone Admin UI**

### Zdůvodnění

Po analýze projektu doporučuji **hybridní přístup**:

**Řešení:**
1. **Sanity CMS** - rozšířit o nové content typy (Order, Customer, Invoice, Communication)
2. **Custom Admin UI** - vytvořit dedikované admin rozhraní v Next.js App Router (`/admin/*`)
3. **Sanity Studio** - použít pro základní správu dat + rychlé úpravy
4. **Custom Dashboard** - pro pokročilé workflow (schvalování, fakturace, reporting)

### Proč NE čistý Sanity Studio?

**Nevýhody pure Sanity přístupu:**
- ❌ Omezené možnosti customizace složitých workflow (schvalování → calendar → email)
- ❌ Složitější implementace víceúrovňových akcí (potvrzení → 3 API calls → update stavu)
- ❌ Omezený kontrol nad UX/UI pro specifické business procesy
- ❌ Horší integrace s externími službami (Google Calendar API vyžaduje OAuth flow)
- ❌ Reporting a exporty jsou komplikované

**Výhody hybridního přístupu:**
- ✅ **Rychlý vývoj základních CRUD operací** (Sanity schemas zdarma)
- ✅ **Plná kontrola nad UX** pro kritické workflow (custom admin pages)
- ✅ **Jednotný datový model** (vše v Sanity, ale dva interface)
- ✅ **Flexibilita** - můžete začít se Sanity Studio a postupně migrovat na custom UI
- ✅ **Real-time updates** díky Sanity Realtime API
- ✅ **Autentizace** - Next-Auth nebo Sanity authentication
- ✅ **Type safety** - sdílené TypeScript typy

---

## II. KLÍČOVÉ ENTITY (podle reálné dohody)

### A. Customer (Zákazník)

```typescript
{
  _id: string
  email: string              // Primární identifikátor
  firstName: string
  lastName: string
  phone?: string
  organization?: string      // Název školy, instituce, firmy
  organizationType?: string  // elementary_school, kindergarten, atd.
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  billingInfo?: {
    companyName: string
    ico: string              // IČO
    dic: string              // DIČ
    billingAddress: string
  }
  tags?: string[]            // VIP, Stálý zákazník, Newsletter
  notes?: string             // Interní poznámky
  gdprConsent: {
    marketing: boolean
    dataProcessing: boolean
    consentDate: datetime
  }
  createdAt: datetime
}
```

### B. Order (Objednávka) - PODLE REÁLNÉ DOHODY

```typescript
{
  _id: string
  orderNumber: string        // Auto-generated: 2025-001

  // Základní info
  customer: reference(Customer)
  eventName: string          // "Svatovavřinecký jarmark"
  source: string             // contact_form | manual | phone | email
  status: string             // new | reviewing | confirmed | approved | completed | cancelled

  // Datum a místo
  dates: string[]            // ["2025-08-09", "2025-08-10"] - vícedenní akce
  venue: {
    name: string             // "Masarykovo náměstí"
    street?: string
    city: string             // "Náchod"
    postalCode?: string
    gpsCoordinates?: {
      lat: number            // 50.416749
      lng: number            // 16.163375
    }
  }

  // Časování
  arrivalTime?: string       // "2h před začátkem akce"
  preparationTime?: number   // v minutách (120)

  // Položky objednávky (program)
  items: [{
    date: string             // "2025-08-09"
    startTime: string        // "14:00"
    endTime?: string         // "15:00"
    performance: reference(Performance | Game | Service)
    price: number            // 8500
    notes?: string
  }]

  // Technické požadavky (strukturované)
  technicalRequirements: {
    parking: boolean
    parkingSpaces?: number   // 1
    electricity: boolean
    electricityVoltage?: string  // "220V"
    accommodation: boolean
    accommodationPersons?: number  // 4
    sound: boolean
    lighting: boolean
    otherRequirements?: string  // "vlastní porty"
  }

  // Dokumenty
  documents: {
    customerOrderNumber?: string   // "bez" - číslo objednávky od zákazníka
    contractNumber?: string        // "bez" - číslo smlouvy
  }

  // Kontakty
  contacts: {
    primary: {               // Hlavní kontakt (objednatel)
      name: string           // "Jarek Havlíček"
      phone: string          // "602 542 706"
      email: string          // "agripa@centrum.cz"
      ico?: string           // IČO objednatele
    }
    onSite?: {              // Kontakt na akci (kdo bude přítomen)
      name: string
      phone: string
    }
    divadloOnSite?: {       // Kontakt z divadla na akci
      name: string          // "Alena Švecová"
      phone: string         // "602 166 655"
    }
  }

  // Cenové informace
  pricing: {
    items: [{               // Rozpis po položkách
      description: string   // "Princ Jaromil"
      amount: number        // 8500
    }]
    subtotal: number        // 20000
    travelCosts?: number
    discount?: number
    totalPrice: number      // 20000
    vatIncluded: boolean    // false
    notes?: string          // "Nejsme plátci DPH"
  }

  // Workflow
  approvalInfo?: {
    approvedBy: string
    approvedAt: datetime
    calendarEventId: string  // Google Calendar Event ID
    emailsSent: boolean
  }
  linkedEvent?: reference(Event)  // Propojená událost (Ferman)

  // Komunikace
  contactMessage?: string    // Původní zpráva z formuláře
  emailRecipients?: [{
    email: string
    name?: string
    includePricing: boolean  // Odeslat včetně ceny?
  }]
  internalNotes?: [{
    note: string
    author: string
    createdAt: datetime
  }]

  // Metadata
  createdAt: datetime
  updatedAt: datetime
}
```

### C. Invoice (Faktura)

```typescript
{
  _id: string
  invoiceNumber: string      // FV-2025-0001
  order: reference(Order)
  customer: reference(Customer)

  issueDate: date
  dueDate: date

  items: [{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }]

  subtotal: number
  vatRate: number            // 0 pro neplátce DPH
  vatAmount: number
  totalAmount: number

  paymentMethod: string      // bank_transfer | cash | card
  bankAccount?: string
  variableSymbol?: string

  status: string             // draft | sent | paid | overdue | cancelled
  paidDate?: date

  pdfFile?: file             // Vygenerovaná faktura v PDF
  notes?: string

  createdAt: datetime
}
```

### D. Communication (Komunikace)

```typescript
{
  _id: string
  type: string               // email | phone | sms | note
  direction: string          // outgoing | incoming

  order?: reference(Order)
  customer: reference(Customer)

  subject?: string
  content: string
  author?: string

  createdAt: datetime
}
```

---

## III. IMPLEMENTAČNÍ FÁZE

### Fáze 1: Core systém (Týdny 1-3)

**Cíl:** Základní CRUD pro Orders a Customers

**Úkoly:**
1. Sanity schemas (customer, order, invoice, communication)
2. TypeScript typy
3. Repositories (OrderRepository, CustomerRepository)
4. API Routes základní (GET, POST, PATCH, DELETE)
5. Admin UI - základní komponenty
6. Autentizace (NextAuth.js)

**Výstup:**
- ✅ Fungující admin dashboard
- ✅ CRUD pro objednávky a zákazníky
- ✅ Základní autentizace

### Fáze 2: Integrace (Týdny 4-6)

**Cíl:** Google Calendar + Email notifications

**Úkoly:**
1. Google Calendar integrace (OAuth 2.0)
2. Email system (Nodemailer/Resend)
3. OrderService - workflow orchestration
4. Approval UI s confirmation dialog
5. Contact form upgrade

**Výstup:**
- ✅ Schvalovací workflow funguje end-to-end
- ✅ Automatické vytváření calendar events
- ✅ Automatické odesílání e-mailů

### Fáze 3: CRM rozšíření (Týdny 7-8)

**Cíl:** Pokročilá CRM funkcionalita

**Úkoly:**
1. Communication tracking
2. Customer search & autocomplete
3. Customer profile enhancement
4. Duplicate detection

**Výstup:**
- ✅ Kompletní CRM s historií
- ✅ Komunikační timeline
- ✅ Detekce duplikátů

### Fáze 4: Fakturace a reporting (Týdny 9-11)

**Cíl:** Fakturační modul + finanční reporting

**Úkoly:**
1. Invoice CRUD
2. PDF generování (@react-pdf/renderer)
3. Invoice email s přílohami
4. Financial reporting (revenue, statistics)
5. Dashboard KPIs

**Výstup:**
- ✅ Kompletní fakturační systém
- ✅ PDF generování
- ✅ Finanční reporting

### Fáze 5: GDPR a optimalizace (Týdny 12-13)

**Cíl:** GDPR compliance + performance tuning

**Úkoly:**
1. GDPR stránka
2. Cookie consent panel
3. GDPR API endpoints (export, deletion)
4. Performance optimization

**Výstup:**
- ✅ GDPR compliance
- ✅ Cookie management
- ✅ Optimalizovaný systém

---

## IV. TECHNOLOGICKÝ STACK

### Frontend
- **Next.js 14.2+** (App Router) ✓
- **React 18.3+** ✓
- **TypeScript 5+** ✓
- **Tailwind CSS 3.4+** ✓
- **shadcn/ui** (komponenty) - NOVÉ
- **React Hook Form 7.53+** ✓
- **Zod 3.23+** ✓
- **Zustand** (state management) - NOVÉ
- **TanStack Query** (server state) - NOVÉ

### Backend
- **Next.js API Routes** ✓
- **Sanity Client 6.22+** ✓
- **NextAuth.js 5** - NOVÉ
- **Nodemailer 7+** ✓
- **React Email** - NOVÉ
- **googleapis** (Calendar API) - NOVÉ
- **@react-pdf/renderer** (faktury) - NOVÉ

### NPM Dependencies (nové)

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "next-auth": "^5.0.0-beta.4",
    "@react-email/components": "^0.0.14",
    "googleapis": "^131.0.0",
    "google-auth-library": "^9.6.0",
    "date-fns": "^3.0.0",
    "@react-pdf/renderer": "^3.1.14",
    "decimal.js": "^10.4.3"
  }
}
```

---

## V. ADRESÁŘOVÁ STRUKTURA

```
src/
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   ├── invoices/
│   │   └── calendar/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── calendar/
│   │   │   └── emails/
│   │   ├── auth/[...nextauth]/
│   │   └── contact/
│   ├── gdpr/
│   │   └── page.tsx
│   └── ...
├── components/
│   ├── admin/
│   │   ├── layout/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── invoices/
│   │   └── shared/
│   ├── CookieConsent.tsx
│   └── ...
├── lib/
│   ├── sanity/
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── services/
│   │   ├── order/
│   │   │   ├── OrderService.ts
│   │   │   └── orderValidation.ts
│   │   ├── customer/
│   │   │   └── CustomerService.ts
│   │   ├── calendar/
│   │   │   └── CalendarService.ts
│   │   ├── email/
│   │   │   ├── EmailService.ts
│   │   │   └── templates/
│   │   ├── invoice/
│   │   │   ├── InvoiceService.ts
│   │   │   └── invoicePDFGenerator.ts
│   │   └── shared/
│   │       ├── logger.ts
│   │       └── errorHandler.ts
│   ├── repositories/
│   │   ├── OrderRepository.ts
│   │   ├── CustomerRepository.ts
│   │   └── InvoiceRepository.ts
│   ├── integrations/
│   │   ├── google/
│   │   │   └── GoogleCalendarClient.ts
│   │   └── email/
│   │       └── EmailClient.ts
│   └── auth/
│       ├── rbac.ts
│       └── middleware.ts
└── types/
    └── admin.ts

sanity/
├── schemas/
│   ├── customer.ts
│   ├── order.ts
│   ├── invoice.ts
│   ├── communication.ts
│   └── index.ts
└── sanity.config.ts
```

---

## VI. GOOGLE CALENDAR INTEGRACE

### Setup

1. **Google Cloud Console:**
   - Vytvořit projekt
   - Aktivovat Google Calendar API
   - Vytvořit OAuth 2.0 credentials
   - Nastavit redirect URI: `https://yourdomain.com/api/admin/calendar/auth/callback`

2. **Environment variables:**

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_ID=primary
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/admin/calendar/auth/callback
```

### Strategie pro vícedenní akce

- **Jeden event pro celou akci** (i vícedenní)
- V description kompletní rozpis všech programů po dnech
- Start: první den akce
- End: poslední den akce
- Podpora paralelních akcí (různá místa, různí členové)

---

## VII. EMAIL SYSTEM

### SMTP Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=produkce@divadlo-studna.cz
SMTP_PASSWORD=your_app_password
EMAIL_FROM="Divadlo Studna" <produkce@divadlo-studna.cz>
```

### Email Templates

- `orderConfirmation.tsx` - potvrzení objednávky
- `orderApproval.tsx` - schválení s pozvánou (2 varianty: s/bez ceny)
- `invoiceEmail.tsx` - faktura s PDF přílohou
- `reminderEmail.tsx` - připomenutí akce

---

## VIII. BEZPEČNOST & GDPR

### Autentizace

- **NextAuth.js** s credentials provider
- **Role-Based Access Control:**
  - `admin` - plný přístup
  - `manager` - správa objednávek, zákazníků, faktur
  - `viewer` - pouze čtení

### GDPR Compliance

- ✅ Consent management (tracking v Customer schema)
- ✅ Data export API (`/api/gdpr/export`)
- ✅ Data deletion/anonymization (`/api/gdpr/delete`)
- ✅ Cookie consent panel
- ✅ GDPR info page (`/gdpr`)
- ✅ Data retention policies

---

## IX. KONTAKTNÍ FORMULÁŘ - Vylepšení

### Nová pole pro sběr dat:

1. **Typ dotazu:** Objednávka | Dotaz | Jiné
2. **Název akce:** text (volitelné)
3. **Datum akce:** DatePicker
4. **Je vícedenní?:** checkbox → pokud ano, zobrazí se pole "Do data"
5. **Místo konání:** text + city
6. **GPS souřadnice:** volitelné (nebo auto-detect z adresy)
7. **Představení/Program:** Multi-select z dostupných představení
8. **Přidání více programů:**
   - [ ] Tlačítko "+ Přidat další program"
   - [ ] Každý program: datum, čas, výběr představení
9. **Očekávaný počet diváků:** number
10. **Technické požadavky:** checkboxy + volný text
11. **Kontakt na akci:** jméno, telefon

### UX Optimalizace:

- **Conditional fields** - zobrazují se pouze relevantní pole
- **Autosave** do localStorage
- **Progress indicator** - zobrazení % dokončení
- **Validace v reálném čase** - Zod schemas
- **Náhled** objednávky před odesláním

---

## X. DALŠÍ KROKY

1. ✅ Vytvořit Sanity schemas
2. ⏳ Nasadit Sanity Studio
3. ⏳ Implementovat API routes
4. ⏳ Vytvořit admin UI komponenty
5. ⏳ Integrace Google Calendar
6. ⏳ Email system
7. ⏳ Fakturace a PDF
8. ⏳ GDPR compliance

---

**Poznámka:** Tento dokument je živý - bude se aktualizovat v průběhu implementace.

**Autor:** Claude (AI Asistent)
**Projekt manager:** Muzma
**Poslední aktualizace:** 2025-11-13
