# GigBook AI Modules

AI-powered features for musicians using OpenAI GPT-4o-mini.

## Overview

Three AI modules are implemented:

1. **Setlist Generator** (`setlist-generator.ts`) - Creates optimal setlists based on event type, mood, and repertoire
2. **Gig Price Calculator** (`gig-price-calculator.ts`) - Calculates competitive pricing with market analysis
3. **Stage Rider Generator** (`stage-rider-generator.ts`) - Generates professional technical riders

## Setup

### 1. Install Dependencies

```bash
pnpm add openai
```

### 2. Configure Environment Variables

Add to `.env`:

```env
OPENAI_API_KEY="sk-your-api-key-here"
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Graceful Fallback

All AI modules gracefully fall back to mock/template data when:
- `OPENAI_API_KEY` is not set
- OpenAI API is unavailable
- API call fails after retries

This ensures the app works even without OpenAI configured.

## Usage

### Setlist Generator

```typescript
import { generateSetlist } from '@/lib/ai/setlist-generator'

const setlist = await generateSetlist(
  {
    eventType: 'wedding',
    duration: 240, // minutes
    numberOfSets: 3,
    breakDuration: 15,
    mood: 'mixed',
    audienceAge: '25-55',
    venueType: 'indoor',
    repertoire: [
      {
        title: 'Valerie',
        artist: 'Amy Winehouse',
        duration: 230, // seconds
        genre: 'Soul',
        mood: 'upbeat',
        bpm: 110,
        key: 'C',
      },
      // ... more songs
    ],
  },
  { tenantId: 'user-id' }
)

// Returns: Setlist with optimal song order, timing, and recommendations
```

### Gig Price Calculator

```typescript
import { calculateGigPrice } from '@/lib/ai/gig-price-calculator'

const pricing = await calculateGigPrice(
  {
    eventType: 'wedding',
    location: { city: 'Prague', country: 'CZ' },
    date: '2024-06-15',
    isWeekend: true,
    isPeakSeason: true,
    duration: 240,
    numberOfSets: 3,
    bandSize: 5,
    experienceLevel: 'professional',
    hasOwnPA: true,
    travelDistance: 50,
  },
  { tenantId: 'user-id' }
)

// Returns: Three pricing tiers (economy, standard, premium) with breakdown
```

### Stage Rider Generator

```typescript
import { generateStageRider } from '@/lib/ai/stage-rider-generator'

const rider = await generateStageRider(
  {
    bandName: 'The Blues Brothers',
    bandSize: 5,
    instruments: [
      { type: 'vocals', quantity: 2 },
      { type: 'guitar', quantity: 1 },
      { type: 'bass', quantity: 1 },
      { type: 'drums', quantity: 1 },
    ],
    venueType: 'club',
    hasOwnPA: false,
    hasBackline: false,
  },
  {
    tenantId: 'user-id',
    contactInfo: {
      name: 'Manager Name',
      phone: '+420123456789',
      email: 'manager@band.com',
    },
  }
)

// Returns: Professional technical rider with input list, backline, etc.
```

## OpenAI Client

The `openai-client.ts` module provides centralized OpenAI integration with:

- **Environment-based configuration** - Automatically detects if API key is set
- **Error handling** - Catches and logs all errors, returns null on failure
- **Retry mechanism** - Exponential backoff for transient failures
- **JSON mode** - Structured output with automatic parsing
- **Logging** - Detailed console logs for debugging

### Direct Usage

```typescript
import { generateCompletion, generateStructuredCompletion } from '@/lib/ai/openai-client'

// Simple text completion
const text = await generateCompletion(
  'You are a helpful assistant',
  'Suggest 3 song titles',
  { temperature: 0.7, maxTokens: 500 }
)

// Structured JSON response
interface SongList {
  songs: Array<{ title: string; artist: string }>
}

const songs = await generateStructuredCompletion<SongList>(
  'You are a music expert',
  'List 3 popular jazz songs',
  { temperature: 0.5 }
)
```

## Architecture

```
src/lib/ai/
├── openai-client.ts          # Centralized OpenAI integration
├── setlist-generator.ts      # Setlist AI with OpenAI + mock fallback
├── gig-price-calculator.ts   # Pricing with rule-based + AI insights
├── stage-rider-generator.ts  # Rider generation with OpenAI + template fallback
└── __tests__/
    └── ai-integration.test.ts # Integration tests
```

## Cost Optimization

- Uses **gpt-4o-mini** model (cheapest GPT-4 variant)
- Token limits set appropriately (500-3000 tokens)
- Caching can be added at the app level
- Rate limiting recommended for production

### Estimated Costs (as of Jan 2025)

GPT-4o-mini pricing:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

Estimated per request:
- Setlist: ~2000 tokens = $0.002
- Pricing: ~500 tokens = $0.0005
- Rider: ~1500 tokens = $0.0015

## Error Handling

All modules handle errors gracefully:

1. **No API key** → Mock/template data, warning logged
2. **API error** → Retry with exponential backoff (2 retries)
3. **Invalid response** → Mock/template data, error logged
4. **Rate limit** → No retry, immediate fallback

Check console logs for debugging:
- `[OpenAI]` - Client-level logs
- `[SetlistAI]` - Setlist generator logs
- `[GigPriceAI]` - Pricing calculator logs
- `[StageRiderAI]` - Rider generator logs

## Testing

Run tests with:

```bash
pnpm test src/lib/ai/__tests__/ai-integration.test.ts
```

Tests work both with and without `OPENAI_API_KEY` set.

## Future Enhancements

- [ ] Add caching layer (Redis) to reduce API calls
- [ ] Implement streaming responses for real-time generation
- [ ] Add user feedback loop to improve prompts
- [ ] Fine-tune custom model on musician-specific data
- [ ] Add multi-language support for international markets
- [ ] Implement A/B testing for different prompt strategies
- [ ] Add telemetry for monitoring AI performance
