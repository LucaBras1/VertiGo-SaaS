# FitAdmin - Quick Start Guide

Get FitAdmin up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- OpenAI API key (for AI features)

## Step 1: Install Dependencies

```bash
cd apps/fitness
pnpm install
```

## Step 2: Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fitadmin"

# NextAuth
NEXTAUTH_URL="http://localhost:3004"
NEXTAUTH_SECRET="your-random-secret-key-here"

# OpenAI
OPENAI_API_KEY="sk-your-key-here"
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

## Step 3: Database Setup

```bash
# Run migrations
pnpm prisma:migrate

# Generate Prisma Client
pnpm prisma:generate

# (Optional) Open Prisma Studio to view database
pnpm prisma:studio
```

## Step 4: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3004](http://localhost:3004)

## Step 5: Explore the App

### Landing Page
Visit `http://localhost:3004` to see:
- Hero section with CTA
- Feature overview
- AI-powered features
- Pricing plans

### Dashboard (Mock Data)
Visit `http://localhost:3004/dashboard` to see:
- Today's schedule
- Client stats
- At-risk clients
- Revenue trends

## Usage Examples

### Generate Workout Plan

```typescript
import { generateWorkout } from '@/lib/ai/workout-generator'

const workout = await generateWorkout({
  client: {
    id: 'client_123',
    fitnessLevel: 'intermediate',
    goals: ['muscle_gain', 'strength'],
    injuries: ['Lower back strain'],
    age: 30,
    weight: 80,
    height: 180
  },
  session: {
    duration: 60,
    type: 'strength',
    focusAreas: ['chest', 'back'],
    intensity: 'moderate'
  },
  equipment: {
    available: ['dumbbells', 'barbell', 'bench', 'cable machine'],
    location: 'gym'
  },
  history: {
    lastWorkouts: [
      {
        date: '2024-01-20',
        focusAreas: ['legs'],
        exercises: ['squats', 'leg press', 'lunges']
      }
    ]
  }
}, { tenantId: 'tenant_123' })

console.log(workout.mainWorkout)
// Array of exercises with sets, reps, rest periods
```

### Predict Client Progress

```typescript
import { predictProgress } from '@/lib/ai/progress-predictor'

const prediction = await predictProgress({
  client: {
    id: 'client_123',
    name: 'John Smith'
  },
  currentMetrics: {
    weight: 85,
    bodyFat: 20
  },
  goalMetrics: {
    weight: 75,
    bodyFat: 12
  },
  behaviorData: {
    adherenceRate: 85,
    weeklyFrequency: 4,
    avgSessionDuration: 60,
    dietAdherence: 80
  }
}, { tenantId: 'tenant_123' })

console.log(prediction.prediction)
// estimatedWeeksToGoal, confidenceLevel, likelihood
console.log(prediction.milestones)
// Weekly progress milestones
```

### Get Nutrition Advice

```typescript
import { generateNutritionAdvice } from '@/lib/ai/nutrition-advisor'

const nutrition = await generateNutritionAdvice({
  client: {
    id: 'client_123',
    age: 30,
    gender: 'male',
    weight: 80,
    height: 180
  },
  goals: ['muscle_gain'],
  activityLevel: 'very_active',
  targetWeight: 85,
  dietaryPreferences: {
    restrictions: [],
    mealsPerDay: 4
  }
}, { tenantId: 'tenant_123' })

console.log(nutrition.energyRequirements)
// bmr, tdee, targetCalories
console.log(nutrition.macronutrients)
// protein, carbs, fats with gram amounts
```

### Detect Churn Risk

```typescript
import { detectChurnRisk } from '@/lib/ai/churn-detector'

const churnPrediction = await detectChurnRisk({
  client: {
    id: 'client_123',
    name: 'Sarah Johnson',
    startDate: '2024-01-01',
    membershipType: 'monthly'
  },
  attendanceData: {
    totalSessionsBooked: 20,
    totalSessionsAttended: 12,
    totalSessionsCancelled: 6,
    totalNoShows: 2,
    lastSessionDate: '2024-01-15',
    daysSinceLastSession: 15,
    averageSessionsPerWeek: 2.5,
    trendLastMonth: 'decreasing'
  },
  engagementData: {
    responsiveness: 'low',
    lastMessageDate: '2024-01-10',
    appUsage: 'minimal'
  },
  progressData: {
    goalProgress: 40,
    plateauWeeks: 3,
    satisfactionScore: 3
  },
  financialData: {
    outstandingBalance: 150,
    paymentIssues: 1,
    packageCreditsRemaining: 3
  }
}, { tenantId: 'tenant_123' })

console.log(churnPrediction.riskAssessment)
// riskScore, riskLevel, churnProbability
console.log(churnPrediction.retentionStrategies)
// Suggested actions to retain client
```

## Project Structure

```
apps/fitness/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── landing/              # Landing components
│   │   └── dashboard/            # Dashboard components
│   └── lib/
│       └── ai/                   # AI modules
│           ├── workout-generator.ts
│           ├── progress-predictor.ts
│           ├── nutrition-advisor.ts
│           ├── churn-detector.ts
│           └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## Available Scripts

```bash
pnpm dev              # Start dev server (port 3004)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:migrate   # Run database migrations
pnpm prisma:generate  # Generate Prisma Client
```

## Next Steps

1. **Add Authentication**
   - Set up NextAuth
   - Create login/signup pages
   - Protect routes

2. **Build Client Management**
   - Client list page
   - Client profile
   - Progress tracking UI

3. **Integrate AI**
   - Connect to @vertigo/ai-core
   - Replace template generators with real AI calls

4. **Add Session Booking**
   - Calendar interface
   - Booking form
   - Recurring sessions

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3004
lsof -ti:3004 | xargs kill -9

# Or use a different port
pnpm dev -- -p 3005
```

### Database Connection Error
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Try running migrations again

### Prisma Client Not Found
```bash
pnpm prisma:generate
```

### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm dev
```

## Support

- Documentation: See [README.md](./README.md)
- Implementation Status: See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- Vertical Guide: See [../../_docs/verticals/fitness.md](../../_docs/verticals/fitness.md)

---

**You're ready to build!** 🎉

Start with the landing page at `http://localhost:3004` and explore the dashboard at `http://localhost:3004/dashboard`.
