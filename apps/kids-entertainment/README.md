# PartyPal - Kids Entertainment Booking System

**Tagline:** "Magical moments, zero stress"

PartyPal is a specialized booking system for kids party entertainers and animators, built on the VertiGo SaaS platform.

## Overview

- **Target Market:** Kids party entertainers, animators, face painters, magicians
- **Market Size:** $5B+ kids entertainment industry
- **Target Users:** 50,000+ kids entertainers globally

## Branding

- **Primary Color:** Fun Pink (#EC4899)
- **Secondary Color:** Playful Yellow (#FACC15)
- **Accent Color:** Playful Purple (#A855F7)
- **Icon:** Balloon / Party hat
- **Tone:** Fun, magical, family-friendly, reassuring

## Entity Mapping

PartyPal adapts the core VertiGo entities with kids-party specific naming:

| Core Entity | PartyPal Name | Description |
|-------------|---------------|-------------|
| Performance | **Package** | Complete birthday party package |
| Game | **Activity** | Individual games, animations, shows |
| Service | **Extra** | Costumes, decorations, cake add-ons |
| Event | **Party** | Scheduled birthday party |
| Customer | **Parent** | Parents or organizations booking parties |

## AI Features

PartyPal includes 5 specialized AI modules:

### 1. Age Optimizer AI
- **Purpose:** Adapts program to age group characteristics
- **Age Groups:** Toddler (3-5), Kids (6-9), Tweens (10-12), Teens (13+)
- **Optimizes:** Activity duration, complexity, energy levels, supervision needs
- **Model:** GPT-4o

### 2. Safety Checker AI
- **Purpose:** Comprehensive safety and allergy risk assessment
- **Checks:** Physical safety, allergens, age appropriateness, supervision requirements
- **Ratings:** VERY_SAFE | SAFE | REQUIRES_SUPERVISION | ADULT_ONLY
- **Model:** GPT-4o

### 3. Theme Suggester AI
- **Purpose:** Suggests party themes based on child's interests
- **Considers:** Age, interests, gender preference, budget, venue, season
- **Output:** 5 themed suggestions with activities, decorations, characters
- **Model:** GPT-4o-mini

### 4. Parent Communication AI
- **Purpose:** Generates professional, friendly parent messages
- **Types:** Confirmations, reminders, updates, follow-ups, problem resolution
- **Tone:** Warm, clear, reassuring, helpful, concise
- **Model:** GPT-4o-mini

### 5. Photo Moment Predictor AI
- **Purpose:** Predicts optimal times to capture memorable photos
- **Types:** Candid, milestone, group, detail, emotional, activity shots
- **Considers:** Energy levels, lighting, activity transitions, emotional peaks
- **Model:** GPT-4o-mini

## Safety Features

PartyPal prioritizes child safety with specialized features:

### Allergy Management
- Comprehensive allergy checklist per activity
- Allergen tracking (food, latex, dyes, fragrances)
- AI-powered allergen risk assessment
- Parent allergy disclosure requirements
- Safety notes on every activity

### Age Verification
- Age-appropriate activity filtering
- Developmental appropriateness checks
- Energy level matching
- Supervision requirement indicators

### Emergency Management
- Emergency contact collection and management
- On-site contact person requirements
- Safety checklist system
- Incident reporting

### Compliance Tracking
- Entertainer background check tracking
- First aid certification management
- Insurance documentation
- Expiry date reminders

## Specialized Fields

### Package Model
```prisma
model Package {
  ageGroupMin         Int?      // Minimum age (e.g., 3)
  ageGroupMax         Int?      // Maximum age (e.g., 5)
  maxChildren         Int?      // Max participants
  themeName           String?   // "Frozen", "Superhero"
  includesCharacter   Boolean   // Character performer included
  characterName       String?   // "Elsa", "Spider-Man"
  includesCake        Boolean   // Cake included
  includesGoodybags   Boolean   // Goodybags included
  includesDecoration  Boolean   // Decorations included
  safetyNotes         String?   // Safety information
  allergens           String[]  // Common allergens
}
```

### Activity Model
```prisma
model Activity {
  ageAppropriate      String[]  // ["TODDLER_3_5", "KIDS_6_9"]
  safetyRating        String    // VERY_SAFE | SAFE | REQUIRES_SUPERVISION
  safetyNotes         String?   // Safety details
  allergensInvolved   String[]  // ["latex", "food_coloring"]
  choking_hazard      Boolean   // Choking risk flag
  energyLevel         String?   // CALM | MODERATE | HIGH | VERY_HIGH
  skillsDeveloped     String[]  // ["creativity", "teamwork"]
  setupTime           Int?      // Setup time in minutes
}
```

### Party Model
```prisma
model Party {
  childName           String?   // Birthday child's name
  childAge            Int?      // Child's age
  childInterests      String[]  // ["dinosaurs", "space"]
  allergies           String[]  // Allergy list
  dietaryRestrictions String[]  // Dietary needs
  specialNeeds        String?   // Special accommodations
  emergencyContact    Json?     // Emergency contact info
  photoMoments        Json?     // AI-predicted photo times
  feedbackRating      Int?      // Post-party rating
}
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma 7 (with `@prisma/adapter-pg`)
- **Auth:** NextAuth.js via @vertigo/auth
- **Styling:** Tailwind CSS (custom PartyPal theme)
- **AI:** OpenAI GPT-4o via @vertigo/ai-core (with fallback mode)
- **Payments:** Stripe via @vertigo/stripe
- **Email:** Resend via @vertigo/email
- **Testing:** Vitest
- **Deployment:** Vercel / VPS

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Install dependencies
cd apps/kids-entertainment
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm prisma:generate
pnpm prisma:migrate

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3002`

### Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Open Prisma Studio (database GUI)
pnpm prisma:studio
```

## Project Structure

```
apps/kids-entertainment/
├── __tests__/                  # Test files
│   ├── setup.ts                # Test setup
│   ├── mocks/                  # Mock factories
│   ├── api/                    # API route tests
│   └── ai/                     # AI feature tests
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── booking/            # Booking flow
│   │   │   └── pay/            # Payment page
│   │   ├── packages/           # Package listing/details
│   │   ├── activities/         # Activity listing/details
│   │   ├── admin/              # Admin panel
│   │   │   ├── packages/       # Package management
│   │   │   ├── activities/     # Activity management
│   │   │   ├── parties/        # Party/booking management
│   │   │   ├── invoices/       # Invoice management (with PDF/email actions)
│   │   │   ├── customers/      # Customer management
│   │   │   └── settings/       # System settings
│   │   └── api/                # API routes
│   │       ├── ai/             # AI feature endpoints
│   │       ├── health/         # Health check endpoint
│   │       ├── payments/       # Stripe payment endpoints
│   │       └── public/         # Public API
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── packages/           # Package-specific components
│   │   ├── activities/         # Activity components
│   │   ├── parties/            # Party booking components
│   │   └── admin/              # Admin panel components
│   ├── lib/                    # Utilities
│   │   ├── ai/                 # AI feature implementations
│   │   ├── prisma.ts           # Prisma client (lazy-loaded)
│   │   ├── auth.ts             # NextAuth config (lazy-loaded)
│   │   ├── email.ts            # Email templates
│   │   ├── env.ts              # Environment validation
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── DEPLOYMENT.md               # Deployment documentation
├── vitest.config.ts            # Vitest configuration
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Email System

PartyPal includes automated email notifications using @vertigo/email:

### Email Templates

| Template | Trigger | Description |
|----------|---------|-------------|
| Booking Confirmation | After booking created | Confirms reservation with details |
| Payment Receipt | After payment | Stripe receipt with invoice |
| Party Reminder | Cron (3 days before) | Reminder with checklist |
| Order Cancellation | Manual/API | Cancellation notification |
| Payment Reminder | Cron (3 days before due) | Payment reminder |
| Post-Party Feedback | Cron (1 day after) | Feedback request with link |

### Cron Jobs

Configure cron jobs for automated emails:
```bash
# Party reminders (daily at 9:00)
0 9 * * * curl -X POST https://your-domain.com/api/cron/party-reminders

# Payment reminders (daily at 10:00)
0 10 * * * curl -X POST https://your-domain.com/api/cron/payment-reminders
```

## Development Workflow

### 1. Adding a New Package
1. Create package in admin panel (`/admin/packages/new`)
2. Set age range, theme, inclusions
3. Add activities to package
4. Test AI age optimizer
5. Publish package

### 2. Creating an Activity
1. Navigate to `/admin/activities/new`
2. Fill in activity details
3. Set safety rating and allergen information
4. Assign age appropriateness
5. Run AI safety checker
6. Publish activity

### 3. Managing Bookings
1. New inquiry arrives (public form or admin creation)
2. AI suggests optimal program based on child's age
3. AI checks safety and allergens
4. Send quote to parent
5. Parent confirms booking → **Booking confirmation email sent automatically**
6. Parent is redirected to payment page (`/booking/pay?orderId=xxx`)
7. 30% deposit payment via Stripe
8. AI generates confirmation message
9. AI predicts photo moments for entertainer
10. 3 days before: **Party reminder email** (via cron)
11. Post-party: **Feedback request email** (via cron)

### 4. Payment Flow
1. Booking created → Redirect to `/booking/pay?orderId=xxx`
2. Payment page displays order summary
3. Customer clicks "Pay Deposit" → Stripe Checkout
4. On success → Return to `/booking/success`
5. On failure → Error displayed with retry option

## AI Implementation Examples

### Using Age Optimizer AI

```typescript
import { createAIClient, createPromptManager } from '@vertigo/ai-core'

export async function optimizeForAge(
  program: Activity[],
  ageGroup: AgeGroup,
  partyDetails: PartyDetails
) {
  const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  const prompts = createPromptManager()

  const { systemPrompt, userPrompt } = prompts.render(
    'kids_entertainment',
    'age-optimizer',
    {
      ageGroup,
      currentProgram: JSON.stringify(program),
      guestCount: partyDetails.guestCount,
      duration: partyDetails.duration,
      venueType: partyDetails.venueType,
    }
  )

  const response = await ai.chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    {
      tenantId: partyDetails.tenantId,
      vertical: 'kids_entertainment'
    },
    { model: 'gpt-4o' }
  )

  return JSON.parse(response.data.content)
}
```

### Using Safety Checker AI

```typescript
export async function checkSafety(
  activities: Activity[],
  partyDetails: SafetyCheckDetails
) {
  const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  const prompts = createPromptManager()

  const { systemPrompt, userPrompt } = prompts.render(
    'kids_entertainment',
    'safety-checker',
    {
      activities: JSON.stringify(activities),
      allergies: partyDetails.allergies.join(', '),
      ageRange: `${partyDetails.ageMin}-${partyDetails.ageMax}`,
      guestCount: partyDetails.guestCount,
      venueType: partyDetails.venueType,
      specialNeeds: partyDetails.specialNeeds || 'None',
    }
  )

  const response = await ai.chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    { tenantId: partyDetails.tenantId, vertical: 'kids_entertainment' },
    { model: 'gpt-4o' }
  )

  return JSON.parse(response.data.content)
}
```

## Testing

PartyPal uses Vitest for comprehensive testing.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test -- --watch

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Test Structure

```
__tests__/
├── setup.ts              # Test setup and global mocks
├── mocks/
│   └── prisma.ts         # Prisma mock with factory functions
├── api/
│   ├── bookings.test.ts  # Booking API tests (7 tests)
│   ├── invoices.test.ts  # Invoice API tests (14 tests)
│   └── parties.test.ts   # Party API tests (19 tests)
└── ai/
    └── safety-checker.test.ts  # AI safety checker tests (13 tests)
```

### Running Specific Tests

```bash
# Run API tests only
pnpm test -- __tests__/api

# Run AI tests only
pnpm test -- __tests__/ai

# Run a specific test file
pnpm test -- __tests__/api/bookings.test.ts
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Start

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Health Check

PartyPal includes a health check endpoint at `/api/health` that monitors:
- Database connectivity
- Stripe API availability
- Email service status
- AI service availability

```bash
# Check health status
curl https://your-domain.com/api/health
```

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL

Optional (for full functionality):
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Resend email API key
- `OPENAI_API_KEY` - OpenAI API key (AI features work in fallback mode without it)

## Success Metrics

- Parent satisfaction: >4.8/5 stars
- Rebooking rate: >30%
- Safety incident rate: 0%
- On-time arrival: >95%
- Photo delivery: <24 hours
- AI response time: <2 seconds

## Recent Updates (2026-02)

- **Testing Infrastructure**: Added Vitest with 53 tests covering API routes and AI features
- **Payment Page**: New `/booking/pay` page with order summary and Stripe checkout
- **Email Templates**: Added cancellation, payment reminder, and feedback emails
- **Invoice Actions**: Admin UI now has PDF download and email resend buttons
- **Health Check**: New `/api/health` endpoint for monitoring
- **Environment Validation**: Runtime validation of required environment variables
- **Lazy Loading**: Prisma and Auth now use lazy initialization for better build compatibility

## Future Enhancements

- [ ] Mobile app for entertainers
- [ ] Real-time party photo gallery
- [ ] Video highlights auto-generation
- [ ] Parent review system
- [ ] Entertainer rating system
- [ ] Multi-language support
- [ ] Gift registry integration
- [ ] Party supply marketplace

## Support

- Documentation: `/_docs/verticals/kids-entertainment.md`
- Issues: GitHub Issues
- Email: dev@partypal.com

## License

Proprietary - Part of VertiGo SaaS Platform

---

Built with love for kids and their families. 🎉🎈✨
