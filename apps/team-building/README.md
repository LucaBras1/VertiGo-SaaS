# TeamForge - Team Building Vertical

> Build stronger teams with AI

TeamForge is an AI-powered management system for corporate team building companies, part of the VertiGo SaaS vertical platform.

## Overview

**Target Market:** Corporate team building providers
**Market Size:** $4B+ team building industry
**Target Users:** 30,000+ team building companies worldwide

## Branding

- **Name:** TeamForge
- **Tagline:** "Build stronger teams with AI"
- **Primary Color:** Corporate Blue (#2563EB)
- **Secondary Color:** Trust Green (#059669)
- **Tone:** Professional, results-oriented, collaborative

## Entity Mapping

TeamForge adapts the shared core schema with industry-specific terminology:

| Shared Core | TeamForge | Description |
|-------------|-----------|-------------|
| Performance | **Program** | Complete team building program with multiple activities |
| Game | **Activity** | Individual team building exercise or game |
| Service | **Extra** | Additional services (facilitation, catering, equipment) |
| Event | **Session** | Scheduled team building session with a corporate client |

## AI Features

### 1. TeamDynamicsAI
**Purpose:** Analyze team composition and suggest appropriate activities

**Inputs:**
- Team size and composition (departments, seniority, age range)
- Objectives (communication, trust, leadership, etc.)
- Physical level preferences
- Duration constraints
- Previous activities (to avoid repetition)

**Outputs:**
- Recommended activities with match scores (0-100)
- Team analysis (strengths, challenges, recommendations)
- Suggested activity sequence
- Expected outcomes for each activity

**Model:** GPT-4o-mini (fast, cost-effective)

### 2. ObjectiveMatcherAI
**Purpose:** Match corporate objectives to activities with precision

**Inputs:**
- Team objectives (standard + custom)
- Team context (size, industry, challenges)
- Available activities catalog

**Outputs:**
- Activity recommendations for each objective
- Alignment scores (0-100)
- How each activity addresses objectives
- Integration strategies
- Measurable metrics for evaluation

**Model:** GPT-4o-mini

### 3. DifficultyCalibratorAI
**Purpose:** Adjust activity difficulty based on team capabilities

**Inputs:**
- Activity details (default difficulty, rules, materials)
- Team profile (physical level, age, fitness, special needs)
- Facilitator experience level
- Target duration

**Outputs:**
- Calibrated difficulty level
- Specific adjustments (with reasoning)
- Activity modifications
- Facilitator guidance (setup tips, watch-for signals)
- Estimated completion time
- Success prediction with risk mitigation

**Model:** GPT-4o-mini

### 4. DebriefGeneratorAI
**Purpose:** Generate HR-ready post-session reports

**Inputs:**
- Session information (company, team, dates, objectives)
- Activities completed (with duration and notes)
- Facilitator observations (dynamics, highlights, challenges)
- Quantitative metrics (engagement, collaboration, etc.)

**Outputs:**
- Executive summary
- Objectives assessment (achieved/partial/not achieved)
- Key findings (strengths, growth areas, breakthroughs)
- Team dynamics analysis (communication, collaboration, leadership)
- Actionable recommendations (immediate, short-term, long-term)
- Next steps and measurement metrics
- Formatted HTML report for PDF generation

**Model:** GPT-4o (higher quality for professional reports)

## Specific Features

### Objective-Based Activity Matching
- Pre-defined objectives: Communication, Trust, Leadership, Problem-solving, Creativity, Collaboration, Conflict Resolution, Motivation
- Custom objectives support
- AI-powered matching with alignment scores
- Evidence-based recommendations

### Corporate Features
- Industry type tracking (Technology, Finance, Healthcare, etc.)
- Team composition analysis (departments, seniority levels)
- Corporate invoicing integration
- HR-ready reporting

### Scalability & Accessibility
- Activities scale from small teams to large groups
- Physical level adaptation (LOW, MEDIUM, HIGH)
- Indoor/Outdoor/Flexible location support
- Special needs accommodations

## Database Schema

### Core Models

**Program** (extends Performance)
```prisma
- teamSize, minTeamSize, maxTeamSize
- objectives[] (array of ObjectiveType)
- industryType
- physicalLevel (LOW, MEDIUM, HIGH)
- indoorOutdoor (INDOOR, OUTDOOR, BOTH, FLEXIBLE)
- duration (minutes)
- includesCatering, debriefIncluded, facilitationRequired
- pricePerPerson
```

**Activity** (extends Game)
```prisma
- minParticipants, maxParticipants, idealGroupSize
- objectives[], learningOutcomes[]
- physicalDemand, indoorOutdoor
- materialsNeeded[], facilitatorGuide
- difficultyLevel (easy, medium, hard, adaptive)
- scalable, canCombine
```

**Session** (extends Event)
```prisma
- teamSize, teamName, companyName, industryType
- objectives[], customObjectives
- debriefCompleted, debriefReport (AI-generated)
```

### Enums
- **ObjectiveType:** COMMUNICATION, TRUST, LEADERSHIP, PROBLEM_SOLVING, CREATIVITY, COLLABORATION, CONFLICT, MOTIVATION
- **PhysicalLevel:** LOW, MEDIUM, HIGH
- **IndoorOutdoor:** INDOOR, OUTDOOR, BOTH, FLEXIBLE
- **IndustryType:** TECHNOLOGY, FINANCE, HEALTHCARE, EDUCATION, etc.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (via Prisma, shared with core)
- **AI:** OpenAI GPT-4o / GPT-4o-mini (via `@vertigo/ai-core`)
- **Styling:** Tailwind CSS (blue/green theme)
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand (for client state)
- **Auth:** NextAuth.js

## Project Structure

```
apps/team-building/
├── prisma/
│   └── schema.prisma           # Extended schema with TeamForge models
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   └── (auth)/             # Auth pages
│   ├── components/             # React components
│   │   ├── programs/           # Program management
│   │   ├── activities/         # Activity catalog
│   │   ├── sessions/           # Session scheduling
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── ai/                 # AI modules
│   │   │   ├── team-dynamics.ts
│   │   │   ├── objective-matcher.ts
│   │   │   ├── difficulty-calibrator.ts
│   │   │   └── debrief-generator.ts
│   │   ├── ai-client.ts        # AI client initialization
│   │   ├── db.ts               # Prisma client
│   │   └── utils.ts            # Utilities
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and pnpm
- OpenAI API key

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
DATABASE_URL="file:../../_shared-core/prisma/dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-secret-here"
OPENAI_API_KEY="sk-..."
```

### 3. Initialize Database
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3002`

## Usage Examples

### Using AI Services

```typescript
import { getAIServices } from '@/lib/ai-client'

// Initialize AI services
const ai = getAIServices()

// 1. Analyze team and get activity recommendations
const teamAnalysis = await ai.teamDynamics.analyze(
  {
    teamSize: 25,
    objectives: ['COMMUNICATION', 'TRUST', 'COLLABORATION'],
    industryType: 'TECHNOLOGY',
    physicalLevel: 'MEDIUM',
    duration: 180, // 3 hours
  },
  availableActivities
)

// 2. Match objectives to activities
const objectiveMatches = await ai.objectiveMatcher.match(
  {
    objectives: ['Improve communication', 'Build trust'],
    teamContext: { size: 25, industry: 'TECHNOLOGY' }
  },
  availableActivities
)

// 3. Calibrate activity difficulty
const calibration = await ai.difficultyCalibrator.calibrate({
  activityId: 'activity-id',
  activityTitle: 'Trust Fall Challenge',
  defaultDifficulty: 'medium',
  teamProfile: {
    size: 25,
    physicalLevel: 'MEDIUM',
    averageAge: 35,
    ageRange: { min: 25, max: 55 },
  }
})

// 4. Generate debrief report
const report = await ai.debriefGenerator.generate({
  session: {
    id: 'session-id',
    date: '2025-01-22',
    companyName: 'Acme Corp',
    teamSize: 25,
    objectives: ['COMMUNICATION', 'TRUST']
  },
  activitiesCompleted: [
    {
      title: 'Team Trivia',
      duration: 60,
      objectives: ['COMMUNICATION'],
      participationRate: 95
    }
  ],
  facilitatorObservations: {
    teamDynamics: 'Strong collaboration, some communication gaps',
    highlights: ['Great energy', 'Creative problem-solving']
  }
})
```

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

### AI Endpoints
- `POST /api/ai/analyze-team` - TeamDynamicsAI
- `POST /api/ai/match-objectives` - ObjectiveMatcherAI
- `POST /api/ai/calibrate-difficulty` - DifficultyCalibratorAI
- `POST /api/ai/generate-debrief` - DebriefGeneratorAI

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/debrief` - Generate debrief

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Variables (Production)
```
DATABASE_URL="postgresql://..."  # PostgreSQL in production
NEXTAUTH_URL="https://teamforge.yourdomain.com"
NEXTAUTH_SECRET="production-secret"
OPENAI_API_KEY="sk-..."
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

## Development Roadmap

### Phase 1 (Current) ✅
- [x] Core entity models (Program, Activity, Extra, Session)
- [x] AI modules implementation (all 4 modules)
- [x] Landing page with branding
- [x] Database schema

### Phase 2 (Next)
- [ ] Admin dashboard (Programs, Activities, Sessions)
- [ ] Session booking workflow
- [ ] Debrief report UI with PDF export
- [ ] Customer portal

### Phase 3 (Future)
- [ ] Real-time collaboration (multi-facilitator)
- [ ] Mobile app for facilitators
- [ ] Advanced analytics dashboard
- [ ] Integration with corporate HR systems

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

**Built with ❤️ for team building professionals**
