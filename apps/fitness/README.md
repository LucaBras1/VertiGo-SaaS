# FitAdmin - Smart Management for Fitness Pros

AI-powered management platform for personal trainers, yoga instructors, and fitness studios.

## Overview

| | |
|---|---|
| **Vertical** | Fitness |
| **Target Users** | Personal trainers, yoga instructors, small studios |
| **Tagline** | "Smart management for fitness pros" |
| **Port** | 3006 |
| **Status** | ~90% Complete |

## Branding

- **Primary Color:** Energetic Green (#10B981)
- **Secondary Color:** Dark Slate (#1E293B)
- **Icon:** Dumbbell / Flex arm
- **Tone:** Motivating, professional, health-focused

## Features

### Core Features
- **Client Management** - Complete CRM with progress tracking, measurements, photo timelines
- **Smart Scheduling** - Booking management with automated reminders
- **Payments & Packages** - Session packages, memberships, Stripe integration
- **Progress Analytics** - Visual dashboards showing client improvements
- **Invoicing** - Professional invoices with payment tracking
- **Mobile Access** - Responsive interface for on-the-go management

### AI Features

| Module | Description | Location |
|--------|-------------|----------|
| **WorkoutAI** | Generates personalized training plans based on goals, equipment, injuries | `src/lib/ai/workout-generator.ts` |
| **ProgressPredictorAI** | Predicts when clients will reach their goals with milestones | `src/lib/ai/progress-predictor.ts` |
| **NutritionAdvisorAI** | Calculates TDEE, macros, meal timing, hydration | `src/lib/ai/nutrition-advisor.ts` |
| **ChurnDetectorAI** | Identifies at-risk clients with retention strategies | `src/lib/ai/churn-detector.ts` |

### Payment Integration (Stripe)

- **Package Purchases** - Buy credit packages with automatic credit addition
- **Invoice Payments** - Pay outstanding invoices online
- **Session Payments** - Pay for individual training sessions
- **Webhook Handling** - Automatic status updates and email notifications

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma 7
- **Auth:** NextAuth.js
- **Styling:** TailwindCSS
- **Payments:** Stripe
- **Email:** Resend
- **AI:** OpenAI GPT-4o with fallback
- **Testing:** Vitest

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key (optional - has fallback)
- Stripe API keys

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
pnpm prisma:migrate
pnpm prisma:generate

# Seed database (optional)
pnpm prisma:seed

# Run development server
pnpm dev
```

Open [http://localhost:3006](http://localhost:3006)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3006"

# OpenAI (optional - has fallback)
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="FitAdmin <noreply@fitadmin.app>"
```

## Project Structure

```
apps/fitness/
├── prisma/
│   ├── schema.prisma         # Database schema (30+ models)
│   └── seed.ts               # Database seeding
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup, password reset)
│   │   ├── api/              # 30+ API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── clients/      # Client management
│   │   │   ├── sessions/     # Training sessions
│   │   │   ├── classes/      # Group classes
│   │   │   ├── packages/     # Membership packages
│   │   │   ├── payments/     # Stripe integration
│   │   │   ├── billing/      # Invoicing
│   │   │   └── dashboard/    # Stats & analytics
│   │   └── dashboard/        # Dashboard pages
│   ├── components/           # 26+ React components
│   │   ├── landing/          # Landing page
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── payments/         # Payment components
│   │   └── progress/         # Progress tracking
│   ├── lib/
│   │   ├── ai/               # AI modules with tests
│   │   ├── stripe.ts         # Stripe server utilities
│   │   ├── stripe-client.ts  # Stripe client utilities
│   │   ├── email.ts          # Email service
│   │   └── prisma.ts         # Database client
│   └── generated/            # Prisma generated types
├── __tests__/                # Integration tests
│   ├── api/                  # API route tests
│   └── mocks/                # Test mocks (Prisma, OpenAI)
├── docs/                     # API documentation
│   ├── README.md             # Documentation index
│   ├── API.md                # Full API reference
│   ├── API_SUMMARY.md        # Quick reference
│   └── API_EXAMPLES.md       # Code examples
├── vitest.config.ts          # Test configuration
└── package.json
```

## Scripts

```bash
# Development
pnpm dev              # Start dev server (port 3006)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:migrate   # Run migrations
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:seed      # Seed database

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage report
pnpm test:ui          # Interactive UI
```

## Testing

Test suite with **118 tests** covering all AI modules:

| Module | Tests | Coverage |
|--------|-------|----------|
| workout-generator | 18 | ~100% |
| churn-detector | 27 | ~98% |
| nutrition-advisor | 39 | ~92% |
| progress-predictor | 34 | ~95% |

```bash
# Run tests
pnpm test

# With coverage
pnpm test:coverage
```

## API Documentation

Full API documentation available in `docs/`:

- **53 endpoints** across 13 categories
- Request/Response examples
- TypeScript types
- Error handling

See [docs/README.md](docs/README.md) for details.

## Implementation Status

### Completed (90%)

- [x] Next.js 14 project setup with App Router
- [x] Prisma 7 schema with 30+ fitness-specific models
- [x] NextAuth authentication (email/password)
- [x] Password reset flow (forgot/reset)
- [x] Landing page with hero, features, pricing
- [x] Dashboard with stats, charts, at-risk clients
- [x] Client management (CRUD, measurements, progress)
- [x] Session management (1-on-1 training)
- [x] Group classes with booking system
- [x] Package/membership management
- [x] Invoicing system with payment tracking
- [x] **AI Module: WorkoutAI** (personalized workouts)
- [x] **AI Module: ProgressPredictorAI** (goal predictions)
- [x] **AI Module: NutritionAdvisorAI** (macro calculator)
- [x] **AI Module: ChurnDetectorAI** (retention alerts)
- [x] **Stripe payments** (packages, invoices, sessions)
- [x] **API documentation** (53 endpoints)
- [x] **Unit tests** (118 tests, 90%+ coverage)
- [x] Email notifications (Resend)

### Remaining (~10%)

- [ ] E2E tests (Playwright)
- [ ] Mobile responsiveness refinement
- [ ] Push notifications
- [ ] Calendar sync (Google, Apple)
- [ ] Advanced reporting/exports
- [ ] Multi-language support (i18n)

## Database Schema

Key models:

| Model | Description |
|-------|-------------|
| `Tenant` | Multi-tenant organization |
| `User` | Users with roles (admin, trainer, user) |
| `Client` | Fitness clients with goals, measurements |
| `Session` | 1-on-1 training sessions |
| `Class` | Group fitness classes |
| `ClassBooking` | Class reservations |
| `Package` | Membership packages |
| `Invoice` | Invoices with payments |
| `ClientMeasurement` | Body measurements |
| `ProgressPhoto` | Progress photos |

Full schema in `prisma/schema.prisma`

## Integration with Shared Packages

```typescript
// @vertigo/billing - Payment processing
import { createStripeCheckout } from '@vertigo/billing'

// @vertigo/database - Shared Prisma client
import { prisma } from '@vertigo/database'

// @vertigo/ui - Shared components
import { Button, Card } from '@vertigo/ui'

// @vertigo/ai-core - AI utilities
import { createAIClient } from '@vertigo/ai-core'
```

## Success Metrics

| Metric | Target |
|--------|--------|
| Client retention | >80% |
| Workout AI usage | >70% |
| Session no-show rate | <10% |
| Average client lifespan | >6 months |
| Package renewal rate | >60% |

## Documentation

- [API Documentation](docs/README.md)
- [Stripe Integration](STRIPE_INTEGRATION.md)
- [Testing Guide](TESTING_GUIDE.md)

## License

Private - Part of VertiGo SaaS Platform

---

**Built with VertiGo SaaS Framework**
Multi-vertical SaaS platform with AI integration
