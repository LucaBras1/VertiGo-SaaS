# GigBook - Musicians Booking Management Platform

**Tagline:** "AI-powered booking for musicians"

GigBook is a comprehensive booking and management system designed specifically for bands, DJs, and solo musicians. It streamlines the entire gig lifecycle from inquiry to payment, with AI-powered features for setlist generation, technical riders, and pricing.

## Features

### Core Functionality
- **Gig Management** - Track inquiries, quotes, confirmed gigs, and completed shows
- **Client Management** - CRM for venues, event planners, and private clients
- **Invoicing** - Integrated billing system linked to gigs
- **Calendar** - Visual timeline of upcoming performances
- **Repertoire Database** - Organize your song catalog with metadata

### AI-Powered Features

#### 1. SetlistAI 🎵
Generate optimal setlists based on:
- Event type (wedding, corporate, party, concert, festival)
- Duration and number of sets
- Mood and energy requirements
- Audience demographics
- Your band's repertoire

**Output:**
- Detailed setlist with song order
- Timing for each song
- Energy flow visualization
- Performance notes and tips
- Contingency plans (songs to add/skip)

#### 2. StageRiderAI 🎸
Generate professional technical riders including:
- Input list with channel assignments
- Monitor requirements
- Backline specifications
- Stage dimensions and power needs
- Load-in and soundcheck timing
- Hospitality requirements

**Export formats:**
- PDF (professional formatting) - v1 basic, v2 with stage plot & logo
- Plain text
- Email-ready format

#### 5. Energy Flow Chart
Visual Recharts graph showing energy progression through a setlist:
- Energy calculated from mood (energetic=9, party=8, romantic=5, chill=3)
- BPM modifiers (<80 BPM = -2, >140 BPM = +2)
- Peak and dip detection
- Average energy analysis

#### 6. Calendar Integration
Sync gigs with external calendars:
- **Google Calendar** - OAuth2 sync with auto-refresh
- **Apple Calendar** - ICS feed URL for subscription
- Auto-sync on gig create/update/delete

#### 7. Bulk Operations
Multi-select and batch actions:
- Select all / select none
- Bulk delete with confirmation
- Bulk status change
- CSV export for Excel

#### 3. GigPriceAI 💰
Smart pricing suggestions with three tiers:
- **Economy** - Budget-friendly entry point
- **Standard** - Recommended professional rate
- **Premium** - Full-service premium offering

**Analysis includes:**
- Market rate comparison
- Event type multipliers
- Geographic considerations
- Weekend/peak season premiums
- Equipment provision premiums
- Travel cost calculations
- Negotiation tips

#### 4. MoodMatcherAI 🎧
*(Coming soon)*
- Match client's music preferences to your repertoire
- Spotify playlist analysis
- Preference-based song recommendations

## Entity Mapping

GigBook uses musician-friendly terminology:

| Generic Term | GigBook Term | Description |
|--------------|--------------|-------------|
| Performance | **Gig** | A booked performance |
| Game | **Setlist** | Song list for a performance |
| Service | **Extra** | Additional services (DJ set, lights, etc.) |
| Event | **Show** | Calendar event |
| Customer | **Client** | Booking client (venue, organizer) |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS (Purple/Blue brand colors)
- **Database:** PostgreSQL + Prisma 7 ORM
- **AI:** OpenAI GPT-4o via @vertigo/ai-core
- **Auth:** NextAuth.js (multi-tenant)
- **PDF:** @react-pdf/renderer
- **Charts:** Recharts (energy flow, revenue trends)
- **Calendar:** googleapis (Google Calendar API)
- **Email:** Resend SDK

## Database Schema

### Core Models

#### Gig
```prisma
model Gig {
  id            String
  tenantId      String
  title         String
  status        GigStatus // INQUIRY | QUOTE_SENT | CONFIRMED | COMPLETED | CANCELLED
  eventType     String?   // wedding, corporate, party, etc.
  eventDate     DateTime?

  // Musicians-specific
  repertoire    Json?    // Available songs
  setlistSongs  String[] // Selected songs
  bandMembers   Int?
  instruments   String[]
  genres        String[]

  // Technical
  stageRider       Json?
  backlineNeeded   Boolean
  soundcheckTime   DateTime?

  // Pricing
  basePrice     Int?
  travelCosts   Int?
  totalPrice    Int?

  // Relations
  setlists      Setlist[]
  extras        GigExtra[]
  invoices      Invoice[]
}
```

#### Setlist
```prisma
model Setlist {
  id            String
  name          String
  status        SetlistStatus // DRAFT | FINALIZED | PERFORMED
  gigId         String?
  totalDuration Int
  mood          String?
  songs         Json // Array of song objects
  aiGenerated   Boolean
}
```

#### RepertoireSong
```prisma
model RepertoireSong {
  id             String
  title          String
  artist         String?
  genre          String?
  mood           String? // energetic, romantic, chill, party
  duration       Int     // seconds
  key            String?
  bpm            Int?
  timesPerformed Int
  tags           String[]
}
```

#### StageRiderTemplate
```prisma
model StageRiderTemplate {
  id                 String
  name               String
  inputList          Json?  // Channel assignments
  monitorSetup       Json?
  backlineNeeds      Json?
  stagePlot          String?
  powerNeeds         String?
  soundcheckDuration Int?
}
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - OPENAI_API_KEY

# Setup database
pnpm prisma:generate
pnpm prisma:migrate

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3002`

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gigbook"

# Auth
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-secret-key"

# AI
OPENAI_API_KEY="sk-..."

# Google Calendar OAuth (for calendar sync)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3002/api/calendar/google/callback"
```

## Project Structure

```
apps/musicians/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (dashboard)/  # Main app (gigs, setlists, etc.)
│   │   ├── api/          # API routes
│   │   │   ├── calendar/ # Calendar integration endpoints
│   │   │   ├── gigs/     # Gig CRUD + bulk operations
│   │   │   └── ...
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── gigs/         # Gig-specific components
│   │   ├── setlists/     # Setlist builder
│   │   ├── charts/       # EnergyFlowChart
│   │   ├── bulk/         # BulkActionsBar
│   │   ├── calendar/     # CalendarSettings
│   │   └── ai/           # AI assistant widgets
│   ├── lib/
│   │   ├── ai/           # AI modules
│   │   │   ├── setlist-generator.ts
│   │   │   ├── stage-rider-generator.ts
│   │   │   └── gig-price-calculator.ts
│   │   ├── calendar/     # Calendar integration
│   │   │   ├── google/   # OAuth, events API
│   │   │   ├── apple/    # ICS generator
│   │   │   └── sync-service.ts
│   │   ├── pdf/          # PDF generation
│   │   │   ├── stage-rider-pdf.tsx
│   │   │   └── stage-rider-pdf-v2.tsx
│   │   ├── utils/        # Utilities
│   │   │   ├── energy.ts # Energy calculation
│   │   │   └── export.ts # CSV export
│   │   ├── prisma.ts     # Prisma client
│   │   └── utils.ts      # Helpers
│   └── hooks/            # React hooks
│       ├── useBulkSelection.ts
│       ├── useGigs.ts
│       └── ...
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── package.json
```

## API Routes

### Gigs
- `GET /api/gigs` - List gigs (with filters)
- `GET /api/gigs/[id]` - Get gig details
- `POST /api/gigs` - Create gig
- `PUT /api/gigs/[id]` - Update gig
- `DELETE /api/gigs/[id]` - Delete gig
- `POST /api/gigs/bulk` - Bulk delete gigs
- `PATCH /api/gigs/bulk` - Bulk update gig status
- `GET /api/gigs/[id]/stage-rider/pdf` - Download stage rider PDF
- `GET /api/gigs/[id]/stage-rider/pdf?v2=true` - Download enhanced PDF v2

### AI Features
- `POST /api/ai/setlist/generate` - Generate setlist
- `POST /api/ai/stage-rider/generate` - Generate tech rider
- `POST /api/ai/pricing/calculate` - Calculate gig pricing

### Repertoire
- `GET /api/repertoire` - List songs
- `POST /api/repertoire` - Add song
- `PUT /api/repertoire/[id]` - Update song
- `DELETE /api/repertoire/[id]` - Delete song
- `POST /api/repertoire/import` - Bulk import from CSV/Spotify
- `POST /api/repertoire/bulk` - Bulk delete songs

### Setlists
- `GET /api/setlists` - List setlists
- `GET /api/setlists/[id]` - Get setlist
- `POST /api/setlists` - Create setlist
- `PUT /api/setlists/[id]` - Update setlist
- `POST /api/setlists/bulk` - Bulk delete setlists
- `PATCH /api/setlists/bulk` - Bulk update setlist status

### Calendar Integration
- `GET /api/calendar/status` - Check calendar integration status
- `GET /api/calendar/google/auth` - Initiate Google OAuth flow
- `GET /api/calendar/google/callback` - OAuth callback handler
- `POST /api/calendar/google/disconnect` - Disconnect Google Calendar
- `POST /api/calendar/feed/generate` - Generate Apple Calendar ICS feed token
- `GET /api/calendar/feed/[token]` - ICS feed endpoint for Apple Calendar

### Bulk Operations
- `POST /api/clients/bulk` - Bulk delete clients
- `POST /api/invoices/bulk` - Bulk delete invoices
- `PATCH /api/invoices/bulk` - Bulk update invoice status

## User Flows

### 1. Receive Booking Inquiry
1. Client submits booking form on public site
2. System creates new Gig with status: INQUIRY
3. AI suggests pricing based on event details
4. Musician reviews and customizes quote
5. Send quote to client → status: QUOTE_SENT
6. Client accepts → status: CONFIRMED

### 2. Prepare for Gig
1. Open confirmed gig
2. Click "Generate Setlist" → AI creates custom setlist
3. Review, adjust, and finalize setlist
4. Click "Generate Tech Rider" → AI creates stage rider
5. Send tech rider to venue
6. Add to calendar with reminders

### 3. Complete Gig
1. Mark gig as COMPLETED
2. System prompts to generate invoice
3. Send invoice to client
4. AI saves successful setlist for future reference
5. Request client review/testimonial

## Branding

### Colors
- **Primary:** Deep Purple `#7C3AED`
- **Secondary:** Electric Blue `#3B82F6`
- **Accent:** Emerald Green `#059669` (success)
- **Neutral:** Slate Gray `#64748b`

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Monospace:** JetBrains Mono (for code/tech specs)

### Icons
Use `lucide-react` with music theme:
- Guitar, Music, Mic, Radio (gigs)
- List, ListMusic (setlists)
- DollarSign, CreditCard (pricing)
- Calendar, Clock (scheduling)

## Development

### Running Tests
```bash
pnpm test
```

### Type Checking
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

### Building
```bash
pnpm build
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Custom VPS
1. Build the app: `pnpm build`
2. Start production server: `pnpm start`
3. Use PM2 or similar for process management

## Roadmap

### Phase 1: MVP ✅
- [x] Project setup and structure
- [x] Database schema
- [x] AI modules (SetlistAI, StageRiderAI, GigPriceAI)
- [x] Authentication system
- [x] Gig management UI
- [x] Basic invoicing

### Phase 2: Core Features ✅
- [x] Setlist builder with drag-and-drop
- [x] Repertoire management
- [x] Client CRM
- [x] Email templates
- [x] PDF generation
- [ ] Public booking widget

### Sprint 2: Enhancements ✅
- [x] Energy Flow Chart (Recharts visualization)
- [x] Bulk Operations (multi-select, batch actions)
- [x] Calendar Integration (Google OAuth + Apple ICS)
- [x] Stage Rider PDF v2 (logo, stage plot, timeline)

### Phase 3: AI Enhancement
- [ ] MoodMatcherAI (Spotify integration)
- [ ] AI chat assistant
- [ ] Smart reminders
- [ ] Revenue prediction
- [ ] Contract generation

### Phase 4: Growth
- [ ] Mobile app (React Native)
- [x] Calendar integrations (Google, Apple) ✅
- [ ] Payment gateway (Stripe)
- [x] Analytics dashboard ✅
- [ ] Multi-band management (for agencies)

## Contributing

This is a proprietary SaaS product. Internal contributors should follow:
1. Feature branch workflow
2. Conventional commits
3. TypeScript strict mode
4. Component documentation

## License

Proprietary - All rights reserved

## Support

For questions and support:
- Documentation: `/docs`
- Email: support@gigbook.app
- Slack: #gigbook-dev

---

**Built with ❤️ for musicians by musicians**
