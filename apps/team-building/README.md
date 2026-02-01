# TeamForge - Team Building Vertical

> Build stronger teams with AI

TeamForge is an AI-powered management system for corporate team building companies, part of the VertiGo SaaS vertical platform.

## Overview

**Target Market:** Corporate team building providers
**Market Size:** $4B+ team building industry
**Target Users:** 30,000+ team building companies worldwide
**Status:** Production Ready (100% Complete)

## Branding

- **Name:** TeamForge
- **Tagline:** "Build stronger teams with AI"
- **Primary Color:** Corporate Blue (#0EA5E9)
- **Secondary Color:** Trust Green (#22C55E)
- **Tone:** Professional, results-oriented, collaborative

## Features

### Landing Page
- Hero section with gradient background
- AI-powered features showcase (4 AI modules)
- 3-tier pricing (Starter $49, Professional $149, Enterprise $399)
- Mobile navigation with slide-out menu
- Responsive design (320px - 1920px)

### Admin Dashboard
- Programs management (CRUD with activity linking)
- Activities management (objectives, difficulty, duration)
- Sessions management (with AI debrief generation)
- Customers management (CRM with organization tracking)
- Reports & analytics (Recharts + PDF export)
- Settings (site info, contact, company details)

### Email Integration
- Session confirmation emails
- AI debrief delivery emails
- Welcome emails for new customers
- Invoice emails with line items
- Powered by Resend SDK

### AI Features

#### 1. TeamDynamicsAI
Analyze team composition and suggest appropriate activities based on size, objectives, physical level, and duration constraints.

#### 2. ObjectiveMatcherAI
Match corporate objectives to activities with precision scoring and evidence-based recommendations.

#### 3. DifficultyCalibratorAI
Adjust activity difficulty based on team's physical capabilities, age range, and experience level.

#### 4. DebriefGeneratorAI
Generate HR-ready post-session reports with executive summaries, key findings, and actionable recommendations.

## Entity Mapping

TeamForge adapts the shared core schema with industry-specific terminology:

| Shared Core | TeamForge | Description |
|-------------|-----------|-------------|
| Performance | **Program** | Complete team building program with multiple activities |
| Game | **Activity** | Individual team building exercise or game |
| Service | **Extra** | Additional services (facilitation, catering, equipment) |
| Event | **Session** | Scheduled team building session with a corporate client |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma 7)
- **AI:** OpenAI GPT-4o / GPT-4o-mini (via `@vertigo/ai-core`)
- **Styling:** Tailwind CSS (blue/green theme)
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand (for client state)
- **Auth:** NextAuth.js
- **Email:** Resend SDK
- **Charts:** Recharts
- **PDF:** jsPDF + jspdf-autotable
- **UI:** HeadlessUI (mobile menu), Lucide React (icons)

## Project Structure

```
apps/team-building/
├── prisma/
│   └── schema.prisma           # Extended schema with TeamForge models
├── scripts/
│   └── create-admin.ts         # Admin user creation script
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page (pricing, features)
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── login/          # Login page
│   │   │   ├── programs/       # Programs management
│   │   │   ├── activities/     # Activities management
│   │   │   ├── sessions/       # Sessions management
│   │   │   ├── customers/      # Customers management
│   │   │   ├── orders/         # Orders management
│   │   │   ├── invoices/       # Invoices management
│   │   │   ├── reports/        # Reports & analytics
│   │   │   └── settings/       # Application settings
│   │   └── api/                # API routes
│   │       ├── auth/           # NextAuth handlers
│   │       ├── programs/       # Programs CRUD
│   │       ├── activities/     # Activities CRUD
│   │       ├── sessions/       # Sessions CRUD
│   │       ├── customers/      # Customers CRUD
│   │       ├── orders/         # Orders CRUD
│   │       ├── invoices/       # Invoices CRUD
│   │       └── ai/             # AI endpoints
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── landing/            # Landing page components
│   │   │   └── Navigation.tsx  # Mobile navigation
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       ├── auth.ts             # NextAuth configuration
│       ├── db.ts               # Prisma client
│       ├── email.ts            # Resend email service
│       ├── ai-client.ts        # AI client initialization
│       └── utils.ts            # Utilities
├── .env.example                # Environment variables template
├── .eslintrc.json              # ESLint configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── SETUP.md                    # Setup guide
├── IMPLEMENTATION_STATUS.md    # Development status
├── COMPLETION_REPORT.md        # Completion report
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- OpenAI API key
- Resend API key (for email features)

### 1. Install Dependencies
```bash
cd apps/team-building
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/teamforge"

# NextAuth
NEXTAUTH_URL="http://localhost:3009"
NEXTAUTH_SECRET="your-secret-here"

# Admin User
ADMIN_EMAIL="admin@teamforge.local"
ADMIN_PASSWORD="admin123"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="TeamForge <noreply@teamforge.ai>"
```

### 3. Initialize Database
```bash
pnpm prisma generate
pnpm prisma migrate dev
npx tsx scripts/create-admin.ts
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3009`

## API Endpoints

### Programs
- `GET /api/programs` - List all programs
- `GET /api/programs/:id` - Get program details
- `POST /api/programs` - Create program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Activities
- `GET /api/activities` - List activities
- `GET /api/activities/:id` - Get activity
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session (with optional email notification)
- `GET /api/sessions/:id` - Get session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### AI Endpoints
- `POST /api/ai/analyze-team` - TeamDynamicsAI
- `POST /api/ai/match-objectives` - ObjectiveMatcherAI
- `POST /api/ai/calibrate-difficulty` - DifficultyCalibratorAI
- `POST /api/ai/generate-debrief` - DebriefGeneratorAI (with optional email)

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Email Templates

TeamForge includes 4 email templates powered by Resend:

| Template | Trigger | Description |
|----------|---------|-------------|
| `sendWelcomeEmail` | Customer registration | Welcome with login link |
| `sendSessionConfirmationEmail` | Session creation | Booking confirmation with details |
| `sendDebriefEmail` | Debrief generation | AI report delivery with key insights |
| `sendInvoiceEmail` | Invoice creation | Invoice with line items and payment info |

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://teamforge.yourdomain.com"
NEXTAUTH_SECRET="production-secret"
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
EMAIL_FROM="TeamForge <noreply@teamforge.ai>"
```

## Monitoring & Analytics

### AI Usage Tracking
All AI calls are automatically tracked in the `AIUsage` table:
- Feature used
- Model and token usage
- Cost estimation
- Latency metrics

### Querying AI Usage
```typescript
import { prisma } from '@/lib/db'

// Get AI usage for a session
const usage = await prisma.aIUsage.findMany({
  where: { sessionId: 'session-id' }
})

// Get cost by feature
const costByFeature = await prisma.aIUsage.groupBy({
  by: ['feature'],
  _sum: { estimatedCost: true }
})
```

## Development Status

### Completed (100%)
- [x] Infrastructure & configuration
- [x] Database schema (Prisma 7 + PostgreSQL)
- [x] Authentication (NextAuth.js)
- [x] Admin dashboard with all CRUD operations
- [x] AI integration (all 4 modules)
- [x] Landing page with pricing
- [x] Mobile navigation
- [x] Email integration (Resend)
- [x] Reports & analytics (Recharts + PDF export)

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed status.

## Contributing

This is a vertical within the VertiGo SaaS monorepo. See main repo for contribution guidelines.

## License

Proprietary - Part of VertiGo SaaS platform

## Support

For questions or issues:
- Email: support@teamforge.ai
- Documentation: https://docs.teamforge.ai
- Community: https://community.teamforge.ai

---

**Built with love for team building professionals**
