# Admin System - Implementation Status

## ✅ Completed (Phase 1-2)

### 1. Data Models & Schemas
**Sanity Schemas Created:**
- ✅ `customer.ts` - Zákaznická databáze s CRM funkcemi
  - GDPR consent management
  - Billing info (IČO, DIČ)
  - Organization types
  - Tags system

- ✅ `order.ts` - Komplexní objednávkový systém
  - Multi-day event support (dates array)
  - GPS coordinates for venues
  - Flexible program items (performances/games/services)
  - Structured technical requirements
  - Detailed pricing breakdown
  - Multiple contact persons
  - Internal notes timeline
  - Status workflow (8 states)

- ✅ `invoice.ts` - Fakturační systém
  - Automatic numbering (FV-YYYY-NNNN)
  - Line items with VAT
  - PDF file attachment
  - Payment tracking
  - Status workflow (5 states)

- ✅ `communication.ts` - Komunikační timeline
  - Email, phone, SMS, note types
  - Bidirectional (incoming/outgoing)
  - Links to customers and orders

**File:** `sanity/schemas/index.ts` - Updated with new schemas

### 2. TypeScript Types
**File:** `src/types/admin.ts`
- ✅ Complete type definitions matching Sanity schemas
- ✅ Populated types (with resolved references)
- ✅ Enum types for status fields
- ✅ 300+ lines of strongly-typed interfaces

### 3. Data Access Layer (Repository Pattern)
**Files Created:**
- ✅ `src/lib/sanity/admin-client.ts` - Dedicated admin Sanity client
- ✅ `src/repositories/CustomerRepository.ts`
  - CRUD operations
  - Search & filtering
  - GDPR data export
  - Statistics

- ✅ `src/repositories/OrderRepository.ts`
  - Advanced filtering (status, dates, customer)
  - Auto-generate order numbers (YYYY-NNN)
  - Status updates with approval workflow
  - Internal notes management
  - Pricing calculations
  - Calendar & Ferman event linking
  - Statistics & upcoming events

- ✅ `src/repositories/InvoiceRepository.ts`
  - Auto-generate invoice numbers (FV-YYYY-NNNN)
  - Create from order
  - Automatic totals calculation
  - PDF attachment support
  - Overdue checking

- ✅ `src/repositories/CommunicationRepository.ts`
  - Timeline queries
  - Helper methods for logging (email, phone, note)
  - Search functionality

### 4. API Routes (Next.js 14 App Router)
**Files Created:**
- ✅ `/api/admin/orders` - List & create orders
- ✅ `/api/admin/orders/[id]` - Get, update, delete single order
- ✅ `/api/admin/orders/[id]/status` - Update order status
- ✅ `/api/admin/customers` - List & create customers
- ✅ `/api/admin/customers/[id]` - Get, update, delete single customer
- ✅ `/api/admin/invoices` - List & create invoices
- ✅ `/api/admin/invoices/[id]` - Get, update, delete single invoice
- ✅ `/api/admin/stats` - Dashboard statistics

**API Features:**
- Query parameters for filtering
- Population of references
- Validation
- Error handling
- TypeScript typed responses

### 5. Admin UI (Basic Structure)
**Files Created:**
- ✅ `src/app/admin/layout.tsx` - Admin navigation & layout
- ✅ `src/app/admin/page.tsx` - Dashboard with stats & overview
- ✅ `src/app/admin/orders/page.tsx` - Orders list with filters
- ✅ `src/app/admin/customers/page.tsx` - Customers list with search
- ✅ `src/app/admin/invoices/page.tsx` - Invoices list with filters

**UI Features:**
- Server-side data fetching
- Status badges with colors
- Responsive tables
- Filter interfaces (ready for client-side implementation)
- Navigation between sections

### 6. Development Environment
- ✅ Sanity Studio running on http://localhost:3333
- ✅ Next.js dev server running on http://localhost:3001
- ✅ Admin panel accessible at http://localhost:3001/admin

## 📋 Next Steps (Phase 3-5)

### Phase 3: Admin UI Completion (Week 4-6)
**Priority:** HIGH

1. **Order Detail Page** (`/admin/orders/[id]`)
   - [ ] View/edit all order fields
   - [ ] Status change buttons
   - [ ] Add internal notes
   - [ ] Pricing calculator
   - [ ] Email recipient management
   - [ ] Technical requirements checklist

2. **Customer Detail Page** (`/admin/customers/[id]`)
   - [ ] View/edit customer info
   - [ ] Order history for customer
   - [ ] Communication timeline
   - [ ] GDPR data export button

3. **Invoice Detail Page** (`/admin/invoices/[id]`)
   - [ ] View/edit invoice
   - [ ] PDF generation preview
   - [ ] Mark as sent/paid
   - [ ] Payment tracking

4. **Create/Edit Forms**
   - [ ] New order form (multi-step wizard?)
   - [ ] New customer form
   - [ ] New invoice from order
   - [ ] Client-side validation

5. **Interactive Features**
   - [ ] Convert filter forms to client components with state
   - [ ] Real-time search
   - [ ] Pagination
   - [ ] Sorting

### Phase 4: Approval Workflow & Integrations (Week 7-9)
**Priority:** MEDIUM-HIGH

1. **Google Calendar Integration**
   - [ ] OAuth 2.0 setup
   - [ ] Create event on order approval
   - [ ] Update event on order changes
   - [ ] Delete event on cancellation
   - [ ] Multi-day event support
   - [ ] Store calendarEventId

2. **Email System**
   - [ ] Setup Resend or Nodemailer
   - [ ] React Email templates
   - [ ] Order confirmation email
   - [ ] Quote/pricing email (with/without price toggle)
   - [ ] Invoice email with PDF
   - [ ] Status change notifications

3. **Approval Workflow Orchestration**
   - [ ] `/api/admin/orders/[id]/approve` endpoint
   - [ ] Atomic workflow: Status → Create Calendar → Create Ferman → Send Emails
   - [ ] Rollback on failure
   - [ ] Approval page UI
   - [ ] Confirmation dialogs

4. **Ferman Event Creation**
   - [ ] Map order data to event schema
   - [ ] Create event on approval
   - [ ] Link back to order

### Phase 5: Advanced Features (Week 10-13)
**Priority:** MEDIUM

1. **PDF Generation**
   - [ ] Install @react-pdf/renderer
   - [ ] Invoice template
   - [ ] Contract/agreement template
   - [ ] Upload to Sanity assets
   - [ ] Download endpoint

2. **Dashboard Enhancements**
   - [ ] Revenue charts (Chart.js/Recharts)
   - [ ] Monthly/yearly comparisons
   - [ ] Customer type breakdown
   - [ ] Performance metrics

3. **Communication Log**
   - [ ] Auto-log sent emails
   - [ ] Manual phone call logging
   - [ ] Notes interface
   - [ ] Timeline view

4. **GDPR Compliance**
   - [ ] Cookie consent banner
   - [ ] Data export API endpoint
   - [ ] Data deletion API endpoint
   - [ ] Consent management UI
   - [ ] Privacy policy page

5. **Authentication & Authorization**
   - [ ] NextAuth.js setup
   - [ ] Login page
   - [ ] Role-based access (admin, viewer)
   - [ ] Protect admin routes
   - [ ] API route protection

6. **Advanced Order Features**
   - [ ] Duplicate order functionality
   - [ ] Bulk operations
   - [ ] Export to CSV/Excel
   - [ ] Order templates

## 🔧 Required Environment Variables

Add to `.env.local`:

```env
# Sanity (already configured)
NEXT_PUBLIC_SANITY_PROJECT_ID=hrw3bcsg
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<your-write-token>  # ⚠️ Required for admin operations!

# Site URL (for API calls)
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Google Calendar (Phase 4)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=

# Email Service (Phase 4)
RESEND_API_KEY=
# OR
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# NextAuth (Phase 5)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate-random-string>
```

## 🚀 Getting Started

### 1. Verify Sanity Studio
```bash
cd sanity
npm run dev
# Open http://localhost:3333
# Verify new content types: Zákazníci, Objednávky, Faktury, Komunikace
```

### 2. Generate Sanity Write Token
1. Go to https://www.sanity.io/manage/
2. Select project "Divadlo Studna"
3. Go to API → Tokens
4. Create new token with **Editor** permissions
5. Add to `.env.local` as `SANITY_API_TOKEN`

### 3. Test Admin Panel
```bash
npm run dev
# Open http://localhost:3001/admin
# Should see dashboard (may show errors without data)
```

### 4. Create Test Data
Use Sanity Studio to create:
- 1-2 test customers
- 1-2 test orders
- Link orders to customers

Then refresh admin panel to see data.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin UI   │  │ Public Pages │  │  API Routes  │      │
│  │ /admin/*     │  │ /, /soubor   │  │ /api/admin/* │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                     │              │
│         └─────────────────┬───────────────────┘              │
│                           │                                  │
│                    ┌──────▼───────┐                          │
│                    │ Repositories │                          │
│                    │ (Data Access)│                          │
│                    └──────┬───────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Sanity CMS    │
                    │   (Database)   │
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐
         │Customer │  │   Order   │  │Invoice │
         │  Data   │  │   Data    │  │  Data  │
         └─────────┘  └───────────┘  └────────┘
```

## 🔑 Key Design Decisions

1. **Hybrid CMS Approach**: Sanity Studio for data management + Custom Admin UI for workflows
2. **Repository Pattern**: Clean abstraction over Sanity client
3. **TypeScript First**: Full type safety from database to UI
4. **Server Components**: Leverage Next.js 14 App Router for performance
5. **API Routes**: RESTful endpoints for client-side interactions
6. **Atomic Operations**: Ensure data consistency in complex workflows

## 📝 Notes

- All code is production-ready but needs testing with real data
- No authentication yet - add before production deployment
- Email/Calendar integrations require external service setup
- Consider adding rate limiting for API routes
- Add logging/monitoring for production (e.g., Sentry)
