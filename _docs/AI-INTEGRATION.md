# VertiGo AI Integration Guide

## Philosophy: Invisible Intelligence

AI should be **omnipresent but unobtrusive**. The goal is for users to say "wow, that was easy" rather than "wow, that AI is cool".

## Core AI Features (All Verticals)

### 1. AI Booking Concierge
- **Where:** Public website booking widget
- **Purpose:** Conversational booking experience
- **Model:** GPT-4o-mini (cost-effective, fast)

### 2. AI Quote Generator
- **Where:** Admin panel when creating quotes
- **Purpose:** Suggest optimal pricing
- **Model:** GPT-4o (better reasoning)

### 3. AI Communication Hub
- **Where:** Admin panel messages/emails
- **Purpose:** Draft responses, sentiment analysis
- **Model:** GPT-4o-mini

### 4. AI Business Intelligence
- **Where:** Dashboard
- **Purpose:** Revenue prediction, churn detection
- **Model:** GPT-4o (complex analysis)

### 5. AI Content Factory
- **Where:** CMS, forms
- **Purpose:** Generate descriptions, SEO optimization
- **Model:** GPT-4o-mini

## Vertical-Specific AI

### Photography (ShootFlow)

| Feature | Model | Purpose |
|---------|-------|---------|
| Shot List AI | GPT-4o | Generate shot lists by event type |
| Gallery Curator AI | GPT-4o-vision | Select best photos |
| Style Matcher AI | GPT-4o | Describe photographer's style |
| Edit Time Predictor | GPT-4o-mini | Estimate editing hours |

### Musicians (GigBook)

| Feature | Model | Purpose |
|---------|-------|---------|
| Setlist AI | GPT-4o | Generate setlists by event mood |
| Stage Rider AI | GPT-4o | Generate tech requirements |
| Mood Matcher AI | GPT-4o | Match songs to client preferences |
| Gig Price AI | GPT-4o-mini | Market-based pricing |

### Fitness (FitAdmin)

| Feature | Model | Purpose |
|---------|-------|---------|
| Workout AI | GPT-4o | Personalized training plans |
| Progress Predictor | GPT-4o | Goal achievement timeline |
| Nutrition Advisor | GPT-4o-mini | Basic nutrition tips |
| Churn Detector | GPT-4o | Early warning for at-risk clients |

## Implementation Guide

### Adding a New AI Feature

1. **Define the prompt template:**

```typescript
// packages/ai-core/src/prompts/photography.ts
export const shotListPrompt: PromptTemplate = {
  id: 'shot-list-generator',
  name: 'Shot List Generator',
  version: '1.0.0',
  vertical: 'photography',
  systemPrompt: `You are a professional wedding/event photographer assistant.
Generate comprehensive shot lists based on event type and timeline.
Include must-have shots, creative suggestions, and timing notes.`,
  userPromptTemplate: `Generate a shot list for:
Event Type: {eventType}
Duration: {duration}
Venue: {venueType}
Special Requests: {specialRequests}
Timeline: {timeline}

Format as JSON with categories and individual shots.`,
  variables: ['eventType', 'duration', 'venueType', 'specialRequests', 'timeline']
}
```

2. **Create Zod schema for response:**

```typescript
// packages/ai-core/src/schemas/photography.ts
export const ShotListSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    timeWindow: z.string(),
    shots: z.array(z.object({
      name: z.string(),
      description: z.string(),
      priority: z.enum(['must-have', 'nice-to-have', 'creative']),
      tips: z.string().optional()
    }))
  })),
  totalEstimatedShots: z.number(),
  recommendations: z.array(z.string())
})
```

3. **Implement the feature:**

```typescript
// apps/photography/src/lib/ai/shot-list.ts
import { createAIClient, createPromptManager } from '@vertigo/ai-core'
import { ShotListSchema } from '@vertigo/ai-core/schemas/photography'

export async function generateShotList(
  eventDetails: EventDetails,
  context: AIRequestContext
) {
  const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  const prompts = createPromptManager()

  const { systemPrompt, userPrompt } = prompts.render(
    'photography',
    'shot-list-generator',
    eventDetails
  )

  const response = await ai.chatStructured(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    ShotListSchema,
    context,
    { model: 'gpt-4o' }
  )

  return response.data
}
```

4. **Add API endpoint:**

```typescript
// apps/photography/src/app/api/ai/shot-list/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return unauthorized()

  const body = await request.json()

  const shotList = await generateShotList(body, {
    tenantId: session.user.id,
    vertical: 'photography'
  })

  return Response.json(shotList)
}
```

5. **Create UI component:**

```typescript
// apps/photography/src/components/ai/ShotListGenerator.tsx
'use client'

import { useState } from 'react'
import { AIAssistantWidget } from '@vertigo/ui'

export function ShotListGenerator({ eventId }: { eventId: string }) {
  const [shotList, setShotList] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const res = await fetch('/api/ai/shot-list', {
      method: 'POST',
      body: JSON.stringify({ eventId })
    })
    setShotList(await res.json())
    setLoading(false)
  }

  return (
    <AIAssistantWidget
      title="Shot List AI"
      onGenerate={generate}
      loading={loading}
      result={shotList}
    />
  )
}
```

## Cost Management

### Estimated Costs per 1000 Uses

| Feature | Model | Input Cost | Output Cost | Total |
|---------|-------|------------|-------------|-------|
| Chat AI | GPT-4o-mini | $0.15 | $0.60 | ~$0.50 |
| Quote AI | GPT-4o | $2.50 | $10.00 | ~$2.00 |
| Content Gen | GPT-4o-mini | $0.15 | $0.60 | ~$1.50 |
| Vision | GPT-4o-vision | $2.50 | $10.00 | ~$5.00 |

### Monthly Cost per User (estimated)

| Tier | Usage | Est. AI Cost |
|------|-------|--------------|
| Starter | Light | €2-5 |
| Professional | Medium | €5-15 |
| Business | Heavy | €15-30 |

### Cost Optimization Strategies

1. **Caching:** Similar requests return cached responses
2. **Model Selection:** Use mini models for simple tasks
3. **Batching:** Batch multiple requests when possible
4. **Rate Limiting:** Prevent abuse per tenant

## Testing AI Features

```typescript
// Test prompt rendering
describe('ShotListPrompt', () => {
  it('renders correctly with variables', () => {
    const prompts = createPromptManager()
    const result = prompts.render('photography', 'shot-list-generator', {
      eventType: 'wedding',
      duration: '8 hours'
    })
    expect(result.userPrompt).toContain('wedding')
  })
})

// Test response validation
describe('ShotListSchema', () => {
  it('validates correct response', () => {
    const response = { categories: [...], totalEstimatedShots: 150 }
    expect(() => ShotListSchema.parse(response)).not.toThrow()
  })
})
```

## Monitoring & Analytics

Track AI usage via UsageTracker:

```typescript
const stats = ai.getUsageStats(tenantId)
// {
//   totalRequests: 150,
//   totalTokens: 45000,
//   estimatedCostUSD: 3.50,
//   byModel: { 'gpt-4o-mini': {...}, 'gpt-4o': {...} }
// }
```

Dashboard displays:
- AI requests per day
- Token consumption
- Cost trends
- Response latency
- Cache hit rate
