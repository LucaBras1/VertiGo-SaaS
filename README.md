# VertiGo SaaS

Multi-vertical SaaS platform for service-based businesses with AI-powered features.

## Overview

VertiGo is a comprehensive SaaS framework designed for service-based businesses across 7 industry verticals. Built on a shared core with intelligent AI integration, it provides tailored solutions for each industry while maintaining a unified codebase.

### Supported Verticals

| Vertical | Product | Target Market | Status |
|----------|---------|---------------|--------|
| Fitness | **FitAdmin** | Personal trainers, studios | 90% Complete |
| Musicians | **GigBook** | Bands, DJs, solo musicians | 95% Complete |
| Team Building | **TeamForge** | Corporate team building | 80% Complete |
| Photography | **ShootFlow** | Wedding & event photographers | 75% Complete |
| Kids Entertainment | **PartyPal** | Kids party entertainers | 65% Complete |
| Events | **EventPro** | Event entertainment providers | 40% Complete |
| Performing Arts | **StageManager** | Theaters, circus, performers | Planned |

## Features

### Core Platform Features
- **Multi-tenant Architecture** - Complete data isolation per tenant
- **AI-Powered Intelligence** - GPT-4o integration for smart automation
- **Booking System** - Conversational AI booking experience
- **CRM** - Customer relationship management
- **Invoicing** - Order and invoice management
- **Rich Text Editor** - TipTap-powered content editing
- **Global Billing Platform** - Multi-currency payments, bank integration, crypto support

### AI Capabilities (per Vertical)

**FitAdmin (Fitness)**
- Workout Generator - AI-generated personalized training plans
- Nutrition Advisor - Diet recommendations based on goals
- Progress Predictor - ML-based fitness progress forecasting
- Churn Detector - Client retention risk analysis

**GigBook (Musicians)**
- Gig Price Calculator - Dynamic pricing based on event parameters
- Setlist Generator - AI-curated song lists for events
- Stage Rider Generator - Automated technical requirements

**TeamForge (Team Building)**
- Activity Recommender - AI-matched team activities
- Program Builder - Custom program generation

### Core AI Features
- **AI Booking Concierge** - Natural language booking widget
- **AI Quote Generator** - Intelligent 3-tier pricing suggestions
- **AI Communication Hub** - Smart email drafting & sentiment analysis
- **AI Business Intelligence** - Revenue prediction & churn detection
- **AI Content Factory** - Description generation & SEO optimization

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma 7 ORM |
| Authentication | NextAuth.js |
| Styling | Tailwind CSS + Radix UI |
| AI | OpenAI GPT-4o |
| Payments | Stripe, PayPal, GoPay, Coinbase Commerce |
| Banking | Fio, Plaid, Nordigen (Open Banking) |
| Monorepo | Turborepo 2.x + pnpm |
| Validation | Zod |
| Rich Text | TipTap |
| Deployment | Vercel |

## Project Structure

```
VertiGo-SaaS/
├── apps/                          # Vertical applications
│   ├── fitness/                   # FitAdmin - Fitness platform (90%)
│   │   └── dashboard/             # clients, classes, sessions, progress,
│   │                              # payments, invoices, packages, settings
│   ├── musicians/                 # GigBook - Musicians platform (90%)
│   │   └── dashboard/             # clients, gigs, invoices, repertoire,
│   │                              # setlists, billing, settings
│   ├── team-building/             # TeamForge - Team building (80%)
│   │   └── admin/                 # activities, programs, sessions, orders,
│   │                              # invoices, customers, reports, ai, settings
│   ├── photography/               # ShootFlow - Photography platform (75%)
│   │   └── dashboard/             # clients, shoots, galleries, shot-lists,
│   │                              # invoices, packages, settings
│   ├── kids-entertainment/        # PartyPal - Kids entertainment (65%)
│   ├── events/                    # EventPro - Events platform (40%)
│   └── performing-arts/           # StageManager - Performing arts (Planned)
├── packages/
│   ├── ai-core/                   # AI utilities & OpenAI integration
│   ├── auth/                      # Authentication (NextAuth.js) (NEW)
│   ├── billing/                   # Global billing & payments platform
│   ├── config/                    # Shared configurations
│   ├── database/                  # Prisma schema & utilities
│   ├── email/                     # Email service (Resend) (NEW)
│   ├── stripe/                    # Stripe payments (NEW)
│   └── ui/                        # Shared React components
├── _docs/                         # Documentation
│   ├── MASTER-GUIDE.md            # Development guide
│   ├── AI-INTEGRATION.md          # AI implementation guide
│   └── verticals/                 # Per-vertical documentation
├── _shared-core/                  # Base Next.js admin panel
├── docker-compose.yml             # Local development setup
├── turbo.json                     # Turborepo configuration
└── pnpm-workspace.yaml            # Workspace configuration
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/LucaBras1/VertiGo-SaaS.git
cd VertiGo-SaaS

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:generate

# Start development server
pnpm dev
```

### Environment Variables

Create `.env.local` with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vertigo"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# Billing & Payments (optional)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
FIO_API_TOKEN="..."
PLAID_CLIENT_ID="..."
PLAID_SECRET="..."
COINBASE_COMMERCE_API_KEY="..."
```

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps
pnpm lint             # Lint all packages
pnpm test             # Run tests
pnpm format           # Format code with Prettier

# Database
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations

# AI
pnpm test:ai          # Run AI module tests
pnpm ai:cost-report   # Generate AI cost report

# Maintenance
pnpm clean            # Clean build artifacts
```

### Working with Verticals

Each vertical in `apps/` is a standalone Next.js application that:
- Uses shared packages from `packages/`
- Has its own Tailwind configuration for branding
- Implements vertical-specific AI modules
- Can be deployed independently

### AI Development

See [AI Integration Guide](./_docs/AI-INTEGRATION.md) for detailed instructions on:
- Creating new AI features
- Prompt template management
- Response validation with Zod
- Cost optimization strategies

## Packages

### @vertigo/auth (NEW)

Centralized authentication for all verticals:
- NextAuth.js configuration factory
- Multi-tenant support with tenant info in session
- Configurable credentials provider
- Middleware helpers (withAuth, withRole, withTenant)
- Session utilities for Server Components
- Localization support (English, Czech)

```typescript
import { createAuthOptions, hashPassword } from '@vertigo/auth'
import { prisma } from './prisma'

export const authOptions = createAuthOptions({
  prisma,
  pages: { signIn: '/auth/login' },
  multiTenant: { enabled: true },
  locale: 'cs',
})
```

### @vertigo/email (NEW)

Unified email service with vertical-specific branding:
- Resend API integration
- Pre-built templates (welcome, reminder, invoice, password reset)
- Vertical-specific themes and colors
- Customizable sender and branding

```typescript
import { createEmailService, VerticalTheme } from '@vertigo/email'

const emailService = createEmailService({
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: 'FitAdmin <noreply@fitadmin.app>',
  theme: VerticalTheme.fitness,
})

await emailService.sendWelcome({ to: 'user@example.com', userName: 'John', ... })
```

### @vertigo/stripe (NEW)

Stripe payment integration:
- Lazy-loading client (build-time safe)
- Checkout session creation
- Payment intent management
- Webhook signature verification
- Currency formatting utilities

```typescript
import { createCheckoutSession, handleStripeEvent } from '@vertigo/stripe'

const session = await createCheckoutSession({
  lineItems: [{ name: 'Package', amount: 15000, currency: 'czk', quantity: 1 }],
  successUrl: 'https://app.com/success',
  cancelUrl: 'https://app.com/cancel',
})
```

### @vertigo/ai-core

AI integration package with:
- OpenAI GPT-4o client
- Rate limiting (token bucket algorithm)
- Response caching (LRU cache)
- Usage tracking with cost estimation
- Embedding service for RAG
- Prompt management system

```typescript
import { createAIClient } from '@vertigo/ai-core'

const ai = createAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  cache: { enabled: true },
  rateLimit: { enabled: true, requestsPerMinute: 60 }
})

const response = await ai.chat(messages, { tenantId, vertical })
```

### @vertigo/database

Multi-tenant database package with:
- Complete Prisma schema
- 7 vertical enums
- Tenant & subscription management
- Customer CRM models
- Order & invoicing
- AI usage logging

### @vertigo/ui

Shared component library:
- `AIAssistantWidget` - Chat widget
- `AIQuoteSuggestion` - 3-tier quote generator
- `AIDraftEditor` - AI-powered text editor
- `AIInsightsPanel` - Business insights dashboard
- `ConversationalBooking` - NLU booking widget
- Common UI primitives (Button, Card, etc.)

### @vertigo/billing

Global billing and payments platform with:
- **Invoice Management** - Multi-currency invoicing with auto-numbering
- **Payment Processing** - Stripe, PayPal, GoPay, Adyen integration
- **Bank Integration** - Fio, Wise, Revolut, Plaid, Nordigen (Open Banking)
- **Crypto Payments** - Bitcoin, Ethereum, USDC via Coinbase Commerce
- **AI Payment Matcher** - Intelligent transaction-invoice matching (85%+ accuracy)
- **Expense Management** - Receipt OCR and categorization
- **Multi-Currency** - 18+ currencies with real-time exchange rates

```typescript
import { InvoiceService, PaymentService } from '@vertigo/billing'

// Create invoice
const invoice = await InvoiceService.createInvoice({
  tenantId: 'tenant-123',
  customerId: 'customer-456',
  items: [{ description: 'Service', amount: 1000, currency: 'USD' }]
})

// Process payment
const payment = await PaymentService.processPayment({
  invoiceId: invoice.id,
  gateway: 'stripe',
  method: 'card'
})
```

See [Billing Integration Guide](./BILLING_INTEGRATION_COMPLETE.md) for detailed documentation.

## Deployment

Each vertical deploys to its own Vercel project:

| Vertical | Domain |
|----------|--------|
| Photography | shootflow.app |
| Musicians | gigbook.app |
| Fitness | fitadmin.app |
| Events | eventpro.app |
| Performing Arts | stagemanager.app |
| Team Building | teamforge.app |
| Kids Entertainment | partypal.app |

### Docker Development

```bash
# Start PostgreSQL locally
docker-compose up -d

# Access database
docker-compose exec db psql -U postgres -d vertigo
```

## Quality Standards

- TypeScript strict mode enabled
- ESLint + Prettier enforced
- 80%+ test coverage for AI modules
- E2E tests for critical user flows
- Performance: <3s initial load
- AI responses: <2s average latency

## Documentation

- [Master Development Guide](./_docs/MASTER-GUIDE.md)
- [AI Integration Guide](./_docs/AI-INTEGRATION.md)
- [Vertical Guides](./_docs/verticals/)

## Roadmap

### Completed
- [x] Stripe payment integration (@vertigo/billing)
- [x] Multi-currency invoicing support
- [x] Bank integration (Fio, Plaid, Open Banking)
- [x] Crypto payments (Coinbase Commerce)
- [x] FitAdmin - Full dashboard with AI features (90%)
- [x] GigBook - Full dashboard with AI features (95%)
  - [x] Fixed logout functionality
  - [x] Fixed user info display (real session data)
  - [x] Implemented Settings API (profile, tenant, billing, notifications)
  - [x] Implemented password change functionality
  - [x] Fixed AI routes authentication (setlist, pricing, stage-rider)
  - [x] Added Billing to navigation
- [x] TeamForge - Admin panel with AI features (80%)
- [x] ShootFlow - Core dashboard features (75%)
- [x] Prisma 7 upgrade (all apps + packages)
- [x] **Shared packages refactor** (NEW)
  - [x] @vertigo/auth - Authentication factory with multi-tenant support
  - [x] @vertigo/email - Email service with vertical themes
  - [x] @vertigo/stripe - Stripe integration with lazy loading
  - [x] Migration: fitness, photography, musicians apps

### In Progress
- [ ] Complete Kids Entertainment (PartyPal) - 65%
- [ ] Complete Events (EventPro) - 40%
- [ ] Performing Arts (StageManager) - Planning phase
- [ ] Unified admin dashboard theme

### Planned
- [ ] E2E tests with Playwright
- [ ] Mobile app (React Native)
- [ ] White-label capabilities
- [ ] Advanced analytics dashboard

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is proprietary software. All rights reserved.

---

Built with VertiGo SaaS Framework
