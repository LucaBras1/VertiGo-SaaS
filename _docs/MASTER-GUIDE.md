# VertiGo SaaS - Master Development Guide

## Overview

VertiGo is a multi-vertical SaaS platform for service-based businesses. Built on a shared core with AI-powered features, it serves 7 industry verticals:

| Vertical | Product Name | Target Market |
|----------|--------------|---------------|
| Photography | ShootFlow | Wedding/Event photographers |
| Musicians | GigBook | Bands, DJs, Solo musicians |
| Fitness | FitAdmin | Personal trainers, Studios |
| Events | EventPro | Event entertainment providers |
| Performing Arts | StageManager | Theaters, Circus, Performers |
| Team Building | TeamForge | Corporate team building |
| Kids Entertainment | PartyPal | Kids party entertainers |

## Architecture

```
VertiGo-SaaS/
├── _shared-core/          # Base Next.js application
├── _docs/                 # Documentation
├── apps/                  # Vertical applications
│   ├── photography/       # ShootFlow
│   ├── musicians/         # GigBook
│   ├── fitness/           # FitAdmin
│   ├── events/            # EventPro
│   ├── performing-arts/   # StageManager
│   ├── team-building/     # TeamForge
│   └── kids-entertainment/# PartyPal
└── packages/
    ├── ui/               # Shared UI components
    ├── ai-core/          # AI utilities
    ├── database/         # Prisma schema
    └── config/           # Shared configs
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **AI:** OpenAI GPT-4o via @vertigo/ai-core
- **Monorepo:** Turborepo + pnpm
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL
- OpenAI API key

### Installation

```bash
# Clone and install
cd VertiGo-SaaS
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:push
pnpm db:generate

# Run development
pnpm dev
```

## Core Concepts

### Multi-Tenant Architecture

Each tenant (user) belongs to a specific vertical. Data is isolated via `tenant_id` field on all models.

```typescript
// Every model includes:
{
  tenant_id: string
  vertical: Vertical
}
```

### AI Integration

All AI features use the `@vertigo/ai-core` package:

```typescript
import { createAIClient } from '@vertigo/ai-core'

const ai = createAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  cache: { enabled: true },
  rateLimit: { enabled: true, requestsPerMinute: 60 }
})

const response = await ai.chat(
  [{ role: 'user', content: 'Generate a quote...' }],
  { tenantId: user.id, vertical: 'photography' }
)
```

### Entity Naming

Each vertical renames core entities:

| Core Entity | Photography | Musicians | Fitness |
|-------------|-------------|-----------|---------|
| Performance | Package | Gig | Session |
| Game | Addon | Setlist | Class |
| Service | Extra | Extra | Package |
| Event | Shoot | Show | Session |

## Development Workflow

### Creating a New Vertical

1. Copy template from `_shared-core/`
2. Update entity names in Prisma schema
3. Add vertical-specific fields
4. Create AI prompts for the vertical
5. Brand the UI (colors, icons, copy)
6. Create landing page
7. Test E2E flows

### AI Feature Development

1. Define prompt template in `packages/ai-core/src/prompts/`
2. Add Zod schema for response validation
3. Implement feature using AIClient
4. Add caching strategy
5. Write tests

## API Reference

### AI Core

```typescript
// Create client
const ai = createAIClient(config)

// Simple completion
await ai.complete(prompt, context)

// Structured response
await ai.chatStructured(messages, zodSchema, context)

// Embeddings
const embeddings = createEmbeddingService(config)
await embeddings.embed(text)
```

### Prompts

```typescript
const prompts = createPromptManager()

// Get and render a prompt
const { systemPrompt, userPrompt } = prompts.render(
  'photography',
  'shot-list-generator',
  { eventType: 'wedding', duration: '8 hours' }
)
```

## Deployment

Each vertical deploys to its own Vercel project:

- `shootflow.app` - Photography
- `gigbook.app` - Musicians
- `fitadmin.app` - Fitness
- etc.

Environment variables are managed per-project in Vercel dashboard.

## Quality Standards

- TypeScript strict mode
- ESLint + Prettier
- 80%+ test coverage for AI modules
- E2E tests for critical paths
- Performance: <3s initial load
- AI responses: <2s average

## Support

- Documentation: `/_docs/`
- Issues: GitHub Issues
- Slack: #vertigo-dev
