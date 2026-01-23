# StageManager - Performing Arts Vertical

## Product Overview

**Name:** StageManager
**Tagline:** "Manage your art, not paperwork"
**Target:** Theaters, circus companies, touring performers
**Market Size:** $15B+ performing arts
**Target Users:** 100k+ performing arts companies

## Branding

- **Primary Color:** Theater Red (#DC2626)
- **Secondary Color:** Curtain Purple (#7C3AED)
- **Icon:** Theater masks / Stage curtain
- **Tone:** Artistic, sophisticated, theatrical

## Entity Mapping

| Core Entity | StageManager Name | Description |
|-------------|-------------------|-------------|
| Performance | Production | Theater show/performance |
| Game | Workshop | Educational workshop |
| Service | Service | Consulting, rental |
| Event | Show | Scheduled performance |

## AI Features

1. **AudienceAnalyzer** - Match shows to target audiences
2. **TechRiderAI** - Generate technical requirements
3. **SchoolMatcher** - Match shows to school curricula
4. **ReviewAggregator** - Analyze reviews and feedback

## Specific Fields

```prisma
model Production {
  genre           String[]  // drama, comedy, kids
  ageRecommendation String? // 3+, 6+, 12+
  duration        Int?      // minutes
  intermission    Boolean   @default(false)
  castSize        Int?
  crewNeeded      Int?
  stageRequirements Json?
  educationalThemes String[]
  premiereDate    DateTime?
  tourDates       Json[]
}
```

## Key Differentiators

- School booking integration
- Educational curriculum matching
- Tour scheduling
- Cast/crew management
