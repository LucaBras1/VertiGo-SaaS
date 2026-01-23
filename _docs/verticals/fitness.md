# FitAdmin - Personal Trainers & Studios

## Product Overview

**Name:** FitAdmin
**Tagline:** "Smart management for fitness pros"
**Target:** Personal trainers, yoga instructors, small studios
**Market Size:** $96B+ fitness market
**Target Users:** 3M+ personal trainers globally

## Branding

- **Primary Color:** Energetic Green (#10B981)
- **Secondary Color:** Dark Slate (#1E293B)
- **Icon:** Dumbbell / Flex arm
- **Tone:** Motivating, professional, health-focused

## Entity Mapping

| Core Entity | FitAdmin Name | Description |
|-------------|---------------|-------------|
| Performance | Session | 1-on-1 training session |
| Game | Class | Group fitness class |
| Service | Package | Monthly package, credits |
| Event | Appointment | Scheduled session |
| Customer | Client | Training client |

## Specific Database Fields

```prisma
model Client {
  // ... base fields from Customer

  // Fitness-specific
  goals           String[]  // weight loss, strength, endurance
  currentWeight   Float?
  targetWeight    Float?
  measurements    Json?     // chest, waist, hips, etc.
  bodyFatPercent  Float?
  fitnessLevel    String?   // beginner, intermediate, advanced
  injuryHistory   String?
  dietaryNotes    String?
  medicalNotes    String?
  creditsRemaining Int      @default(0)
  membershipType  String?
  membershipExpiry DateTime?
}

model Session {
  // ... base fields from Performance

  // Fitness-specific
  workoutPlan     Json?     // AI-generated plan
  exercisesLogged Json[]    // Completed exercises
  duration        Int?      // Minutes
  caloriesBurned  Int?
  heartRateAvg    Int?
  clientFeedback  String?
  trainerNotes    String?
  muscleGroups    String[]  // Targeted muscles
}
```

## AI Features

### 1. WorkoutAI
**Purpose:** Generate personalized training plans

**Input:**
```typescript
{
  clientId: string,
  goals: string[],
  fitnessLevel: string,
  availableEquipment: string[],
  duration: number, // minutes
  injuries: string[],
  lastWorkouts: Workout[] // Previous sessions
}
```

**Output:**
```typescript
{
  warmup: Array<{
    exercise: string,
    duration: string,
    notes: string
  }>,
  mainWorkout: Array<{
    exercise: string,
    sets: number,
    reps: string,
    restSeconds: number,
    muscleGroup: string,
    alternatives: string[],
    formTips: string
  }>,
  cooldown: Array<{
    exercise: string,
    duration: string
  }>,
  estimatedCalories: number,
  difficulty: number, // 1-10
  progressionNotes: string
}
```

### 2. ProgressPredictorAI
**Purpose:** Predict when client will reach goals

**Input:**
```typescript
{
  clientId: string,
  currentMetrics: Measurements,
  goalMetrics: Measurements,
  adherenceRate: number, // % of sessions attended
  workoutFrequency: number // per week
}
```

**Output:**
```typescript
{
  estimatedWeeksToGoal: number,
  confidenceLevel: number,
  milestones: Array<{
    week: number,
    expectedProgress: string
  }>,
  recommendations: string[],
  riskFactors: string[]
}
```

### 3. NutritionAdvisorAI
**Purpose:** Basic nutrition guidance

**Input:**
```typescript
{
  goals: string[],
  currentWeight: number,
  targetWeight: number,
  activityLevel: string,
  dietaryRestrictions: string[]
}
```

**Output:**
```typescript
{
  dailyCalories: number,
  macros: {
    protein: number,
    carbs: number,
    fats: number
  },
  mealSuggestions: string[],
  hydrationGoal: number,
  disclaimer: string // "Consult a nutritionist"
}
```

### 4. ChurnDetectorAI
**Purpose:** Identify at-risk clients

**Input:** Client attendance and engagement data
**Output:**
```typescript
{
  riskScore: number, // 0-100
  riskLevel: 'low' | 'medium' | 'high',
  warning signs: string[],
  recommendedActions: string[],
  lastActivity: Date
}
```

### 5. SessionRecommenderAI
**Purpose:** Suggest next workout

**Input:** Last sessions, muscle recovery status
**Output:** Recommended workout focus and exercises

## Special Features (Fitness-Specific)

- **Recurring Bookings:** Weekly/monthly recurring sessions
- **Package/Credits System:** Sell session packages
- **Client Progress Dashboard:** Charts, photos, measurements
- **Class Scheduling:** Group classes with capacity limits
- **Workout Log:** Client-facing exercise tracking
- **Mobile Check-in:** QR code session start

## Competitors

| Competitor | Price | Weaknesses | Our Advantage |
|------------|-------|------------|---------------|
| Mindbody | $139-699/mo | Very expensive | 10x cheaper + AI |
| Trainerize | $5-50/mo | No invoicing | Full business suite |
| PTminder | $25-75/mo | Limited CRM | AI coach |
| My PT Hub | $20-60/mo | Basic billing | Progress AI |
| Virtuagym | €30-100/mo | Complex | Simpler + AI |

## Key User Flows

### 1. New Client Onboarding
1. Client signs up via website
2. Complete intake questionnaire
3. AI analyzes goals and suggests package
4. Schedule first session
5. AI generates initial assessment workout

### 2. Training Session
1. Client checks in
2. View AI-generated workout plan
3. Log exercises during session
4. Add notes and feedback
5. AI suggests next session focus

### 3. Progress Review
1. Monthly check-in scheduled
2. Record new measurements
3. AI analyzes progress
4. Adjust goals if needed
5. Generate progress report for client

## Success Metrics

- Client retention >80%
- Workout AI usage >70%
- Session no-show rate <10%
- Average client lifespan >6 months
- Package renewal rate >60%
