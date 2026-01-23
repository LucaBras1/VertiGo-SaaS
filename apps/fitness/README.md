# FitAdmin - Smart Management for Fitness Pros

AI-powered management platform for personal trainers, yoga instructors, and fitness studios.

## 🎯 Overview

**Vertical:** Fitness
**Target Users:** Personal trainers, yoga instructors, small studios
**Tagline:** "Smart management for fitness pros"
**Port:** 3004

## 🎨 Branding

- **Primary Color:** Energetic Green (#10B981)
- **Secondary Color:** Dark Slate (#1E293B)
- **Icon:** Dumbbell / Flex arm
- **Tone:** Motivating, professional, health-focused

## ✨ Features

### Core Features
- **Client Management** - Complete CRM with progress tracking, measurements, photo timelines
- **Smart Scheduling** - Booking management with automated reminders
- **Payments & Packages** - Session packages, memberships, automated billing
- **Progress Analytics** - Visual dashboards showing client improvements
- **Invoicing** - Professional invoices auto-generated
- **Mobile Access** - Responsive interface for on-the-go management

### AI Features

#### 1. WorkoutAI
Generates personalized training plans based on:
- Client goals and fitness level
- Available equipment
- Time constraints
- Injury history
- Previous workout data

**Location:** `src/lib/ai/workout-generator.ts`

#### 2. ProgressPredictorAI
Predicts when clients will reach their goals:
- Analyzes adherence patterns
- Forecasts milestones
- Suggests adjustment strategies
- Confidence scoring

**Location:** `src/lib/ai/progress-predictor.ts`

#### 3. NutritionAdvisorAI
Basic macro and calorie guidance:
- Calculates TDEE and macros
- Meal timing suggestions
- Hydration recommendations
- Dietary restriction support

**Location:** `src/lib/ai/nutrition-advisor.ts`

#### 4. ChurnDetectorAI
Identifies at-risk clients before they leave:
- Tracks attendance patterns
- Engagement scoring
- Automated outreach triggers
- Retention recommendations

**Location:** `src/lib/ai/churn-detector.ts`

## 🗄️ Database Schema

Prisma schema with fitness-specific models:
- `Client` - Fitness clients with goals, measurements, injuries
- `Session` - 1-on-1 training sessions with workout data
- `Class` - Group fitness classes
- `Package` - Session packages and memberships
- `ClientMeasurement` - Progress tracking
- `ProgressPhoto` - Visual progress timeline

**Location:** `prisma/schema.prisma`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Set up database:
```bash
pnpm prisma:migrate
pnpm prisma:generate
```

4. Run development server:
```bash
pnpm dev
```

5. Open [http://localhost:3004](http://localhost:3004)

## 📁 Project Structure

```
apps/fitness/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Trainer dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── landing/           # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── AIFeatures.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Footer.tsx
│   │   └── dashboard/         # Dashboard components
│   │       ├── DashboardStats.tsx
│   │       ├── TodaySchedule.tsx
│   │       ├── AtRiskClients.tsx
│   │       ├── RevenueChart.tsx
│   │       └── QuickActions.tsx
│   └── lib/
│       └── ai/                # AI modules
│           ├── workout-generator.ts
│           ├── progress-predictor.ts
│           ├── nutrition-advisor.ts
│           └── churn-detector.ts
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Design System

### Colors
```typescript
primary: {
  500: '#10b981', // Energetic Green
  600: '#059669',
  700: '#047857',
}
secondary: {
  800: '#1e293b', // Dark Slate
  900: '#0f172a',
}
```

### Typography
- Font: Inter
- Headings: Bold (font-weight: 700)
- Body: Regular (font-weight: 400)

## 🧪 Development

### Scripts
```bash
pnpm dev          # Start dev server (port 3004)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

### Prisma Commands
```bash
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:migrate   # Run migrations
pnpm prisma:generate  # Generate Prisma Client
```

## 📊 Implementation Status

### ✅ Completed
- [x] Next.js project setup
- [x] Tailwind configuration with brand colors
- [x] Prisma schema with fitness-specific models
- [x] Landing page with hero, features, pricing
- [x] AI Module: WorkoutAI (workout generation)
- [x] AI Module: ProgressPredictorAI
- [x] AI Module: NutritionAdvisorAI
- [x] AI Module: ChurnDetectorAI
- [x] Dashboard layout and components
- [x] Today's schedule component
- [x] At-risk clients component
- [x] Revenue chart component

### 🚧 In Progress / To Do
- [ ] Authentication (NextAuth)
- [ ] Client management pages
- [ ] Session booking system
- [ ] Progress tracking UI
- [ ] Package/membership management
- [ ] Invoicing system
- [ ] AI integration with @vertigo/ai-core
- [ ] Mobile responsiveness refinement
- [ ] E2E tests

## 🔌 API Integration

### AI Modules Usage

```typescript
import { generateWorkout } from '@/lib/ai/workout-generator'
import { predictProgress } from '@/lib/ai/progress-predictor'
import { generateNutritionAdvice } from '@/lib/ai/nutrition-advisor'
import { detectChurnRisk } from '@/lib/ai/churn-detector'

// Generate workout
const workout = await generateWorkout({
  client: { id, fitnessLevel: 'intermediate', goals: ['muscle_gain'] },
  session: { duration: 60, type: 'strength', intensity: 'moderate' },
  equipment: { available: ['dumbbells', 'barbell'], location: 'gym' }
}, { tenantId })

// Predict progress
const prediction = await predictProgress({
  client: { id, weight: 80, targetWeight: 75 },
  behaviorData: { adherenceRate: 85, weeklyFrequency: 4 }
}, { tenantId })

// Get nutrition advice
const nutrition = await generateNutritionAdvice({
  client: { age: 30, gender: 'male', weight: 80, height: 180 },
  goals: ['muscle_gain'],
  activityLevel: 'very_active'
}, { tenantId })

// Detect churn risk
const churnPrediction = await detectChurnRisk({
  client: { id, startDate: '2024-01-01' },
  attendanceData: { daysSinceLastSession: 15, adherenceRate: 60 }
}, { tenantId })
```

## 🤝 Integration with Shared Packages

### @vertigo/ai-core
AI utilities (to be integrated):
```typescript
import { createAIClient } from '@vertigo/ai-core'

const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
const response = await ai.chatStructured({
  model: 'gpt-4o',
  messages: [...],
  schema: WorkoutPlanSchema
})
```

### @vertigo/database
Shared Prisma client:
```typescript
import { prisma } from '@vertigo/database'

const clients = await prisma.client.findMany({
  where: { tenantId }
})
```

### @vertigo/ui
Shared components:
```typescript
import { Button, Card, AIAssistantWidget } from '@vertigo/ui'
```

## 📚 Documentation

- [FitAdmin Vertical Guide](../../_docs/verticals/fitness.md)
- [AI Integration Guide](../../_docs/AI-INTEGRATION.md)
- [Master Guide](../../_docs/MASTER-GUIDE.md)

## 🎯 Success Metrics

- Client retention >80%
- Workout AI usage >70%
- Session no-show rate <10%
- Average client lifespan >6 months
- Package renewal rate >60%

## 📝 License

Private - Part of VertiGo SaaS Platform

---

**Built with VertiGo SaaS Framework**
Multi-vertical SaaS platform with AI integration
