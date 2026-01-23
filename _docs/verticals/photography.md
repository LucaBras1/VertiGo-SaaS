# ShootFlow - Wedding/Event Photography Vertical

## Product Overview

**Name:** ShootFlow
**Tagline:** "AI assistant for photographers"
**Target:** Wedding, event, and portrait photographers
**Market Size:** $45B+ (photography services)
**Target Users:** 2M+ professional photographers globally

## Branding

- **Primary Color:** Warm Amber (#F59E0B)
- **Secondary Color:** Charcoal (#374151)
- **Icon:** Camera aperture
- **Tone:** Creative, professional, artistic

## Entity Mapping

| Core Entity | ShootFlow Name | Description |
|-------------|----------------|-------------|
| Performance | Package | Photography service package |
| Game | Addon | Additional services (album, drone, prints) |
| Service | Extra | Rush delivery, extra editing |
| Event | Shoot | Photo session/event |
| Customer | Client | Couple, family, business |

## Specific Database Fields

```prisma
model Package {
  // ... base fields from Performance

  // Photography-specific
  shotCount       Int?      // Estimated final photos
  deliveryDays    Int?      // Days until delivery
  galleryUrl      String?   // Client gallery link
  editingHours    Float?    // Estimated edit time
  styleTags       String[]  // moody, bright, documentary
  equipment       String[]  // Cameras, lenses used
  secondShooter   Boolean   @default(false)
  rawFilesIncluded Boolean  @default(false)
}

model Shoot {
  // ... base fields from Event

  // Photography-specific
  shotListId      String?   // Generated shot list
  timeline        Json?     // Day timeline
  locations       Json[]    // Multiple locations
  sunsetTime      DateTime? // For golden hour planning
  weatherForecast Json?     // Weather data
}
```

## AI Features

### 1. ShotListAI
**Purpose:** Generate comprehensive shot lists by event type

**Input:**
```typescript
{
  eventType: 'wedding' | 'portrait' | 'corporate' | 'family' | 'product',
  duration: number, // hours
  venueType: string,
  timeline: Array<{ time: string, activity: string }>,
  specialRequests: string[],
  guestCount?: number
}
```

**Output:**
```typescript
{
  categories: Array<{
    name: string, // "Getting Ready", "Ceremony", etc.
    timeWindow: string,
    shots: Array<{
      name: string,
      description: string,
      priority: 'must-have' | 'nice-to-have' | 'creative',
      tips: string,
      lighting: string
    }>
  }>,
  totalEstimatedShots: number,
  goldenHourRecommendations: string[],
  backupShotIdeas: string[]
}
```

### 2. GalleryCuratorAI (Vision)
**Purpose:** Auto-select best photos from a batch

**Input:** Array of image URLs or file paths
**Process:** Uses GPT-4 Vision to analyze:
- Technical quality (focus, exposure)
- Composition
- Emotional impact
- Variety (avoids duplicates)

**Output:**
```typescript
{
  selected: Array<{
    imageUrl: string,
    score: number,
    reasons: string[],
    category: string
  }>,
  rejected: Array<{
    imageUrl: string,
    issues: string[]
  }>,
  summary: string
}
```

### 3. StyleMatcherAI
**Purpose:** Describe photographer's style for client matching

**Input:** Sample portfolio images
**Output:**
```typescript
{
  styleDescription: string, // "Bright and airy with natural poses"
  keywords: string[],
  idealClients: string[],
  similarPhotographers: string[],
  marketingCopy: string
}
```

### 4. EditTimePredictorAI
**Purpose:** Estimate realistic editing time

**Input:**
```typescript
{
  shotCount: number,
  eventType: string,
  style: string, // editing style complexity
  cullingDone: boolean
}
```

**Output:**
```typescript
{
  estimatedHours: number,
  breakdown: {
    culling: number,
    basicEdits: number,
    advancedEdits: number,
    albumDesign: number
  },
  deliveryDate: Date,
  tips: string[]
}
```

### 5. ClientCommunicationAI
**Purpose:** Draft professional client emails

**Templates:**
- Booking confirmation
- Timeline request
- Gallery delivery
- Delay notification
- Review request

## Competitors

| Competitor | Price | Weaknesses | Our Advantage |
|------------|-------|------------|---------------|
| HoneyBook | $19-79/mo | Complex | Simpler + AI |
| Dubsado | $20-40/mo | Steep learning | Shot List AI |
| Studio Ninja | $24-50/mo | Limited | Gallery Curator |
| Sprout Studio | $17-58/mo | Basic automation | Full AI suite |
| Táve | $22-50/mo | Outdated | Modern UX |

## Key User Flows

### 1. New Booking
1. Client inquiry via website
2. AI drafts response with package suggestion
3. Send quote with contract
4. Client signs → Booking confirmed
5. AI creates questionnaire for client

### 2. Pre-Shoot Prep
1. Client fills questionnaire
2. AI generates shot list from timeline
3. Scout locations (add to map)
4. Check weather forecast
5. Pack based on shot list

### 3. Post-Shoot
1. Upload photos to system
2. AI Curator selects best shots
3. Edit selected photos
4. AI estimates delivery date
5. Send gallery to client
6. Invoice and collect payment

## Special Features

- **Gallery Preview:** Client-facing gallery page
- **Contract Module:** E-signature support
- **Questionnaire Builder:** Custom client forms
- **Timeline Builder:** Drag & drop day planner
- **Shot List Export:** PDF or Notion export

## Success Metrics

- Shot list usage >70%
- Gallery curator accuracy >85%
- Client response time <4 hours
- Booking conversion >35%
- On-time delivery >90%
