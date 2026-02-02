# EventPro - Professional Event Management Platform

**Status**: ✅ **PRODUCTION READY**

EventPro is a comprehensive event management SaaS platform powered by AI, designed for professional event planners, venues, and entertainment coordinators.

## 🎨 Branding

- **Primary Color**: Professional Purple (#8b5cf6)
- **Accent Color**: Vibrant Orange (#f97316)
- **Target Audience**: Event planners, coordinators, entertainment agencies
- **Value Proposition**: AI-powered timeline optimization + seamless coordination

## ✨ Key Features

### 🤖 AI-Powered Features
- **Timeline Optimizer**: Generate optimized event schedules considering performer dependencies, setup times, and guest flow
- **Budget Optimizer**: Smart budget allocation across categories with cost-saving recommendations
- **Guest Experience Analyzer**: Predict satisfaction and get improvement suggestions

### 📅 Event Management
- Multi-event dashboard with status tracking
- Venue management with capacity and restrictions
- Client relationship management
- Task management with priorities and deadlines

### 🎭 Performer Management
- Comprehensive performer roster
- Availability tracking
- Booking coordination with call times
- Performance history and ratings

### 📊 Analytics & Reporting
- Event statistics and trends
- Budget tracking and cost analysis
- Guest satisfaction metrics
- Revenue reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials.

3. **Initialize database**:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3005](http://localhost:3005)

## 📁 Project Structure

```
apps/events/
├── prisma/
│   └── schema.prisma          # Database schema (multi-tenant)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (purple/orange branding)
│   │   ├── login/             # Authentication (NextAuth)
│   │   ├── signup/            # User registration
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth handlers
│   │   │   │   └── signup/route.ts         # Registration endpoint
│   │   │   ├── events/        # Events CRUD
│   │   │   ├── performers/    # Performers CRUD
│   │   │   ├── venues/        # Venues CRUD
│   │   │   ├── clients/       # Clients CRUD
│   │   │   ├── bookings/      # Bookings CRUD
│   │   │   ├── dashboard/stats/route.ts    # Dashboard statistics
│   │   │   └── ai/
│   │   │       ├── timeline/route.ts       # AI timeline generation
│   │   │       ├── budget/route.ts         # AI budget optimization
│   │   │       └── experience/route.ts     # AI experience analysis
│   │   └── dashboard/         # Main application
│   │       ├── layout.tsx     # Session-aware navigation
│   │       ├── page.tsx       # Dashboard overview (connected to API)
│   │       ├── events/
│   │       │   ├── page.tsx   # Events list
│   │       │   ├── new/       # Create event form
│   │       │   └── [id]/      # Event detail with tabs (Overview, Timeline, Performers, Tasks)
│   │       ├── performers/
│   │       │   ├── page.tsx   # Performers list
│   │       │   ├── new/       # Create performer form
│   │       │   └── [id]/      # Performer detail with bookings, timing, rate
│   │       ├── venues/
│   │       │   ├── page.tsx   # Venues list
│   │       │   ├── new/       # Create venue form
│   │       │   └── [id]/      # Venue detail with events, restrictions
│   │       ├── clients/
│   │       │   ├── page.tsx   # Clients list
│   │       │   ├── new/       # Create client form
│   │       │   └── [id]/      # Client detail with events, contact info
│   │       └── settings/      # User settings
│   ├── components/
│   │   ├── providers/
│   │   │   ├── session-provider.tsx  # NextAuth SessionProvider
│   │   │   └── query-provider.tsx    # React Query provider
│   │   ├── ui/
│   │   │   ├── skeleton.tsx          # Skeleton loading components
│   │   │   └── confirm-dialog.tsx    # Confirmation dialogs
│   │   ├── error-boundary.tsx        # Error boundary wrapper
│   │   ├── error-fallback.tsx        # Error UI component
│   │   └── timeline-generator.tsx    # AI timeline UI
│   ├── hooks/
│   │   ├── use-toast.ts              # Toast notifications
│   │   ├── use-confirm.ts            # Confirmation dialogs
│   │   ├── use-clients.ts            # React Query hooks for clients
│   │   ├── use-venues.ts             # React Query hooks for venues
│   │   ├── use-performers.ts         # React Query hooks for performers
│   │   └── use-events.ts             # React Query hooks for events & tasks
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client (build-time guard)
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── openai.ts          # OpenAI client (lazy loading)
│   │   └── ai/
│   │       ├── timeline-optimizer.ts        # AI timeline generation
│   │       ├── budget-optimizer.ts          # AI budget allocation
│   │       └── guest-experience-analyzer.ts # AI experience prediction
│   ├── types/
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   └── middleware.ts          # Route protection
├── package.json
├── tailwind.config.js         # Purple/orange theme
├── next.config.js
└── tsconfig.json
```

## 🗄️ Database Schema

### Core Models
- **Tenant**: Multi-tenant isolation
- **User**: Authentication and authorization
- **Event**: Event details, status, timeline
- **Performer**: Talent roster with specialties
- **Booking**: Performer-event assignments
- **Venue**: Venue details and restrictions
- **Client**: Client management
- **EventTask**: Task tracking

## 🤖 AI Modules

### 1. Timeline Optimizer (`timeline-optimizer.ts`)
Generates optimized event schedules:
- Considers performer setup/breakdown times
- Manages dependencies between acts
- Optimizes guest experience flow
- Creates contingency plans
- Generates call sheets

**Input**: Event details, performers, venue constraints
**Output**: Complete timeline with call times and contingencies

### 2. Budget Optimizer (`budget-optimizer.ts`)
Smart budget allocation:
- Industry-standard percentage distribution
- Category-wise breakdown
- Cost-saving recommendations
- Alternative scenarios
- Per-guest cost analysis

**Input**: Total budget, event type, guest count
**Output**: Detailed allocation with recommendations

### 3. Guest Experience Analyzer (`guest-experience-analyzer.ts`)
Predicts guest satisfaction:
- Analyzes entertainment mix
- Evaluates venue comfort
- Assesses logistics
- Predicts NPS score
- Suggests improvements

**Input**: Event components, venue, timing
**Output**: Satisfaction score with improvement suggestions

## 🎨 UI Components

### Landing Page
- Hero with AI badge
- Feature grid (6 features)
- How it works (4 steps)
- Social proof section
- CTA sections
- Professional footer

### Dashboard
- Overview with stats
- Upcoming events list
- Quick actions
- Task management
- Activity feed

### Events Management
- Filterable event list
- Status tracking
- Budget monitoring
- Timeline generation

### Performers Management
- Visual performer cards
- Rating system
- Booking interface
- Contact management

### Detail & Create Pages
All entities have full CRUD pages with:
- **Create Forms**: Validated forms with react-hook-form + Zod
- **Detail Pages**: Complete entity info with related data
- **Edit Modals**: In-page editing without navigation
- **Delete Confirmation**: Safe deletion with confirmation dialogs

#### Client Pages
- Create form with contact info, client type, tags
- Detail page with events list, contact info, summary stats

#### Venue Pages
- Create form with type selector (indoor/outdoor/mixed), capacity, timing
- Detail page with restrictions, events, contact info

#### Performer Pages
- Create form with type badges (fire, magic, circus, music, dance, comedy, interactive)
- Detail page with bio, specialties, timing info, bookings history, rate card

#### Event Detail Page
- **Overview Tab**: Event info, venue/client links, budget progress, performers summary
- **Timeline Tab**: AI timeline generator integration
- **Performers Tab**: Booked performers with call times, rates, contract status
- **Tasks Tab**: Task checklist with add/toggle functionality

### UX/UI Enhancements
- **Toast Notifications**: Global feedback system with react-hot-toast
- **Skeleton Loading**: Animated placeholders during data loading
- **Error Boundaries**: Graceful error handling with retry functionality
- **Confirmation Dialogs**: Safe delete operations with user confirmation
- **React Query**: Server state management with caching and invalidation

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with tenant creation
- `POST /api/auth/[...nextauth]` - NextAuth handlers (login, logout, session)

### Events
- `GET/POST /api/events` - List and create events
- `GET/PATCH/DELETE /api/events/[id]` - Event details, update, delete
- `GET/POST /api/events/[id]/tasks` - Event task management

### Performers
- `GET/POST /api/performers` - List and create performers
- `GET/PATCH/DELETE /api/performers/[id]` - Performer details, update, delete

### Venues
- `GET/POST /api/venues` - List and create venues
- `GET/PATCH/DELETE /api/venues/[id]` - Venue details, update, delete

### Clients
- `GET/POST /api/clients` - List and create clients
- `GET/PATCH/DELETE /api/clients/[id]` - Client details, update, delete

### Bookings
- `GET/POST /api/bookings` - List and create bookings
- `GET/PATCH/DELETE /api/bookings/[id]` - Booking details, update, delete

### Dashboard & AI
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/ai/timeline` - Generate optimized timeline
- `POST /api/ai/budget` - Budget optimization
- `POST /api/ai/experience` - Guest experience analysis

## 🔐 Authentication

Authentication is handled via NextAuth.js with:
- Email/password login (credentials provider)
- JWT strategy with 30-day sessions
- Multi-tenant support (tenantId in session)
- Route protection via middleware

## 📱 Responsive Design

Fully responsive across:
- Desktop (1024px+)
- Tablet (640px - 1024px)
- Mobile (< 640px)

## 🚢 Deployment

### Build for production:
```bash
npm run build
```

### Database migrations:
```bash
npm run prisma:migrate
```

### Environment setup:
- Set `NODE_ENV=production`
- Configure `DATABASE_URL`
- Set `NEXTAUTH_SECRET`
- Add `OPENAI_API_KEY` for AI features

## 🔧 Configuration

### Tailwind Theme
Purple/orange color scheme configured in `tailwind.config.js`

### Next.js Config
- Transpiles shared packages
- Image optimization enabled
- Port: 3005

## 📄 License

Part of VertiGo SaaS Platform
© 2024 VertiGo. All rights reserved.

## 🤝 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@eventpro.com

---

**Built with**: Next.js 14, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, React Query, react-hook-form, Zod
