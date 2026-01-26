# Migration Guide: Mock Data → OpenAI Integration

## For Developers

### What Changed?

Previously, all AI modules returned **mock data**. Now they use **real OpenAI API** with graceful fallback to mock data.

### Breaking Changes

**None.** This is a backward-compatible enhancement.

- ✅ All function signatures remain the same
- ✅ All return types remain the same
- ✅ Works without any code changes
- ✅ Falls back to mock data if no API key

### Setup Steps

#### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-proj-...`)

#### 2. Add to Environment

**Development:**
```bash
# apps/musicians/.env
OPENAI_API_KEY="sk-proj-your-key-here"
```

**Production:**
Set environment variable in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Railway: Variables tab
- Docker: Add to docker-compose.yml or .env

#### 3. Restart Dev Server

```bash
cd apps/musicians
pnpm dev
```

**That's it!** The app now uses real AI.

### How to Test

#### Test with OpenAI
```bash
# Set the API key
export OPENAI_API_KEY="sk-proj-..."

# Run the app
pnpm dev

# Generate a setlist in the UI
# Check console for: [SetlistAI] Generated setlist using OpenAI
```

#### Test Fallback (Without API Key)
```bash
# Don't set OPENAI_API_KEY (or set to empty string)
unset OPENAI_API_KEY

# Run the app
pnpm dev

# Generate a setlist in the UI
# Check console for: [SetlistAI] Using mock data
```

### Code Changes (None Required)

**Before:**
```typescript
import { generateSetlist } from '@/lib/ai/setlist-generator'

const setlist = await generateSetlist(input, context)
// Returns mock data
```

**After:**
```typescript
import { generateSetlist } from '@/lib/ai/setlist-generator'

const setlist = await generateSetlist(input, context)
// Returns AI-generated data (or mock if no API key)
```

**Same code, better results.**

### New Features Available

#### Check if OpenAI is Active

```typescript
import { isOpenAIAvailable } from '@/lib/ai/openai-client'

if (isOpenAIAvailable()) {
  console.log('Using real AI')
} else {
  console.log('Using mock data')
}
```

#### Direct OpenAI Access (Advanced)

```typescript
import { generateCompletion } from '@/lib/ai/openai-client'

const response = await generateCompletion(
  'You are a helpful assistant',
  'Suggest 3 jazz songs',
  { temperature: 0.7, maxTokens: 500 }
)

if (response) {
  console.log('AI said:', response)
} else {
  console.log('API not available')
}
```

### Monitoring

#### Console Logs

**With API Key:**
```
[OpenAI] Completion successful (1234 tokens)
[SetlistAI] Generated setlist using OpenAI
```

**Without API Key:**
```
[OpenAI] OPENAI_API_KEY not set. AI features will use mock data.
[SetlistAI] Using mock data
```

**API Errors:**
```
[OpenAI] Attempt 1/3 failed: Rate limit exceeded
[OpenAI] All attempts failed. Falling back to mock data.
[SetlistAI] OpenAI generation failed, falling back to mock
```

#### Production Monitoring

**Recommended:**
1. Set up OpenAI usage dashboard: https://platform.openai.com/usage
2. Enable billing alerts
3. Monitor error rates in your logging service
4. Track token usage

### Cost Management

#### Current Costs (Jan 2025)
- Setlist: ~$0.002 per generation
- Pricing: ~$0.0005 per calculation
- Rider: ~$0.0015 per generation

#### Estimated Monthly Costs
| Users | Generations/Month | Total Cost |
|-------|-------------------|------------|
| 10 | 300 | $1.20 |
| 100 | 3,000 | $12.00 |
| 1,000 | 30,000 | $120.00 |
| 10,000 | 300,000 | $1,200.00 |

#### Cost Optimization Tips

1. **Cache Results**
   ```typescript
   // Cache setlist for 1 hour if same parameters
   const cacheKey = hash(input)
   const cached = await redis.get(cacheKey)
   if (cached) return cached
   ```

2. **Rate Limit Users**
   ```typescript
   // Limit to 10 AI generations per hour per user
   const count = await redis.incr(`ai:${userId}:count`)
   if (count > 10) throw new Error('Rate limit exceeded')
   ```

3. **Batch Requests**
   ```typescript
   // Generate multiple setlists in one request
   const setlists = await Promise.all([
     generateSetlist(input1, context),
     generateSetlist(input2, context),
   ])
   ```

### Troubleshooting

#### Problem: "OPENAI_API_KEY not set" warning

**Solution:** Add API key to `.env` file
```env
OPENAI_API_KEY="sk-proj-..."
```

#### Problem: "Authentication failed" error

**Solution:**
1. Check API key is correct (no typos)
2. Verify API key has credits: https://platform.openai.com/usage
3. Check API key isn't expired

#### Problem: "Rate limit exceeded" error

**Solution:**
1. Wait a few minutes
2. Upgrade OpenAI plan
3. Implement rate limiting in your app

#### Problem: AI responses are inconsistent

**Solution:**
1. Lower temperature (0.3-0.5 for consistency)
2. Add more specific prompts
3. Use `gpt-4o` instead of `gpt-4o-mini`

#### Problem: High costs

**Solution:**
1. Implement caching (Redis)
2. Add rate limiting per user
3. Use lower token limits
4. Consider batch processing

### Testing Changes

#### Unit Tests

```bash
cd apps/musicians
pnpm test src/lib/ai/__tests__/ai-integration.test.ts
```

Tests work both with and without API key.

#### Manual Testing

1. **Test Setlist Generator**
   - Go to `/dashboard/setlist/new`
   - Fill in event details
   - Add songs to repertoire
   - Click "Generate Setlist"
   - Check console for AI logs

2. **Test Gig Price Calculator**
   - Go to `/dashboard/gigs/new`
   - Fill in gig details
   - Click "Calculate Price"
   - Check console for AI logs

3. **Test Stage Rider Generator**
   - Go to `/dashboard/riders/new`
   - Fill in band details
   - Click "Generate Rider"
   - Check console for AI logs

### Rollback (If Needed)

If you need to rollback to mock-only mode:

**Option 1: Remove API Key**
```bash
# Just unset the environment variable
unset OPENAI_API_KEY
```

**Option 2: Force Mock Mode** (requires code change)
```typescript
// In openai-client.ts
function getOpenAIClient(): OpenAI | null {
  return null // Force mock mode
}
```

### API Key Security

**DO:**
- ✅ Store in environment variables
- ✅ Add to `.gitignore` (`.env` file)
- ✅ Use different keys for dev/production
- ✅ Rotate keys periodically
- ✅ Set spending limits in OpenAI dashboard

**DON'T:**
- ❌ Commit API keys to git
- ❌ Share API keys in Slack/email
- ❌ Use production keys in development
- ❌ Hardcode keys in source code
- ❌ Expose keys in frontend code

### Support

**Issues?**
1. Check console logs for detailed error messages
2. Verify API key is set correctly
3. Check OpenAI status: https://status.openai.com
4. Review documentation: `src/lib/ai/README.md`

**Questions?**
- Technical docs: `src/lib/ai/README.md`
- Architecture: `src/lib/ai/ARCHITECTURE.md`
- API reference: https://platform.openai.com/docs
