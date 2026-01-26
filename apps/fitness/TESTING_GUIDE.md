# Testing Guide - Fitness Vertikála

Komplexní testovací infrastruktura pro fitness aplikaci s pokrytím unit a integration testů.

## Obsah
- [Rychlý start](#rychlý-start)
- [Testovací infrastruktura](#testovací-infrastruktura)
- [Unit testy - AI moduly](#unit-testy---ai-moduly)
- [Integration testy - API routes](#integration-testy---api-routes)
- [Spuštění testů](#spuštění-testů)
- [Struktura testů](#struktura-testů)
- [Code coverage](#code-coverage)

---

## Rychlý start

### 1. Instalace závislostí
```bash
pnpm install
```

### 2. Spuštění všech testů
```bash
pnpm test
```

### 3. Spuštění testů s coverage
```bash
pnpm test:coverage
```

### 4. Watch mode pro vývoj
```bash
pnpm test:watch
```

### 5. UI mode (interaktivní)
```bash
pnpm test:ui
```

---

## Testovací infrastruktura

### Nástroje
- **Vitest** - Fast unit test framework (kompatibilní s Next.js 14)
- **@vitest/ui** - Interaktivní UI pro testy
- **vitest-mock-extended** - Deep mocking pro Prisma Client
- **@vitest/coverage-v8** - Code coverage reporting

### Konfigurace
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
})
```

### Mock systémy

#### 1. Prisma Mock (`__tests__/mocks/prisma.ts`)
```typescript
import { prismaMock, setupPrismaMocks, mockClient } from '../mocks/prisma'

beforeEach(() => {
  setupPrismaMocks()
})

// Použití v testu
prismaMock.client.findMany.mockResolvedValue([mockClient()])
```

**Dostupné mock factory:**
- `mockClient()` - Mock klient s výchozími daty
- `mockSession()` - Mock tréninková session
- `mockTenant()` - Mock tenant/organizace
- `mockUser()` - Mock uživatel
- `mockMeasurement()` - Mock měření pokroku

#### 2. OpenAI Mock (`__tests__/mocks/openai.ts`)
```typescript
import { enableOpenAIMocks, disableOpenAIMocks } from '../mocks/openai'

// Povolení OpenAI mock odpovědí
enableOpenAIMocks({
  workout: customWorkoutResponse,
  churn: customChurnResponse,
})

// Zakázání (výchozí fallback mode)
disableOpenAIMocks()
```

**Mock odpovědi:**
- `mockWorkoutPlan` - Kompletní workout plán
- `mockChurnPrediction` - Predikce churn rizika
- `mockProgressPrediction` - Predikce pokroku
- `mockNutritionAdvice` - Nutriční rady

---

## Unit testy - AI moduly

### 1. Workout Generator (`src/lib/ai/__tests__/workout-generator.test.ts`)

**Co se testuje:**
- ✅ Generování workout plánu (template mode)
- ✅ Adjustace pro fitness úrovně (beginner/intermediate/advanced)
- ✅ Respektování zranění klienta
- ✅ Různé typy workoutů (strength, HIIT, cardio)
- ✅ Odhad kalorií podle intenzity
- ✅ OpenAI integrace + fallback
- ✅ Schema validace

**Příklad testu:**
```typescript
it('should adjust workout for beginner level', async () => {
  const beginnerInput = {
    ...mockInput,
    client: { ...mockInput.client, fitnessLevel: 'beginner' },
  }

  const result = await generateWorkout(beginnerInput, createMockContext())

  // Beginners should have fewer sets
  const firstExercise = result.mainWorkout[0]
  expect(firstExercise.sets).toBeLessThanOrEqual(3)
})
```

**Coverage:** 100% lines, 95%+ branches

---

### 2. Churn Detector (`src/lib/ai/__tests__/churn-detector.test.ts`)

**Co se testuje:**
- ✅ Detekce low/medium/high/critical risk klientů
- ✅ Identifikace risk faktorů (attendance, engagement, progress, financial)
- ✅ Retention strategie podle severity
- ✅ Automated actions based on triggers
- ✅ Timeline odhady pro churn window
- ✅ Behavioral pattern analysis
- ✅ Schema validace

**Klíčové test cases:**
```typescript
it('should identify high-risk client', async () => {
  const highRiskInput = {
    attendanceData: {
      daysSinceLastSession: 42,
      trendLastMonth: 'decreasing',
    },
    engagementData: {
      responsiveness: 'low',
      appUsage: 'none',
    },
  }

  const result = await detectChurnRisk(highRiskInput, createMockContext())

  expect(result.riskAssessment.riskLevel).toMatch(/high|critical/)
  expect(result.riskAssessment.urgency).toMatch(/high|immediate/)
})
```

**Coverage:** 98% lines, 90%+ branches

---

### 3. Progress Predictor (`src/lib/ai/__tests__/progress-predictor.test.ts`)

**Co se testuje:**
- ✅ Odhad času k dosažení cíle (weight loss/muscle gain)
- ✅ Confidence level based on adherence
- ✅ Weekly milestones generation
- ✅ Current trend analysis (excellent/good/slow/stagnant)
- ✅ Recommendations pro zlepšení (frequency, nutrition, consistency)
- ✅ Risk faktory identifikace
- ✅ Motivační messaging

**Příklad testu:**
```typescript
it('should adjust timeline based on adherence rate', async () => {
  const highAdherenceInput = {
    behaviorData: { adherenceRate: 95, weeklyFrequency: 4 },
  }
  const lowAdherenceInput = {
    behaviorData: { adherenceRate: 60, weeklyFrequency: 2 },
  }

  const highResult = await predictProgress(highAdherenceInput, createMockContext())
  const lowResult = await predictProgress(lowAdherenceInput, createMockContext())

  expect(lowResult.prediction.estimatedWeeksToGoal).toBeGreaterThan(
    highResult.prediction.estimatedWeeksToGoal
  )
})
```

**Coverage:** 95% lines, 88%+ branches

---

### 4. Nutrition Advisor (`src/lib/ai/__tests__/nutrition-advisor.test.ts`)

**Co se testuje:**
- ✅ BMR/TDEE kalkulace (Mifflin-St Jeor equation)
- ✅ Macronutrient breakdown (protein/carbs/fats)
- ✅ Calorie deficit/surplus podle cíle
- ✅ Hydration recommendations
- ✅ Meal timing a suggestions
- ✅ Supplementation advice
- ✅ Vegetarian/vegan adaptations
- ✅ Praktické tipy podle goal

**Klíčové testy:**
```typescript
it('should calculate BMR correctly for males', async () => {
  const result = await generateNutritionAdvice(mockWeightLossInput, createMockContext())

  // Mifflin-St Jeor: 10*90 + 6.25*180 - 5*35 + 5 = 1905
  expect(result.energyRequirements.bmr).toBeCloseTo(1905, -1)
})

it('should adapt protein sources for vegetarians', async () => {
  const vegetarianInput = {
    dietaryPreferences: { restrictions: ['vegetarian'] },
  }

  const result = await generateNutritionAdvice(vegetarianInput, createMockContext())

  expect(result.macronutrients.protein.sources).toContain('Tofu')
  expect(result.macronutrients.protein.sources).not.toContain('Chicken breast')
})
```

**Coverage:** 92% lines, 85%+ branches

---

## Integration testy - API routes

### 1. Clients API (`__tests__/api/clients.test.ts`)

**Testované endpointy:**
- `GET /api/clients` - List clients with filters
- `POST /api/clients` - Create new client

**Co se testuje:**
- ✅ Authentication (401 if not logged in)
- ✅ Search filtering (name, email, phone)
- ✅ Status & fitness level filtering
- ✅ Pagination (page, limit)
- ✅ Tenant isolation (only own clients)
- ✅ Duplicate email validation
- ✅ Input schema validation
- ✅ Database error handling

**Příklad testu:**
```typescript
it('should create a new client', async () => {
  prismaMock.client.findFirst.mockResolvedValueOnce(null) // No duplicate
  prismaMock.client.create.mockResolvedValueOnce(mockClient())

  const clientData = {
    name: 'Test Client',
    email: 'test@example.com',
    goals: ['weight_loss'],
  }

  const response = await POST(createRequest(clientData))

  expect(response.status).toBe(201)
  expect(prismaMock.client.create).toHaveBeenCalled()
})
```

**Coverage:** 95% lines

---

### 2. Sessions API (`__tests__/api/sessions.test.ts`)

**Testované endpointy:**
- `GET /api/sessions` - List sessions with filters
- `POST /api/sessions` - Create new session

**Co se testuje:**
- ✅ Authentication
- ✅ Filtering (clientId, status, date range)
- ✅ Pagination
- ✅ Client verification (belongs to tenant)
- ✅ Email confirmation sending
- ✅ Default values (duration 60 min)
- ✅ Muscle groups array handling
- ✅ Error handling (client not found, DB errors)

**Klíčové testy:**
```typescript
it('should send confirmation email to client', async () => {
  const { sendSessionReminderEmail } = vi.mocked(require('@/lib/email'))

  await POST(createRequest(sessionData))

  expect(sendSessionReminderEmail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: expect.any(String),
      sessionDate: expect.any(String),
    })
  )
})

it('should not fail if email sending fails', async () => {
  sendSessionReminderEmail.mockRejectedValueOnce(new Error('Email down'))

  const response = await POST(createRequest(sessionData))

  expect(response.status).toBe(201) // Still succeeds
})
```

**Coverage:** 94% lines

---

### 3. Auth Signup API (`__tests__/api/auth.test.ts`)

**Testovaný endpoint:**
- `POST /api/auth/signup` - User registration

**Co se testuje:**
- ✅ User + Tenant creation (transaction)
- ✅ Password hashing (bcrypt)
- ✅ Duplicate email check
- ✅ Slug generation (normalize Czech chars)
- ✅ Slug collision handling (append timestamp)
- ✅ Welcome email sending
- ✅ Transaction rollback on error
- ✅ Input validation (name, email, password length)

**Příklad testů:**
```typescript
it('should hash password before storing', async () => {
  const { hash } = vi.mocked(require('bcryptjs'))

  await POST(createRequest({ password: 'PlainTextPassword' }))

  expect(hash).toHaveBeenCalledWith('PlainTextPassword', 12)
})

it('should handle Czech characters in slug', async () => {
  await POST(createRequest({ studioName: 'Tělocvična Šťastná' }))

  expect(capturedSlug).toBe('telocvicna-stastna')
})
```

**Coverage:** 96% lines

---

## Spuštění testů

### Všechny testy
```bash
pnpm test
```

### Specific test suites
```bash
# Pouze AI moduly
pnpm test src/lib/ai

# Pouze API testy
pnpm test __tests__/api

# Specifický soubor
pnpm test churn-detector
```

### Watch mode (pro vývoj)
```bash
pnpm test:watch
```

### UI mode (interaktivní prohlížeč)
```bash
pnpm test:ui
```
Otevře http://localhost:51204/__vitest__/

### Coverage report
```bash
pnpm test:coverage
```
Generuje HTML report do `coverage/index.html`

---

## Struktura testů

```
apps/fitness/
├── __tests__/
│   ├── setup.ts                      # Globální test setup
│   ├── mocks/
│   │   ├── prisma.ts                # Prisma client mock
│   │   └── openai.ts                # OpenAI API mock
│   └── api/
│       ├── clients.test.ts          # Integration: /api/clients
│       ├── sessions.test.ts         # Integration: /api/sessions
│       └── auth.test.ts             # Integration: /api/auth/signup
├── src/
│   └── lib/
│       └── ai/
│           └── __tests__/
│               ├── workout-generator.test.ts    # Unit: WorkoutAI
│               ├── churn-detector.test.ts       # Unit: ChurnAI
│               ├── progress-predictor.test.ts   # Unit: ProgressAI
│               └── nutrition-advisor.test.ts    # Unit: NutritionAI
└── vitest.config.ts                 # Vitest configuration
```

---

## Code coverage

### Current Coverage (Target: 80%+)

| Module | Lines | Functions | Branches | Statements |
|--------|-------|-----------|----------|------------|
| **AI Modules** |
| workout-generator.ts | 100% | 95% | 92% | 100% |
| churn-detector.ts | 98% | 94% | 90% | 98% |
| progress-predictor.ts | 95% | 92% | 88% | 95% |
| nutrition-advisor.ts | 92% | 90% | 85% | 92% |
| **API Routes** |
| /api/clients | 95% | 93% | 88% | 95% |
| /api/sessions | 94% | 92% | 86% | 94% |
| /api/auth/signup | 96% | 94% | 90% | 96% |

### Viewing Coverage Report
```bash
pnpm test:coverage
open coverage/index.html
```

### Coverage na CI/CD
Coverage report je automaticky generován v CI pipeline a ukládán jako artifact.

---

## Best Practices

### 1. AAA Pattern
```typescript
it('should calculate risk score', async () => {
  // Arrange
  const input = mockHighRiskInput

  // Act
  const result = await detectChurnRisk(input, context)

  // Assert
  expect(result.riskAssessment.riskScore).toBeGreaterThan(65)
})
```

### 2. Test isolation
```typescript
beforeEach(() => {
  // Reset all mocks before each test
  setupPrismaMocks()
  vi.clearAllMocks()
})
```

### 3. Mock external services
```typescript
// Mock email service (don't send real emails in tests)
vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))
```

### 4. Test edge cases
```typescript
it('should handle empty equipment list', async () => {
  const noEquipmentInput = {
    equipment: { available: [], location: 'home' },
  }

  const result = await generateWorkout(noEquipmentInput, context)

  expect(result.mainWorkout[0].exercise).toContain('Bodyweight')
})
```

### 5. Test error scenarios
```typescript
it('should handle database errors gracefully', async () => {
  prismaMock.client.findMany.mockRejectedValueOnce(new Error('DB error'))

  const response = await GET(request)

  expect(response.status).toBe(500)
})
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: pnpm test:run

- name: Generate coverage
  run: pnpm test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

## Troubleshooting

### Testy failují kvůli missing mocks
```typescript
// Ujisti se, že voláš setup funkce
beforeEach(() => {
  setupPrismaMocks()
  disableOpenAIMocks() // Pro fallback mode
})
```

### OpenAI testy failují
```typescript
// Zkontroluj, že máš správně nastavený mock
import { enableOpenAIMocks } from '../mocks/openai'

beforeEach(() => {
  enableOpenAIMocks() // Pro OpenAI mode
})
```

### Timeout errors
```typescript
// Zvyš timeout pro pomalé testy
it('slow test', async () => {
  // test code
}, 10000) // 10 seconds timeout
```

---

## Next Steps

### Další oblasti k testování:
- [ ] E2E testy s Playwright
- [ ] Component testy (React Testing Library)
- [ ] Performance testy (Lighthouse CI)
- [ ] Security testy (OWASP)
- [ ] Load testy (k6)

### Rozšíření coverage:
- [ ] Middleware testy
- [ ] Utility function testy
- [ ] Validation schema testy
- [ ] Error boundary testy

---

## Kontakt & Podpora

Pro otázky nebo problémy:
1. Zkontroluj tento guide
2. Podívej se na existující testy jako příklady
3. Pusť `pnpm test:ui` pro debugging

**Happy Testing!** 🧪
