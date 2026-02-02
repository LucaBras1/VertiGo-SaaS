# VertiGo SaaS - Shared Core Documentation

**Version:** 2.0.0
**Last Updated:** 2026-02-02

This document describes the shared packages and components that enable parallel development across all VertiGo verticals.

---

## Architecture Overview

VertiGo SaaS is a multi-vertical platform where each vertical (fitness, photography, musicians, etc.) shares common infrastructure through the `packages/` directory while maintaining vertical-specific customizations.

```
vertigo-saas/
├── apps/                    # Vertical applications
│   ├── fitness/            # FitAdmin - Personal Trainers
│   ├── photography/        # ShootFlow - Photographers
│   ├── musicians/          # GigBook - Musicians
│   ├── events/             # EventPro - Event Planners
│   ├── team-building/      # TeamForge - Team Building
│   ├── kids-entertainment/ # PartyPal - Kids Entertainment
│   └── performing-arts/    # StageManager - Performing Arts
│
├── packages/               # Shared packages
│   ├── ai-core/           # AI infrastructure
│   ├── auth/              # Authentication (NEW)
│   ├── billing/           # Billing & subscriptions
│   ├── config/            # Shared configuration
│   ├── database/          # Database utilities
│   ├── email/             # Email service (NEW)
│   ├── stripe/            # Stripe integration (NEW)
│   └── ui/                # UI components
│
└── docs/                   # Documentation
```

---

## Shared Packages

### @vertigo/auth (NEW)

**Purpose:** Centralized authentication configuration for all verticals using NextAuth.js.

**Features:**
- NextAuth.js configuration factory with sensible defaults
- Multi-tenant support with tenant info in session
- Configurable credentials provider
- Custom password field support (`password` or `passwordHash`)
- Middleware helpers for API route protection
- Session utilities for Server Components
- Localization support (English, Czech)

**Usage:**
```typescript
// apps/[vertical]/src/lib/auth.ts
import { createAuthOptions, hashPassword, verifyPassword } from '@vertigo/auth'
import { prisma } from './prisma'

export const authOptions = createAuthOptions({
  prisma,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  schema: {
    passwordField: 'passwordHash', // or 'password'
  },
  multiTenant: {
    enabled: true,
    includeSlug: false,
  },
  locale: 'cs', // 'en' or 'cs'
})

// Password utilities
const hash = await hashPassword('secret')
const valid = await verifyPassword('secret', hash)
```

**Middleware Usage:**
```typescript
// API route protection
import { withAuth, withRole, withTenant } from '@vertigo/auth/middleware'
import { authOptions } from '@/lib/auth'

// Require authentication
export const GET = withAuth(async (req) => {
  const user = req.user // Typed as VertigoSessionUser
  return NextResponse.json({ user })
}, authOptions)

// Require specific role
export const POST = withRole(
  async (req) => { /* ... */ },
  authOptions,
  ['ADMIN', 'OWNER']
)

// Require tenant context
export const PUT = withTenant(
  async (req) => {
    const tenantId = req.tenantId
    // ...
  },
  authOptions
)
```

**Server Component Helpers:**
```typescript
import { requireAuth, requireRole, getSession } from '@vertigo/auth'
import { authOptions } from '@/lib/auth'

// In Server Component or Server Action
const session = await requireAuth(authOptions) // Throws if not authenticated
const adminSession = await requireRole(authOptions, ['ADMIN']) // Throws if wrong role
const maybeSession = await getSession(authOptions) // Returns null if not authenticated
```

**Key Files:**
- `src/config.ts` - Configuration factory
- `src/providers/credentials.ts` - Credentials provider
- `src/callbacks/` - JWT and session callbacks
- `src/middleware/` - API route protection
- `src/utils/` - Password hashing, session helpers

---

### @vertigo/email (NEW)

**Purpose:** Unified email service with vertical-specific branding and templates.

**Features:**
- Resend API integration
- Pre-built email templates (welcome, reminder, invoice, password reset)
- Vertical-specific themes with colors and branding
- Customizable sender and branding per tenant
- HTML email rendering with consistent styling
- Type-safe template parameters

**Usage:**
```typescript
// apps/[vertical]/src/lib/email.ts
import { createEmailService, VerticalTheme } from '@vertigo/email'

// Create service with vertical theme
const emailService = createEmailService({
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: 'FitAdmin <noreply@fitadmin.app>',
  theme: VerticalTheme.fitness,
})

// Send welcome email
await emailService.sendWelcome({
  to: 'user@example.com',
  userName: 'John',
  loginUrl: 'https://fitadmin.app/login',
  vertical: 'fitness',
})

// Send reminder
await emailService.sendReminder({
  to: 'client@example.com',
  subject: 'Session Tomorrow',
  clientName: 'Jane',
  reminderType: 'session',
  eventDetails: {
    title: 'Personal Training',
    date: 'Tomorrow at 10:00',
    location: 'Gym A',
  },
  actionUrl: 'https://fitadmin.app/sessions/123',
  actionLabel: 'View Session',
})

// Send invoice
await emailService.sendInvoice({
  to: 'client@example.com',
  clientName: 'Jane',
  invoiceNumber: 'INV-2026-001',
  amount: '1,500 Kč',
  dueDate: '15. 2. 2026',
  items: [
    { description: '10× Personal Training', amount: '1,500 Kč' }
  ],
  paymentUrl: 'https://fitadmin.app/pay/abc123',
  vertical: 'fitness',
})
```

**Available Themes:**
- `VerticalTheme.fitness` - Green (#10B981)
- `VerticalTheme.photography` - Amber (#F59E0B)
- `VerticalTheme.musicians` - Purple (#8B5CF6)
- `VerticalTheme.events` - Orange (#F97316)
- `VerticalTheme.kidsEntertainment` - Pink (#EC4899)
- `VerticalTheme.teamBuilding` - Blue (#0EA5E9)

**Key Files:**
- `src/service.ts` - Email service factory
- `src/templates/` - Email templates (welcome, reminder, invoice, password-reset)
- `src/branding/themes.ts` - Vertical color themes

---

### @vertigo/stripe (NEW)

**Purpose:** Stripe payment integration with checkout, payments, and webhooks.

**Features:**
- Lazy-loading Stripe client (build-time safe)
- Checkout session creation
- Payment intent management
- Refund processing
- Webhook signature verification
- Event handling with type safety
- Currency formatting utilities

**Usage:**
```typescript
// apps/[vertical]/src/lib/stripe.ts
import { getStripeClient, stripe, createCheckoutSession } from '@vertigo/stripe'

// Get client (lazy-loaded)
const stripeClient = getStripeClient()

// Or use proxy for convenience
const customer = await stripe.customers.create({ email: 'user@example.com' })

// Create checkout session
const session = await createCheckoutSession({
  lineItems: [
    {
      name: 'Personal Training Package',
      description: '10 sessions',
      amount: 15000, // in cents
      currency: 'czk',
      quantity: 1,
    }
  ],
  successUrl: 'https://app.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://app.com/cancel',
  metadata: {
    tenantId: 'tenant-123',
    packageId: 'pkg-456',
  },
  customerEmail: 'client@example.com',
})
```

**Payment Intents:**
```typescript
import { createPaymentIntent, confirmPaymentIntent, cancelPaymentIntent } from '@vertigo/stripe'

// Create payment intent
const intent = await createPaymentIntent({
  amount: 5000, // in cents
  currency: 'eur',
  metadata: { invoiceId: 'inv-123' },
})

// Confirm payment
await confirmPaymentIntent(intent.id, 'pm_card_visa')

// Cancel if needed
await cancelPaymentIntent(intent.id)
```

**Webhook Handling:**
```typescript
import { verifyWebhookSignature, handleStripeEvent } from '@vertigo/stripe'

// In API route
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  const event = verifyWebhookSignature(body, signature)

  await handleStripeEvent(event, {
    onCheckoutCompleted: async (session) => {
      // Handle successful checkout
      console.log('Checkout completed:', session.id)
    },
    onPaymentSucceeded: async (intent) => {
      // Handle successful payment
      await markInvoiceAsPaid(intent.metadata.invoiceId)
    },
    onPaymentFailed: async (intent) => {
      // Handle failed payment
      await notifyPaymentFailure(intent.metadata.invoiceId)
    },
    onSubscriptionCreated: async (subscription) => {
      // Handle new subscription
    },
  })

  return new Response('OK')
}
```

**Utilities:**
```typescript
import { formatAmount, parseAmount } from '@vertigo/stripe'

formatAmount(1500, 'CZK') // '1 500 Kč'
formatAmount(9999, 'USD') // '$99.99'
parseAmount('$99.99', 'USD') // 9999 (cents)
```

**Key Files:**
- `src/client.ts` - Lazy-loading Stripe client
- `src/checkout/` - Checkout session management
- `src/payments/` - Payment intents and refunds
- `src/webhooks/` - Webhook handling
- `src/utils/` - Currency formatting

---

### @vertigo/ai-core

**Purpose:** Centralized AI infrastructure for all verticals.

**Features:**
- OpenAI client wrapper with rate limiting
- Prompt management and templating
- Token usage tracking and cost estimation
- Caching layer for repeated queries
- Error handling and retry logic

**Usage:**
```typescript
import { createAIClient, PromptManager } from '@vertigo/ai-core'

const ai = createAIClient({
  tenantId: 'xxx',
  vertical: 'FITNESS',
})

const prompt = PromptManager.get('workout-generator', {
  clientGoals: ['weight_loss'],
  fitnessLevel: 'intermediate',
})

const result = await ai.complete(prompt)
```

**Key Files:**
- `src/client.ts` - OpenAI client wrapper
- `src/prompts/` - Vertical-specific prompt templates
- `src/cache.ts` - Response caching
- `src/usage.ts` - Token tracking

---

### @vertigo/billing

**Purpose:** Unified billing infrastructure across all verticals.

**Features:**
- Subscription management (create, pause, cancel, resume)
- Invoice generation and partial payments
- Payment gateway integrations (Stripe, PayPal, GoPay)
- Dunning (payment reminder sequences)
- Bank account synchronization
- Crypto payment support
- Multi-currency with exchange rates
- Credit notes and refunds
- Tax calculations

**Usage:**
```typescript
import { SubscriptionProcessor, InvoiceService } from '@vertigo/billing'

// Process daily billing
const processor = new SubscriptionProcessor(tenantId)
await processor.processDueBillings()

// Create invoice
const invoice = await InvoiceService.create({
  clientId,
  items: [...],
  dueDate: new Date(),
})
```

**Key Files:**
- `src/subscriptions/` - Subscription lifecycle
- `src/invoices/` - Invoice CRUD and generation
- `src/payments/` - Payment processing
- `src/dunning/` - Payment reminder automation

---

### @vertigo/database

**Purpose:** Shared database utilities and Prisma helpers.

**Features:**
- Prisma client factory with adapter support
- Multi-tenant query helpers
- Migration utilities
- Seed data generators
- Connection pooling

**Usage:**
```typescript
import { createPrismaClient, withTenant } from '@vertigo/database'

const prisma = createPrismaClient()

// Tenant-scoped queries
const clients = await withTenant(prisma, tenantId).client.findMany()
```

**Key Files:**
- `src/client.ts` - Prisma client factory
- `src/tenant.ts` - Multi-tenant helpers
- `src/migrations/` - Shared migrations

---

### @vertigo/ui

**Purpose:** Shared UI components with vertical-specific theming.

**Features:**
- Base component library (buttons, inputs, cards, modals)
- Theme system with vertical-specific colors
- Form components with validation
- Data display components (tables, charts)
- Layout components (dashboard, sidebar)
- Responsive utilities

**Usage:**
```typescript
import { Button, Card, Input } from '@vertigo/ui'
import { theme } from '@vertigo/ui/themes/fitness'

<ThemeProvider theme={theme}>
  <Card>
    <Input label="Client Name" />
    <Button variant="primary">Save</Button>
  </Card>
</ThemeProvider>
```

**Key Files:**
- `src/components/` - Base components
- `src/themes/` - Vertical color schemes
- `src/forms/` - Form utilities
- `src/layouts/` - Page layouts

---

### @vertigo/config

**Purpose:** Shared configuration and constants.

**Features:**
- Environment variable validation
- Vertical configuration (colors, names, features)
- Feature flags
- API endpoints
- Default settings

**Usage:**
```typescript
import { getVerticalConfig, validateEnv } from '@vertigo/config'

const config = getVerticalConfig('FITNESS')
// { name: 'FitAdmin', primaryColor: '#10B981', ... }

validateEnv(['DATABASE_URL', 'NEXTAUTH_SECRET'])
```

---

## Vertical Color Schemes

Each vertical has a defined color palette:

| Vertical | Primary | Secondary | Accent |
|----------|---------|-----------|--------|
| Fitness (FitAdmin) | Energetic Green (#10B981) | Dark Slate (#1E293B) | - |
| Photography (ShootFlow) | Warm Amber (#F59E0B) | Charcoal (#374151) | - |
| Musicians (GigBook) | Electric Purple (#8B5CF6) | Deep Blue (#1E3A8A) | - |
| Events (EventPro) | Professional Purple (#8B5CF6) | Vibrant Orange (#F97316) | - |
| Team Building (TeamForge) | Corporate Blue (#0EA5E9) | Trust Green (#22C55E) | - |
| Kids (PartyPal) | Playful Pink (#EC4899) | Sunny Yellow (#FACC15) | Party Purple (#A855F7) |
| Performing Arts | Stage Red (#DC2626) | Spotlight Gold (#EAB308) | - |

---

## Integration Points

### 1. Authentication (@vertigo/auth)

All verticals use the shared auth package:

```typescript
// apps/[vertical]/src/lib/auth.ts
import { createAuthOptions } from '@vertigo/auth'
import { prisma } from './prisma'

export const authOptions = createAuthOptions({
  prisma,
  pages: { signIn: '/login' },
  multiTenant: { enabled: true },
  locale: 'cs',
})
```

### 2. Email (@vertigo/email)

All verticals use the shared email service:

```typescript
// apps/[vertical]/src/lib/email.ts
import { createEmailService, VerticalTheme } from '@vertigo/email'

export const emailService = createEmailService({
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: 'App <noreply@app.com>',
  theme: VerticalTheme.fitness,
})
```

### 3. Payments (@vertigo/stripe)

Verticals with payment features use the shared Stripe package:

```typescript
// apps/[vertical]/src/lib/stripe.ts
import { getStripeClient, createCheckoutSession } from '@vertigo/stripe'

export { getStripeClient, createCheckoutSession }
```

### 4. Database Schema

Each vertical extends the base schema with vertical-specific models:

```prisma
// Base models in @vertigo/database
model Tenant { ... }
model User { ... }
model Invoice { ... }

// Vertical adds specific models
model Client {
  // Fitness-specific fields
  fitnessLevel String?
  goals        String[]
}
```

### 5. API Routes

Shared API patterns:

```typescript
// Standard CRUD pattern
// apps/[vertical]/src/app/api/[entity]/route.ts
import { withAuth } from '@vertigo/auth/middleware'
import { authOptions } from '@/lib/auth'

export const GET = withAuth(async (req) => {
  const { tenantId } = req.user
  const items = await prisma.entity.findMany({ where: { tenantId } })
  return Response.json({ data: items })
}, authOptions)
```

### 6. AI Integration

Each vertical defines its own AI prompts but uses shared infrastructure:

```typescript
// Vertical-specific prompt
const WorkoutAI = {
  id: 'workout-generator',
  vertical: 'FITNESS',
  template: `Generate a workout plan for...`,
  schema: z.object({ ... }),
}

// Register with PromptManager
PromptManager.register(WorkoutAI)

// Use via AI client
const result = await ai.complete('workout-generator', input)
```

---

## Development Workflow

### Adding a New Feature to a Vertical

1. **Check if it should be shared** - Could other verticals use this?
2. **If shared**, add to appropriate package
3. **If vertical-specific**, implement in the app

### Adding a New Shared Component

1. Create in `packages/[package]/src/`
2. Export from package index
3. Update package version
4. Import in verticals that need it

### Running Multiple Verticals

```bash
# From monorepo root
pnpm dev --filter=fitness     # Run fitness only
pnpm dev --filter=photography # Run photography only
pnpm dev                      # Run all

# Each runs on different ports:
# Fitness:     3006
# Photography: 3001
# Musicians:   3002
# Events:      3005
# Team Build:  3003
# Kids:        3004
# Performing:  3007
```

---

## Parallel Development Guidelines

### 1. Package Versioning

Use semantic versioning for shared packages. When making breaking changes:
1. Increment major version
2. Update all consuming apps
3. Document migration steps

### 2. Feature Flags

Use feature flags for gradual rollouts:

```typescript
import { isFeatureEnabled } from '@vertigo/config'

if (isFeatureEnabled('NEW_BILLING_UI')) {
  // New implementation
} else {
  // Legacy implementation
}
```

### 3. Database Migrations

- Shared migrations go in `@vertigo/database`
- Vertical-specific migrations stay in the app
- Always make migrations backwards-compatible

### 4. Testing Shared Code

```bash
# Test a specific package
pnpm test --filter=@vertigo/billing

# Test all packages
pnpm test:packages

# Test a vertical
pnpm test --filter=fitness
```

---

## Build-time Considerations

### Prisma Build-time Guard

When building without `DATABASE_URL` (e.g., in CI), use the nested proxy pattern:

```typescript
// apps/[vertical]/src/lib/prisma.ts
function createBuildTimeProxy(): PrismaClient {
  const createNestedProxy = (): unknown => {
    const handler: ProxyHandler<() => void> = {
      get(target, prop) {
        if (prop === 'then' || prop === 'catch' || typeof prop === 'symbol') {
          return undefined
        }
        if (prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve()
        }
        return createNestedProxy()
      },
      apply() {
        return Promise.reject(new Error('DATABASE_URL not set'))
      },
    }
    return new Proxy(() => {}, handler)
  }
  return createNestedProxy() as unknown as PrismaClient
}
```

### Stripe Lazy Loading

Stripe SDK validates API key at initialization. Use lazy-loading:

```typescript
// @vertigo/stripe handles this automatically
import { getStripeClient, stripe } from '@vertigo/stripe'

// Both work - stripe is a lazy proxy
const customer = await stripe.customers.create({ email: 'test@example.com' })
```

---

## Current Implementation Status

| Vertical | Status | Deployed | Notes |
|----------|--------|----------|-------|
| Fitness (FitAdmin) | 90% | fitadmin.muzx.cz | Production ready |
| Photography (ShootFlow) | 75% | - | Phase 2 in progress |
| Musicians (GigBook) | 95% | - | Production ready |
| Events (EventPro) | 40% | - | Frontend complete |
| Team Building (TeamForge) | 80% | - | CRUD + Auth complete |
| Kids (PartyPal) | 65% | - | MVP structure ready |
| Performing Arts | 10% | - | Initial setup |

---

## Package Migration Status

| Package | Version | Status | Apps Using |
|---------|---------|--------|------------|
| @vertigo/auth | 1.0.0 | ✅ Complete | fitness, photography, musicians |
| @vertigo/email | 1.0.0 | ✅ Complete | fitness, photography |
| @vertigo/stripe | 1.0.0 | ✅ Complete | fitness |
| @vertigo/ai-core | 1.0.0 | ✅ Stable | all |
| @vertigo/billing | 1.0.0 | ✅ Stable | fitness |
| @vertigo/database | 1.0.0 | ✅ Stable | all |
| @vertigo/ui | 1.0.0 | ✅ Stable | all |
| @vertigo/config | 1.0.0 | ✅ Stable | all |

---

## Contributing

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Comprehensive JSDoc comments

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with description
5. Address review feedback
6. Merge after approval

### Package Publishing

Shared packages are not published to npm - they're consumed directly via workspace references:

```json
{
  "dependencies": {
    "@vertigo/auth": "workspace:*",
    "@vertigo/email": "workspace:*",
    "@vertigo/stripe": "workspace:*",
    "@vertigo/ai-core": "workspace:*",
    "@vertigo/billing": "workspace:*"
  }
}
```

---

## Resources

- **Monorepo root:** `C:\Users\muzma\OneDrive\Data\Data\Práce\VertiGo-SaaS`
- **Deployment:** VPS at dvi12.vas-server.cz
- **Production URLs:**
  - Fitness: https://fitadmin.muzx.cz

---

**Maintained by:** VertiGo Development Team
