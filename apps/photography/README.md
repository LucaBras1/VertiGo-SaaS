# ShootFlow - Photography Management Platform

**Tagline:** "AI assistant for photographers"

ShootFlow is a comprehensive booking and workflow management system designed specifically for wedding, event, and portrait photographers. It streamlines the entire photography workflow from inquiry to delivery, with AI-powered features for shot list generation, photo curation, and editing time estimation.

## Features

### Core Functionality
- **Package Management** - Track inquiries, quotes, confirmed shoots, and completed packages
- **Client Management** - CRM for couples, families, and businesses
- **Invoicing** - Integrated billing system linked to packages
- **Calendar** - Visual timeline of upcoming shoots
- **Gallery System** - Client-facing photo galleries

### AI-Powered Features

#### 1. ShotListAI 📸
Generate comprehensive shot lists based on:
- Event type (wedding, portrait, corporate, family, product)
- Duration and timeline
- Venue type and lighting conditions
- Special client requests
- Key moments to capture

**Output:**
- Organized shot list by category
- Priority levels (must-have, nice-to-have, creative)
- Technical notes and tips
- Timing recommendations
- Backup shot ideas

#### 2. GalleryCuratorAI 🎨
AI-powered photo selection using GPT-4 Vision:
- Analyze technical quality (focus, exposure, composition)
- Rate emotional impact
- Identify best shots from a batch
- Avoid duplicates and near-duplicates
- Categorize by moment/scene

**Output:**
- Selected photos with quality scores
- Rejected photos with reasons
- Category breakdown
- Highlight recommendations
- Coverage analysis

#### 3. StyleMatcherAI 🌟
*(Coming soon)*
Analyze your portfolio to:
- Describe your photography style
- Generate marketing copy
- Match with ideal clients
- Identify similar photographers
- Create style keywords

#### 4. EditTimePredictorAI ⏱️
*(Coming soon)*
Realistic editing time estimates:
- Based on shot count and event type
- Culling time calculation
- Basic vs advanced editing
- Album design time
- Delivery date prediction

#### 5. ClientCommunicationAI 💬
*(Coming soon)*
Generate professional client emails:
- Booking confirmations
- Timeline requests
- Gallery delivery notifications
- Delay explanations
- Review requests

## Entity Mapping

ShootFlow uses photography-friendly terminology:

| Generic Term | ShootFlow Term | Description |
|--------------|----------------|-------------|
| Performance | **Package** | Photography service package |
| Game | **Addon** | Additional services (album, prints, drone) |
| Service | **Extra** | Rush delivery, extra editing |
| Event | **Shoot** | Photo session/event |
| Customer | **Client** | Couple, family, business |

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS (Warm Amber/Charcoal brand colors)
- **Database:** PostgreSQL + Prisma ORM
- **AI:** OpenAI GPT-4o (+ Vision) via @vertigo/ai-core
- **Auth:** NextAuth.js (multi-tenant)
- **Gallery:** Image optimization and delivery

## Database Schema

### Core Models

#### Package
```prisma
model Package {
  id            String
  tenantId      String
  title         String
  status        PackageStatus // INQUIRY | QUOTE_SENT | CONFIRMED | COMPLETED | CANCELLED
  eventType     String?       // wedding, portrait, corporate, etc.
  eventDate     DateTime?

  // Photography-specific
  shotCount        Int?       // Estimated final delivered photos
  deliveryDays     Int?       // Days until delivery after shoot
  galleryUrl       String?    // Client gallery link
  editingHours     Float?     // Estimated edit time
  styleTags        String[]   // moody, bright, documentary, artistic
  equipment        String[]   // Cameras, lenses used
  secondShooter    Boolean    @default(false)
  rawFilesIncluded Boolean    @default(false)

  // Timeline
  timeline         Json?      // Shoot day timeline

  // Pricing
  basePrice     Int?
  travelCosts   Int?
  totalPrice    Int?

  // Relations
  shoots        Shoot[]
  addons        PackageAddon[]
  invoices      Invoice[]
  shotLists     ShotList[]
}
```

#### Shoot
```prisma
model Shoot {
  id              String
  packageId       String
  date            DateTime
  startTime       String
  endTime         String

  // Photography-specific
  shotListId      String?    // Generated shot list
  timeline        Json?      // Day timeline with key moments
  locations       Json[]     // Multiple locations with addresses
  sunsetTime      DateTime?  // For golden hour planning
  weatherForecast Json?      // Weather data for planning

  // Venue details
  venueType       String?    // indoor, outdoor, mixed
  venueName       String?
  venueAddress    String?
  lightingNotes   String?

  package         Package    @relation(...)
  shotList        ShotList?  @relation(...)
  galleries       Gallery[]
}
```

#### ShotList
```prisma
model ShotList {
  id             String
  tenantId       String
  name           String
  status         ShotListStatus // DRAFT | FINALIZED | COMPLETED
  shootId        String?
  eventType      String
  aiGenerated    Boolean        @default(false)

  // Organized shot list
  sections       Json           // Array of categories with shots
  totalShots     Int
  mustHaveCount  Int

  // Metadata
  estimatedTime  Int?           // Minutes
  equipmentList  Json?
  lightingPlan   Json?
  backupPlans    Json?

  shoot          Shoot?         @relation(...)
}
```

#### Gallery
```prisma
model Gallery {
  id             String
  shootId        String
  name           String
  status         GalleryStatus  // PROCESSING | READY | DELIVERED

  // AI Curation
  totalPhotos    Int
  selectedPhotos Int
  aiCurated      Boolean        @default(false)
  curationData   Json?          // AI analysis results

  // Client access
  publicUrl      String?
  password       String?
  expiresAt      DateTime?
  downloadEnabled Boolean        @default(true)

  // Photos
  photos         GalleryPhoto[]

  shoot          Shoot          @relation(...)
}
```

#### GalleryPhoto
```prisma
model GalleryPhoto {
  id             String
  galleryId      String
  filename       String
  url            String
  thumbnailUrl   String?

  // AI Analysis
  qualityScore   Float?         // 0-100
  category       String?        // ceremony, portraits, reception, etc.
  isHighlight    Boolean        @default(false)
  aiReasoning    String?
  technicalQuality Json?        // sharpness, exposure, composition, color
  emotionalImpact Float?        // 0-10

  // Metadata
  takenAt        DateTime?
  camera         String?
  lens           String?
  settings       Json?          // aperture, shutter, ISO

  // Status
  selected       Boolean        @default(true)
  rejected       Boolean        @default(false)
  rejectionReason String?

  gallery        Gallery        @relation(...)
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

The app will be available at `http://localhost:3003`

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shootflow"

# Auth
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="your-secret-key"

# AI
OPENAI_API_KEY="sk-..."

# Storage (for galleries)
S3_BUCKET=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION=""
```

## Project Structure

```
apps/photography/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (dashboard)/  # Main app (packages, shoots, galleries)
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── packages/     # Package-specific components
│   │   ├── shot-lists/   # Shot list builder
│   │   ├── galleries/    # Gallery management
│   │   └── ai/           # AI assistant widgets
│   ├── lib/
│   │   ├── ai/           # AI modules
│   │   │   ├── shot-list-generator.ts
│   │   │   ├── gallery-curator.ts
│   │   │   ├── style-matcher.ts
│   │   │   └── edit-time-predictor.ts
│   │   ├── prisma.ts     # Prisma client
│   │   └── utils.ts      # Helpers
│   └── hooks/            # React hooks
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json
```

## API Routes

### Packages
- `GET /api/packages` - List packages (with filters)
- `GET /api/packages/[id]` - Get package details
- `POST /api/packages` - Create package
- `PUT /api/packages/[id]` - Update package
- `DELETE /api/packages/[id]` - Delete package

### AI Features
- `POST /api/ai/shot-list/generate` - Generate shot list
- `POST /api/ai/gallery/curate` - Curate photo gallery
- `POST /api/ai/style/analyze` - Analyze photography style
- `POST /api/ai/edit-time/estimate` - Estimate editing time

### Shot Lists
- `GET /api/shot-lists` - List shot lists
- `GET /api/shot-lists/[id]` - Get shot list
- `POST /api/shot-lists` - Create shot list
- `PUT /api/shot-lists/[id]` - Update shot list

### Galleries
- `GET /api/galleries` - List galleries
- `GET /api/galleries/[id]` - Get gallery
- `POST /api/galleries` - Create gallery
- `POST /api/galleries/[id]/upload` - Upload photos
- `POST /api/galleries/[id]/curate` - AI curation

## User Flows

### 1. Receive Booking Inquiry
1. Client submits booking form on public site
2. System creates new Package with status: INQUIRY
3. AI suggests shot list based on event details
4. Photographer reviews and customizes quote
5. Send quote to client → status: QUOTE_SENT
6. Client accepts → status: CONFIRMED

### 2. Prepare for Shoot
1. Open confirmed package
2. Click "Generate Shot List" → AI creates custom shot list
3. Review, adjust, and finalize shot list
4. Add timeline with key moments
5. Check weather forecast
6. Export shot list to PDF for field use

### 3. Post-Shoot Workflow
1. Upload photos to system
2. Click "AI Curation" → AI analyzes and selects best shots
3. Review AI selections (adjust as needed)
4. Edit selected photos
5. Upload edited photos to gallery
6. Send gallery link to client
7. Generate and send invoice
8. Mark package as COMPLETED

### 4. Gallery Delivery
1. Client receives gallery link
2. Client views photos online
3. Client selects favorites
4. Client downloads (if enabled)
5. Request client review/testimonial

## Branding

### Colors
- **Primary:** Warm Amber `#F59E0B`
- **Secondary:** Charcoal `#374151`
- **Accent:** Teal `#14B8A6` (success)
- **Neutral:** Stone Gray `#78716c`

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Monospace:** JetBrains Mono (for metadata)

### Icons
Use `lucide-react` with photography theme:
- Camera, Aperture, Image (packages)
- CheckSquare, List (shot lists)
- Images, FolderOpen (galleries)
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
- [x] AI modules (ShotListAI, GalleryCuratorAI)
- [ ] Authentication system
- [ ] Package management UI
- [ ] Basic invoicing

### Phase 2: Core Features
- [ ] Shot list builder with templates
- [ ] Client CRM
- [ ] Gallery system with upload
- [ ] Public gallery pages
- [ ] Email templates
- [ ] Contract module

### Phase 3: AI Enhancement
- [ ] StyleMatcherAI (portfolio analysis)
- [ ] EditTimePredictorAI
- [ ] ClientCommunicationAI
- [ ] AI chat assistant
- [ ] Smart reminders

### Phase 4: Growth
- [ ] Mobile app (React Native)
- [ ] Lightroom plugin
- [ ] Calendar integrations (Google, Apple)
- [ ] Payment gateway (Stripe)
- [ ] Analytics dashboard
- [ ] Multi-photographer studios

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
- Email: support@shootflow.app
- Slack: #shootflow-dev

---

**Built with ❤️ for photographers by photographers**
