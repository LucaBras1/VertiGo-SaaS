# GigBook - Musicians/DJs Vertical

## Product Overview

**Name:** GigBook
**Tagline:** "AI-powered booking for musicians"
**Target:** Bands, DJs, Solo musicians, Cover bands
**Market Size:** $28B+ (live music booking)
**Target Users:** 500k+ professional musicians globally

## Branding

- **Primary Color:** Deep Purple (#7C3AED)
- **Secondary Color:** Electric Blue (#3B82F6)
- **Icon:** Guitar pick / Music note
- **Tone:** Professional, modern, musician-friendly

## Entity Mapping

| Core Entity | GigBook Name | Description |
|-------------|--------------|-------------|
| Performance | Gig | A booked performance |
| Game | Setlist | Song list for a gig |
| Service | Extra | Additional services (DJ set, sound, lights) |
| Event | Show | Calendar event |
| Customer | Client | Booking client (venue, event planner) |

## Specific Database Fields

```prisma
model Gig {
  // ... base fields from Performance

  // Musicians-specific
  repertoire      Json?     // Song[] - band's song database
  stageRider      Json?     // Technical requirements
  setlistSongs    String[]  // Selected songs for this gig
  bandMembers     Int?      // Number of performers
  instruments     String[]  // Instruments used
  genres          String[]  // Musical genres
  setDuration     Int?      // Minutes per set
  numberOfSets    Int?      // How many sets
  breakDuration   Int?      // Minutes between sets
  backlineNeeded  Boolean   @default(false)
  soundcheckTime  DateTime?
}
```

## AI Features

### 1. SetlistAI
**Purpose:** Generate optimal setlists based on event type and mood

**Input:**
```typescript
{
  eventType: 'wedding' | 'corporate' | 'party' | 'concert' | 'festival',
  duration: number, // minutes
  mood: 'energetic' | 'romantic' | 'chill' | 'mixed',
  audienceAge: string, // e.g., "25-45"
  venueType: 'indoor' | 'outdoor',
  specialRequests: string[]
}
```

**Output:**
```typescript
{
  sets: Array<{
    setNumber: number,
    duration: number,
    songs: Array<{
      title: string,
      artist: string,
      bpm: number,
      mood: string,
      notes: string
    }>
  }>,
  totalDuration: number,
  moodProgression: string,
  recommendations: string[]
}
```

### 2. StageRiderAI
**Purpose:** Generate professional tech rider documents

**Input:**
```typescript
{
  bandSize: number,
  instruments: string[],
  venueType: 'club' | 'theater' | 'outdoor' | 'corporate',
  hasPa: boolean,
  hasBackline: boolean
}
```

**Output:** Formatted tech rider with:
- Input list (channels needed)
- Monitor requirements
- Backline needs
- Stage plot description
- Power requirements

### 3. GigPriceAI
**Purpose:** Suggest competitive pricing

**Input:**
```typescript
{
  eventType: string,
  location: string,
  date: Date,
  duration: number,
  travelDistance: number,
  bandSize: number
}
```

**Output:**
```typescript
{
  economy: { price: number, features: string[] },
  standard: { price: number, features: string[] },
  premium: { price: number, features: string[] },
  marketAnalysis: string,
  recommendation: string
}
```

### 4. MoodMatcherAI
**Purpose:** Match client's music preferences to band repertoire

**Input:** Spotify playlist URL or text description
**Output:** Recommended songs from band's repertoire

## Competitors

| Competitor | Price | Weaknesses | Our Advantage |
|------------|-------|------------|---------------|
| Gigwell | $30-100/mo | For agencies | For individual bands |
| Gigplanner | €15-30/mo | Basic features | AI-powered |
| Sonicbids | $12-40/mo | Booking only | Full business suite |
| Bandsintown | Freemium | Limited tools | CRM + Invoicing |

## Key User Flows

### 1. Receive Booking Request
1. Client fills booking form on public website
2. AI suggests pricing based on details
3. Musician reviews and sends quote
4. Client accepts → Gig confirmed
5. AI offers to generate setlist

### 2. Prepare for Gig
1. Select songs for setlist (AI suggests)
2. Generate stage rider (AI creates)
3. Send tech rider to venue
4. Add to calendar with reminders

### 3. Post-Gig
1. Mark gig as completed
2. Generate invoice (linked to gig)
3. Request review from client
4. AI saves successful setlist for future reference

## UI Components

### Dashboard Widgets
- Upcoming gigs calendar
- Revenue this month
- Quote conversion rate
- AI-suggested actions

### Gig Detail Page
- Event info
- Setlist builder with AI suggestions
- Stage rider generator
- Client communication timeline
- Invoice status

## Onboarding Wizard

1. **Welcome** - Brand intro
2. **Band Profile** - Name, size, genres
3. **Repertoire Import** - Upload song list or Spotify
4. **Pricing Setup** - AI suggests based on market
5. **First Gig** - Create sample gig

## Success Metrics

- Booking conversion rate >30%
- AI setlist usage >60%
- Stage rider generation >50%
- Average time to quote <10 min
- Customer satisfaction >4.5/5
