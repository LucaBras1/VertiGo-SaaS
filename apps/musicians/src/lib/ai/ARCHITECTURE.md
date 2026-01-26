# AI Module Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                             │
│           (Generate Setlist / Price / Stage Rider)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Module Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │   Setlist    │  │  Gig Price   │  │  Stage Rider      │     │
│  │  Generator   │  │  Calculator  │  │   Generator       │     │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘     │
│         │                 │                    │                 │
│         │ validate input  │ validate input     │ validate input  │
│         ▼                 ▼                    ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │ Build Prompts│  │ Calculate    │  │  Build Prompts    │     │
│  │ (System +    │  │ Rule-based   │  │  (System +        │     │
│  │  User)       │  │ Pricing      │  │   User)           │     │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘     │
└─────────┼──────────────────┼───────────────────┼─────────────────┘
          │                  │                   │
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI Client Layer                           │
│                  (openai-client.ts)                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  isOpenAIAvailable()                                   │     │
│  │  ├─ Check OPENAI_API_KEY                               │     │
│  │  └─ Return boolean                                     │     │
│  └────────────────────────────────────────────────────────┘     │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Is API Key Set?                                       │     │
│  └────────┬────────────────────────────────────┬──────────┘     │
│           │ YES                                 │ NO             │
│           ▼                                     ▼                │
│  ┌──────────────────────┐            ┌──────────────────┐       │
│  │ generateCompletion() │            │  Return null     │       │
│  │ or                   │            │  (trigger        │       │
│  │ generateStructured   │            │   fallback)      │       │
│  │ Completion()         │            └──────────────────┘       │
│  └────────┬─────────────┘                                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────┐                                       │
│  │  Call OpenAI API     │                                       │
│  │  (with retry logic)  │                                       │
│  └────────┬─────────────┘                                       │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────┐                                       │
│  │  Success?            │                                       │
│  └───┬────────────────┬─┘                                       │
│      │ YES            │ NO (after retries)                      │
│      ▼                ▼                                          │
│  ┌─────────┐    ┌──────────┐                                   │
│  │ Return  │    │  Return  │                                    │
│  │ Content │    │  null    │                                    │
│  └────┬────┘    └─────┬────┘                                   │
└───────┼───────────────┼──────────────────────────────────────────┘
        │               │
        │               │
        ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Module Layer                               │
│  (continued from above)                                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Received AI Response?                                 │     │
│  └────────┬────────────────────────────────────┬──────────┘     │
│           │ YES                                 │ NO             │
│           ▼                                     ▼                │
│  ┌──────────────────────┐            ┌──────────────────┐       │
│  │ Parse & Validate     │            │  Use Fallback:   │       │
│  │ Against Zod Schema   │            │  - Mock Setlist  │       │
│  └────────┬─────────────┘            │  - Rule-based    │       │
│           │                          │    Pricing       │       │
│           ▼                          │  - Template      │       │
│  ┌──────────────────────┐            │    Rider         │       │
│  │ Valid?               │            └──────────────────┘       │
│  └───┬────────────────┬─┘                     │                 │
│      │ YES            │ NO                    │                 │
│      ▼                ▼                       │                 │
│  ┌─────────┐    ┌──────────┐                 │                 │
│  │ Return  │    │  Fallback│                 │                 │
│  │ AI Data │    │  to Mock │◄────────────────┘                 │
│  └────┬────┘    └─────┬────┘                                   │
└───────┼───────────────┼──────────────────────────────────────────┘
        │               │
        └───────┬───────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Response to User                              │
│         (Always returns valid, typed data)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. AI Module Layer
**Files:** `setlist-generator.ts`, `gig-price-calculator.ts`, `stage-rider-generator.ts`

**Responsibilities:**
- Validate user input with Zod schemas
- Build AI prompts (system + user)
- Call OpenAI Client
- Validate AI responses
- Provide fallback data
- Log operations

**Pattern:**
```typescript
export async function generateX(input, context) {
  // 1. Validate input
  const validated = Schema.parse(input)

  // 2. Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validated)

  // 3. Try OpenAI
  if (isOpenAIAvailable()) {
    try {
      const aiResponse = await generateStructuredCompletion(...)
      if (aiResponse) {
        return Schema.parse(aiResponse) // Validate
      }
    } catch (error) {
      console.error('AI failed, using fallback')
    }
  }

  // 4. Fallback
  return generateMockX(validated)
}
```

### 2. OpenAI Client Layer
**File:** `openai-client.ts`

**Responsibilities:**
- Initialize OpenAI client
- Check for API key
- Handle API calls with retry logic
- Parse JSON responses
- Error handling and logging

**Key Functions:**

#### `isOpenAIAvailable()`
```typescript
// Returns: boolean
// Checks if OPENAI_API_KEY is set
```

#### `generateCompletion()`
```typescript
// Returns: string | null
// For text completions
// Includes retry logic (2 retries, exponential backoff)
```

#### `generateStructuredCompletion<T>()`
```typescript
// Returns: T | null
// For JSON responses
// Automatically parses and types
```

## Error Flow

```
┌─────────────────┐
│  API Call       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Error Type?                    │
└───┬─────────────────────────┬───┘
    │                         │
    ▼                         ▼
┌──────────────┐     ┌──────────────────┐
│ Auth Error   │     │ Network/Timeout  │
│ (401, 429)   │     │ Error            │
└──────┬───────┘     └────────┬─────────┘
       │                      │
       │ No Retry             │ Retry 2x
       │                      │ (exponential
       │                      │  backoff)
       ▼                      ▼
┌──────────────────────────────────┐
│  Return null                     │
│  (triggers fallback in caller)   │
└──────────────────────────────────┘
```

## Data Flow Example: Setlist Generation

### 1. Input
```typescript
{
  eventType: 'wedding',
  duration: 240,
  numberOfSets: 3,
  mood: 'mixed',
  repertoire: [...]
}
```

### 2. Prompt Building
```
System: "You are an expert music programmer..."
User: "Generate a 3-set setlist for wedding..."
```

### 3. OpenAI Call
```typescript
generateStructuredCompletion<Setlist>(
  systemPrompt,
  userPrompt,
  { temperature: 0.7, maxTokens: 3000 }
)
```

### 4. Response Validation
```typescript
SetlistSchema.parse(aiResponse)
// Ensures:
// - Required fields present
// - Correct types
// - Valid enum values
```

### 5. Output
```typescript
{
  sets: [
    {
      setNumber: 1,
      songs: [...],
      energyLevel: 'medium'
    },
    ...
  ],
  totalDuration: 240,
  moodProgression: "...",
  recommendations: [...]
}
```

## Retry Strategy

```
Attempt 1: Immediate
    ↓ (fail)
Wait 1s
    ↓
Attempt 2: After 1s
    ↓ (fail)
Wait 2s
    ↓
Attempt 3: After 2s
    ↓ (fail)
Return null → Fallback
```

**Exceptions:**
- Auth errors (401): No retry
- Rate limit (429): No retry
- Invalid API key: No retry

## Token Limits

| Feature | Max Tokens | Typical Usage |
|---------|-----------|---------------|
| Setlist | 3000 | ~2000 |
| Pricing | 500 | ~300 |
| Rider | 2500 | ~1500 |

## Model Selection

**Default:** `gpt-4o-mini`

**Why?**
- Cost-effective ($0.15/$0.60 per 1M tokens)
- Fast response times
- Good quality for structured tasks
- JSON mode support

**Alternatives:**
- `gpt-4o`: Better quality, 3x cost
- `gpt-4-turbo`: More tokens, 2x cost

Configure in `openai-client.ts`:
```typescript
const model = 'gpt-4o-mini' // Change here
```

## Logging Strategy

### Success Logs
```
[OpenAI] Completion successful (1234 tokens)
[SetlistAI] Generated setlist using OpenAI
```

### Warning Logs
```
[OpenAI] OPENAI_API_KEY not set. Using mock data.
[SetlistAI] Using mock data
```

### Error Logs
```
[OpenAI] Attempt 1/3 failed: Network timeout
[OpenAI] All attempts failed. Falling back to mock data.
[SetlistAI] OpenAI generation failed, falling back to mock
```

## Type Safety

All functions are fully typed:

```typescript
// Input validation
const validated: SetlistGeneratorInput = Schema.parse(input)

// AI response typing
const aiResponse: Setlist | null = await generateStructuredCompletion<Setlist>(...)

// Output typing
function generateSetlist(...): Promise<Setlist> { ... }
```

**No `any` types used anywhere in the AI stack.**
