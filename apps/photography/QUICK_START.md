# ShootFlow - Quick Start Guide

Welcome to ShootFlow! This guide will help you get the photography vertical up and running.

## Prerequisites

- Node.js 18+ installed
- pnpm 8+ installed
- PostgreSQL database running
- OpenAI API key (for AI features)

## Installation Steps

### 1. Install Dependencies

```bash
# From the root of VertiGo-SaaS monorepo
pnpm install
```

### 2. Setup Environment Variables

```bash
# Navigate to photography app
cd apps/photography

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shootflow"
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="generate-a-random-secret-key"
OPENAI_API_KEY="sk-your-openai-key"
```

### 3. Setup Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# (Optional) Open Prisma Studio to inspect database
pnpm prisma:studio
```

### 4. Run Development Server

```bash
pnpm dev
```

The app will be available at: **http://localhost:3003**

## Project Structure

```
apps/photography/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page ✅
│   │   ├── layout.tsx         # Root layout ✅
│   │   ├── globals.css        # Global styles ✅
│   │   └── api/               # API routes
│   │       └── ai/            # AI endpoints ✅
│   │           ├── shot-list/generate/
│   │           ├── gallery/curate/
│   │           ├── edit-time/estimate/
│   │           └── style/analyze/
│   ├── components/            # React components
│   │   ├── shot-lists/       # Shot list components ✅
│   │   ├── galleries/        # Gallery components 🚧
│   │   ├── packages/         # Package components 🚧
│   │   └── ui/               # Reusable UI components 🚧
│   ├── lib/
│   │   ├── ai/               # AI modules ✅
│   │   │   ├── shot-list-generator.ts
│   │   │   ├── gallery-curator.ts
│   │   │   ├── style-matcher.ts
│   │   │   ├── edit-time-predictor.ts
│   │   │   └── index.ts
│   │   ├── prisma.ts         # Prisma client 🚧
│   │   └── utils.ts          # Utility functions 🚧
│   └── hooks/                # React hooks 🚧
├── prisma/
│   └── schema.prisma         # Database schema ✅
├── public/                   # Static assets 🚧
├── package.json              # Dependencies ✅
├── next.config.js            # Next.js config ✅
├── tailwind.config.js        # Tailwind config ✅
├── tsconfig.json             # TypeScript config ✅
└── README.md                 # Documentation ✅
```

Legend:
- ✅ Complete
- 🚧 In progress
- ❌ Not started

## Testing AI Modules

All AI modules have mock implementations ready for testing without OpenAI API.

### Test Shot List Generation

```bash
# Using curl
curl -X POST http://localhost:3003/api/ai/shot-list/generate \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "wedding",
    "weddingDetails": {
      "ceremony": true,
      "reception": true
    }
  }'
```

### Test Gallery Curation

```bash
curl -X POST http://localhost:3003/api/ai/gallery/curate \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {"id": "1", "url": "https://example.com/photo1.jpg", "filename": "photo1.jpg"}
    ],
    "eventType": "wedding"
  }'
```

### Test Edit Time Estimation

```bash
curl -X POST http://localhost:3003/api/ai/edit-time/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "shotCount": 500,
    "eventType": "wedding",
    "editingComplexity": "standard"
  }'
```

## Key Features

### 1. ShotListAI 📸
**Status:** Complete with mock data

Generates comprehensive shot lists for:
- Weddings (full template with getting ready, ceremony, portraits, reception)
- Portraits
- Corporate events
- Family sessions
- Product photography

**Try it:** Go to `/dashboard/shot-lists` (to be built)

### 2. GalleryCuratorAI 🎨
**Status:** Schema ready, needs GPT-4 Vision integration

Analyzes photos for:
- Technical quality (sharpness, exposure, composition)
- Emotional impact
- Category classification
- Duplicate detection

**Try it:** Upload gallery and click "AI Curation" (to be built)

### 3. EditTimePredictorAI ⏱️
**Status:** Complete with realistic calculations

Estimates editing time based on:
- Shot count
- Event type
- Editing complexity
- Photographer speed preference

**Try it:** Create package and see estimated delivery date (to be built)

### 4. StyleMatcherAI 🌟
**Status:** Schema ready, needs Vision API

Analyzes portfolio to:
- Describe photography style
- Generate marketing copy
- Match with ideal clients

**Try it:** Upload portfolio in settings (to be built)

## Next Development Steps

### Phase 1: Authentication (Week 1)
1. Set up NextAuth.js with credentials provider
2. Create login page (`/login`)
3. Create signup page (`/signup`)
4. Add protected route middleware
5. Create user session management

### Phase 2: Dashboard (Week 1-2)
1. Create dashboard layout with sidebar
2. Build package list view
3. Add package create/edit forms
4. Implement package detail page
5. Add client management

### Phase 3: Shot Lists (Week 2-3)
1. Build shot list generator form
2. Create shot list editor UI
3. Add drag-and-drop reordering
4. Implement PDF export
5. Create template library

### Phase 4: Galleries (Week 3-4)
1. Set up S3 storage
2. Build upload interface
3. Create AI curation UI
4. Add public gallery pages
5. Implement client access controls

## Database Schema Overview

### Core Tables
- **Tenant** - Multi-tenant support
- **User** - Photographer accounts
- **Client** - Client/customer records
- **Package** - Photography packages/bookings
- **Shoot** - Individual photo sessions
- **ShotList** - Generated shot lists
- **Gallery** - Photo galleries
- **GalleryPhoto** - Individual photos with AI analysis
- **Invoice** - Invoicing records

See `prisma/schema.prisma` for complete schema.

## Branding

### Colors
```css
Primary: #F59E0B (Warm Amber)
Secondary: #374151 (Charcoal)
Accent: #14B8A6 (Teal)
```

### Typography
- Font: Inter
- Headings: Bold
- Body: Regular

### Icons
Using Lucide React:
- Camera, Aperture - Photography
- CheckSquare, List - Shot lists
- Image, Images - Galleries
- Clock - Time estimation
- Sparkles - AI features

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3003)
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open Prisma Studio

# Code Quality
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript type checking
```

## Troubleshooting

### Port 3003 already in use
```bash
# Kill process on port 3003 (Windows)
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Or use different port
pnpm dev -- -p 3004
```

### Database connection error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Try running migrations again

### Prisma client not found
```bash
pnpm prisma:generate
```

### OpenAI API errors
- Check OPENAI_API_KEY is set
- Verify API key is valid
- For testing, AI modules work with mock data

## Resources

- **Documentation:** `README.md`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Vertical Spec:** `_docs/verticals/photography.md`
- **Database Schema:** `prisma/schema.prisma`
- **AI Modules:** `src/lib/ai/`

## Getting Help

- Check `IMPLEMENTATION_STATUS.md` for current progress
- Review `README.md` for feature documentation
- Look at AI module source code for implementation details
- Test API endpoints with curl or Postman

## What's Working

✅ **Landing Page** - Professional landing page with features showcase
✅ **AI Modules** - All 4 AI modules with schemas and mock data
✅ **API Routes** - AI endpoints ready for testing
✅ **Database Schema** - Complete Prisma schema
✅ **Branding** - Tailwind config with brand colors
✅ **Project Structure** - Next.js 14 with App Router

## What's Next

🚧 **Authentication** - NextAuth.js setup
🚧 **Dashboard** - Main app interface
🚧 **Package Management** - CRUD operations
🚧 **Shot List Builder** - Interactive UI
🚧 **Gallery System** - Upload and curation

---

**Ready to start?** Run `pnpm dev` and visit http://localhost:3003

**Questions?** Check the documentation or ask the team!
