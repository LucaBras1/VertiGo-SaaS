# FitAdmin API - Příklady Použití

Praktické příklady použití FitAdmin API pro běžné use cases.

---

## Obsah

1. [Základní Operace](#základní-operace)
2. [Client Management](#client-management)
3. [Session Management](#session-management)
4. [Class & Booking Management](#class--booking-management)
5. [Payments & Billing](#payments--billing)
6. [AI Features](#ai-features)
7. [Dashboard & Analytics](#dashboard--analytics)

---

## Základní Operace

### Registrace nového studia

```javascript
// POST /api/auth/signup
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jan Novák',
    email: 'jan@fitstudio.cz',
    password: 'SecurePassword123!',
    studioName: 'FitStudio Praha'
  })
})

const data = await response.json()
// {
//   "message": "Registrace úspěšná",
//   "user": {
//     "id": "clx...",
//     "name": "Jan Novák",
//     "email": "jan@fitstudio.cz"
//   }
// }
```

### Reset hesla

```javascript
// Krok 1: Požádat o reset
const forgotResponse = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jan@fitstudio.cz'
  })
})

// Krok 2: Použít token z emailu
const resetResponse = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'token_from_email',
    password: 'NewSecurePassword123!'
  })
})
```

---

## Client Management

### Vytvoření nového klienta

```javascript
// POST /api/clients
const client = await fetch('/api/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Pavel Novák',
    email: 'pavel@example.com',
    phone: '+420123456789',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    goals: ['weight_loss', 'muscle_gain'],
    currentWeight: 85,
    targetWeight: 75,
    height: 180,
    fitnessLevel: 'beginner',
    injuryHistory: 'Knee surgery 2 years ago',
    dietaryNotes: 'Vegetarian',
    membershipType: 'monthly',
    creditsRemaining: 10,
    tags: ['motivated', 'vip']
  })
})

const clientData = await client.json()
console.log('Created client:', clientData.id)
```

### Vyhledávání klientů

```javascript
// GET /api/clients?search=Pavel&status=active&page=1&limit=20
const searchParams = new URLSearchParams({
  search: 'Pavel',
  status: 'active',
  fitnessLevel: 'beginner',
  page: '1',
  limit: '20',
  includeMeasurements: 'true'
})

const clients = await fetch(`/api/clients?${searchParams}`)
const { clients: clientList, pagination } = await clients.json()

console.log(`Found ${pagination.total} clients`)
clientList.forEach(client => {
  console.log(`- ${client.name} (${client.email})`)
})
```

### Aktualizace klienta

```javascript
// PATCH /api/clients/[id]
const updateResponse = await fetch(`/api/clients/${clientId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentWeight: 82.5,  // Ztráta 2.5 kg
    status: 'active',
    notes: 'Skvělý pokrok v prvním měsíci!'
  })
})
```

### Přidání měření klienta

```javascript
// POST /api/clients/[id]/measurements
const measurement = await fetch(`/api/clients/${clientId}/measurements`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: new Date().toISOString(),
    weight: 82.5,
    bodyFat: 18.2,
    measurements: {
      chest: 98,
      waist: 82,
      hips: 96,
      biceps: 34,
      thighs: 56
    },
    notes: 'Viditelný pokrok na pasu!'
  })
})

const measurementData = await measurement.json()
console.log('Measurement saved:', measurementData.measurement.id)
```

### Získání historie měření

```javascript
// GET /api/clients/[id]/measurements
const measurementsResponse = await fetch(`/api/clients/${clientId}/measurements`)
const { measurements, stats } = await measurementsResponse.json()

console.log('Progress Stats:')
console.log(`Total measurements: ${stats.totalMeasurements}`)
console.log(`Weight change: ${stats.weightChange} kg`)
console.log(`Body fat change: ${stats.bodyFatChange}%`)
console.log(`Trend: ${stats.trend}`)

// Zobrazit graf
measurements.forEach(m => {
  console.log(`${new Date(m.date).toLocaleDateString()}: ${m.weight} kg`)
})
```

---

## Session Management

### Naplánování 1-on-1 tréninku

```javascript
// POST /api/sessions
const session = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: clientId,
    scheduledAt: '2024-01-25T10:00:00Z',
    duration: 60,
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    price: 500,
    notes: 'Upper body focus session'
  })
})

const sessionData = await session.json()
console.log('Session created, confirmation email sent to client')
```

### Získání týdenních tréninků

```javascript
// GET /api/sessions?startDate=...&endDate=...
const now = new Date()
const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7))

const params = new URLSearchParams({
  startDate: startOfWeek.toISOString(),
  endDate: endOfWeek.toISOString(),
  status: 'scheduled'
})

const sessions = await fetch(`/api/sessions?${params}`)
const { sessions: weekSessions, pagination } = await sessions.json()

console.log(`This week: ${weekSessions.length} sessions planned`)
```

### Označení tréninku jako dokončeného

```javascript
// PATCH /api/sessions/[id]
const completedSession = await fetch(`/api/sessions/${sessionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'completed',
    exercisesLogged: [
      {
        exercise: 'Bench Press',
        sets: 4,
        reps: [10, 10, 8, 8],
        weight: 80
      },
      {
        exercise: 'Dumbbell Flyes',
        sets: 3,
        reps: [12, 12, 10],
        weight: 20
      }
    ],
    caloriesBurned: 450,
    heartRateAvg: 140,
    intensity: 'high',
    trainerNotes: 'Excellent form, pushed hard',
    clientRating: 5
  })
})

// Automaticky se odečte 1 kredit klientovi
```

---

## Class & Booking Management

### Vytvoření skupinové lekce

```javascript
// POST /api/classes
const yogaClass = await fetch('/api/classes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Morning Yoga',
    description: 'Energizing flow yoga for all levels',
    scheduledAt: '2024-01-26T08:00:00Z',
    duration: 60,
    capacity: 15,
    location: 'Studio A',
    price: 200
  })
})

const classData = await yogaClass.json()
console.log('Class created:', classData.class.id)
```

### Rezervace klienta na lekci

```javascript
// POST /api/classes/[classId]/bookings
const booking = await fetch(`/api/classes/${classId}/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: clientId,
    useCredits: true  // Použít kredit místo platby
  })
})

const bookingData = await booking.json()
console.log('Booking confirmed:', bookingData.booking.id)
```

### Check-in klienta na lekci

```javascript
// PATCH /api/bookings/[bookingId]
const checkin = await fetch(`/api/bookings/${bookingId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    checkedIn: true
  })
})

console.log('Client checked in!')
```

### Získání účastníků lekce

```javascript
// GET /api/classes/[classId]/bookings
const participants = await fetch(`/api/classes/${classId}/bookings`)
const { bookings, totalCount, checkedInCount, availableSpots } = await participants.json()

console.log(`Class occupancy: ${totalCount}/${capacity}`)
console.log(`Checked in: ${checkedInCount}`)
console.log(`Available spots: ${availableSpots}`)

bookings.forEach(booking => {
  const status = booking.checkedIn ? '✓' : '○'
  console.log(`${status} ${booking.client.name}`)
})
```

---

## Payments & Billing

### Vytvoření balíčku (package)

```javascript
// POST /api/packages
const package = await fetch('/api/packages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '10 Session Package',
    description: 'Perfect starter package for new clients',
    type: 'sessions',
    price: 4500,
    credits: 10,
    validityDays: 90,
    features: [
      '10 personal training sessions',
      'Free nutrition consultation',
      'Progress tracking',
      'Valid for 3 months'
    ],
    isActive: true
  })
})

const packageData = await package.json()
```

### Stripe checkout pro nákup balíčku

```javascript
// POST /api/payments/create-checkout
const checkout = await fetch('/api/payments/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    packageId: packageId,
    clientId: clientId
  })
})

const { checkoutUrl, sessionId } = await checkout.json()

// Přesměruj klienta na Stripe checkout
window.location.href = checkoutUrl
```

### Vytvoření faktury

```javascript
// POST /api/invoices
const invoice = await fetch('/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: clientId,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
    items: [
      {
        description: '10 Session Package',
        quantity: 1,
        unitPrice: 4500
      }
    ],
    notes: 'Platba možná převodem nebo kartou',
    subtotal: 4500,
    tax: 0,
    total: 4500
  })
})

const invoiceData = await invoice.json()
console.log('Invoice created:', invoiceData.invoice.invoiceNumber)
```

### Označení faktury jako zaplacené

```javascript
// PATCH /api/invoices/[id]
const paidInvoice = await fetch(`/api/invoices/${invoiceId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'paid',
    paidDate: new Date().toISOString()
  })
})
```

---

## AI Features

### Generování personalizovaného workout plánu

```javascript
// POST /api/ai/workout
const workout = await fetch('/api/ai/workout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: {
      id: clientId,
      name: 'Pavel Novák',
      age: 30,
      gender: 'male',
      fitnessLevel: 'beginner',
      goals: ['weight_loss', 'muscle_gain'],
      injuries: ['Previous knee injury'],
      equipment: ['dumbbells', 'barbell', 'bench']
    },
    sessionGoals: {
      duration: 60,
      intensity: 'moderate',
      focus: ['strength', 'hypertrophy'],
      targetMuscleGroups: ['chest', 'triceps', 'shoulders']
    },
    constraints: {
      timeLimit: 60,
      equipmentAvailable: ['dumbbells', 'barbell', 'bench'],
      avoidExercises: ['squats', 'lunges']  // Kvůli kolenu
    }
  })
})

const { success, data } = await workout.json()

if (success) {
  console.log('Workout Plan:')
  console.log('Warmup:', data.workoutPlan.warmup)
  console.log('Main Workout:', data.workoutPlan.mainWorkout)
  console.log('Cooldown:', data.workoutPlan.cooldown)
  console.log(`Estimated duration: ${data.estimatedDuration} min`)
  console.log(`Estimated calories: ${data.estimatedCalories}`)
}
```

### Generování nutričního plánu

```javascript
// POST /api/ai/nutrition
const nutrition = await fetch('/api/ai/nutrition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: {
      id: clientId,
      name: 'Pavel Novák',
      age: 30,
      gender: 'male',
      currentWeight: 85,
      targetWeight: 75,
      height: 180,
      activityLevel: 'moderate'
    },
    goals: ['weight_loss'],
    dietaryRestrictions: ['vegetarian'],
    preferences: {
      mealsPerDay: 4,
      cuisine: ['mediterranean', 'asian'],
      budget: 'medium'
    }
  })
})

const { success, data } = await nutrition.json()

if (success) {
  console.log('Daily Calorie Target:', data.calorieTarget.daily)
  console.log('Deficit:', data.calorieTarget.deficit)
  console.log('Macros:')
  console.log(`- Protein: ${data.macros.protein}g`)
  console.log(`- Carbs: ${data.macros.carbs}g`)
  console.log(`- Fats: ${data.macros.fats}g`)
  console.log('Hydration:', data.hydrationTarget, 'liters')
}
```

### Predikce pokroku klienta

```javascript
// POST /api/ai/progress
const progress = await fetch('/api/ai/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: {
      id: clientId,
      name: 'Pavel Novák',
      currentWeight: 82.5,
      targetWeight: 75
    },
    historicalData: {
      measurements: [
        { date: '2024-01-01', weight: 85, bodyFat: 20 },
        { date: '2024-01-08', weight: 84, bodyFat: 19.5 },
        { date: '2024-01-15', weight: 83, bodyFat: 19 },
        { date: '2024-01-22', weight: 82.5, bodyFat: 18.5 }
      ],
      attendanceRate: 90,
      adherenceToProgram: 85
    },
    currentProgram: {
      weeklySessionCount: 3,
      averageIntensity: 'moderate',
      nutritionCompliance: 80
    }
  })
})

const { success, data } = await progress.json()

if (success) {
  console.log('Goal Achievement Prediction:')
  console.log(`Estimated goal date: ${data.prediction.estimatedGoalDate}`)
  console.log(`Confidence: ${data.prediction.confidence * 100}%`)
  console.log(`Weekly progress rate: ${data.prediction.weeklyProgressRate} kg`)
  console.log('Milestones:', data.milestones)
}
```

### Detekce rizikových klientů (churn)

```javascript
// POST /api/ai/churn
const churn = await fetch('/api/ai/churn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: {
      id: clientId,
      name: 'Jan Neaktivní',
      startDate: '2023-06-01',
      membershipType: 'monthly'
    },
    attendanceData: {
      totalSessionsBooked: 40,
      totalSessionsAttended: 30,
      totalSessionsCancelled: 8,
      totalNoShows: 2,
      lastSessionDate: '2024-01-05',
      daysSinceLastSession: 21,
      averageSessionsPerWeek: 1.5,
      trendLastMonth: 'decreasing'
    },
    engagementData: {
      responsiveness: 'low',
      appUsage: 'rare'
    },
    progressData: {
      goalProgress: 35,
      plateauWeeks: 4
    },
    financialData: {
      outstandingBalance: 1500,
      paymentIssues: 1,
      packageCreditsRemaining: 3
    }
  })
})

const { success, data } = await churn.json()

if (success) {
  console.log('Churn Risk Assessment:')
  console.log(`Risk Score: ${data.riskAssessment.riskScore}/100`)
  console.log(`Risk Level: ${data.riskAssessment.riskLevel}`)
  console.log(`Urgency: ${data.riskAssessment.urgency}`)
  console.log('Top Risk Factors:')
  data.riskFactors.forEach(f => {
    console.log(`- ${f.factor} (${f.impact} impact)`)
  })
  console.log('Recommended Actions:')
  data.retentionStrategies.forEach(s => {
    console.log(`- ${s.action} (${s.priority} priority)`)
  })
}
```

---

## Dashboard & Analytics

### Získání dashboard statistik

```javascript
// GET /api/dashboard/stats
const stats = await fetch('/api/dashboard/stats')
const { stats: dashboardStats } = await stats.json()

console.log('Dashboard Stats:')
console.log(`Active Clients: ${dashboardStats.activeClients.value}`)
console.log(`  Change: ${dashboardStats.activeClients.change > 0 ? '+' : ''}${dashboardStats.activeClients.change}%`)

console.log(`This Week Sessions: ${dashboardStats.weekSessions.value}`)
console.log(`  Change: ${dashboardStats.weekSessions.change > 0 ? '+' : ''}${dashboardStats.weekSessions.change}%`)

console.log(`Monthly Revenue: ${dashboardStats.monthlyRevenue.formatted}`)
console.log(`  Change: ${dashboardStats.monthlyRevenue.change > 0 ? '+' : ''}${dashboardStats.monthlyRevenue.change}%`)

console.log(`Avg Client Progress: ${dashboardStats.avgProgress.value}%`)
```

### Získání rizikových klientů

```javascript
// GET /api/dashboard/at-risk
const atRisk = await fetch('/api/dashboard/at-risk')
const { clients, totalAtRisk, summary } = await atRisk.json()

console.log(`Total at-risk clients: ${totalAtRisk}`)
console.log(`- Critical: ${summary.critical}`)
console.log(`- High: ${summary.high}`)
console.log(`- Medium: ${summary.medium}`)

console.log('\nTop 10 at-risk clients:')
clients.forEach((client, index) => {
  console.log(`${index + 1}. ${client.name}`)
  console.log(`   Risk: ${client.riskLevel} (${client.riskScore}/100)`)
  console.log(`   Last session: ${client.daysSinceLastSession} days ago`)
  console.log(`   Action: ${client.suggestedAction}`)
  console.log(`   Urgency: ${client.urgency}`)
})
```

---

## Komplexní Workflow Příklady

### Onboarding nového klienta

```javascript
async function onboardNewClient(clientData) {
  // 1. Vytvořit klienta
  const client = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData)
  })
  const { id: clientId } = await client.json()

  // 2. Přidat úvodní měření
  await fetch(`/api/clients/${clientId}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weight: clientData.currentWeight,
      bodyFat: clientData.bodyFatPercent,
      measurements: clientData.bodyMeasurements,
      notes: 'Initial assessment'
    })
  })

  // 3. Vygenerovat první workout plán
  const workout = await fetch('/api/ai/workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client: {
        id: clientId,
        name: clientData.name,
        age: calculateAge(clientData.dateOfBirth),
        gender: clientData.gender,
        fitnessLevel: clientData.fitnessLevel,
        goals: clientData.goals
      },
      sessionGoals: {
        duration: 60,
        intensity: 'moderate',
        focus: ['assessment', 'introduction']
      }
    })
  })

  // 4. Naplánovat úvodní session
  const session = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      scheduledAt: getNextAvailableSlot(),
      duration: 60,
      notes: 'Initial consultation and assessment'
    })
  })

  console.log('Client onboarded successfully!')
  return clientId
}
```

### Týdenní přehled trenéra

```javascript
async function getWeeklyOverview() {
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  // 1. Získat statistiky
  const stats = await fetch('/api/dashboard/stats').then(r => r.json())

  // 2. Získat týdenní sessions
  const sessions = await fetch(
    `/api/sessions?startDate=${startOfWeek}&endDate=${endOfWeek}`
  ).then(r => r.json())

  // 3. Získat rizikové klienty
  const atRisk = await fetch('/api/dashboard/at-risk').then(r => r.json())

  // 4. Připravit přehled
  const overview = {
    stats: stats.stats,
    thisWeek: {
      totalSessions: sessions.sessions.length,
      completed: sessions.sessions.filter(s => s.status === 'completed').length,
      upcoming: sessions.sessions.filter(s => s.status === 'scheduled').length,
      revenue: sessions.sessions
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.price || 0), 0)
    },
    alerts: {
      atRiskClients: atRisk.totalAtRisk,
      criticalClients: atRisk.summary.critical
    }
  }

  return overview
}
```

### Kompletní platební flow

```javascript
async function handlePackagePurchase(clientId, packageId) {
  // 1. Získat detaily balíčku
  const pkg = await fetch(`/api/packages/${packageId}`).then(r => r.json())

  // 2. Vytvořit checkout session
  const checkout = await fetch('/api/payments/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId, clientId })
  }).then(r => r.json())

  // 3. Přesměrovat na Stripe
  window.location.href = checkout.checkoutUrl

  // 4. Po úspěšné platbě (webhook handler):
  // - Automaticky přidá kredity klientovi
  // - Vytvoří order záznam
  // - Odešle potvrzovací email
}

// Success page po návratu ze Stripe
async function handlePaymentSuccess(sessionId) {
  // Získat detaily z URL parametru
  const urlParams = new URLSearchParams(window.location.search)
  const stripeSessionId = urlParams.get('session_id')

  if (stripeSessionId) {
    // Zobrazit potvrzení
    showSuccessMessage('Platba byla úspěšná! Kredity byly přidány.')

    // Přesměrovat na dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }
}
```

---

## Error Handling

### Robust error handling

```javascript
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()

      switch (response.status) {
        case 400:
          console.error('Validation error:', error.details)
          throw new Error(error.error || 'Neplatná data')

        case 401:
          console.error('Authentication required')
          // Redirect to login
          window.location.href = '/auth/signin'
          throw new Error('Přihlášení vyžadováno')

        case 403:
          console.error('Permission denied')
          throw new Error('Nemáte oprávnění k této operaci')

        case 404:
          console.error('Resource not found')
          throw new Error('Záznam nenalezen')

        case 500:
          console.error('Server error:', error)
          throw new Error('Interní chyba serveru')

        default:
          throw new Error(error.error || 'Neznámá chyba')
      }
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Použití
try {
  const client = await safeApiCall('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData)
  })
  console.log('Client created:', client.id)
} catch (error) {
  alert(`Chyba: ${error.message}`)
}
```

---

## TypeScript Typy

```typescript
// Client types
interface Client {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: Date
  gender?: string
  goals: string[]
  currentWeight?: number
  targetWeight?: number
  height?: number
  bodyFatPercent?: number
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
  creditsRemaining: number
  status: 'active' | 'inactive' | 'paused'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Session types
interface Session {
  id: string
  tenantId: string
  clientId: string
  scheduledAt: Date
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  muscleGroups: string[]
  workoutPlan?: any
  exercisesLogged?: any[]
  caloriesBurned?: number
  heartRateAvg?: number
  intensity?: 'low' | 'moderate' | 'high'
  price?: number
  paid: boolean
}

// API Response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any[]
}

interface ListResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

---

## Poslední tipy

### Best Practices

1. **Vždy validuj input** před odesláním na API
2. **Handle errors gracefully** - zobrazuj uživatelsky přívětivé chyby
3. **Use loading states** během API calls
4. **Cache data kde možno** pro lepší UX
5. **Debounce search** pro vyhledávání
6. **Optimistic updates** pro lepší responsiveness

### Performance

```javascript
// Debounce search
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const searchClients = debounce(async (query) => {
  const results = await fetch(`/api/clients?search=${query}`)
  // Update UI
}, 300)

// Optimistic UI update
async function deleteClient(clientId) {
  // 1. Optimistically remove from UI
  removeClientFromUI(clientId)

  try {
    // 2. Make API call
    await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
  } catch (error) {
    // 3. Rollback on error
    restoreClientInUI(clientId)
    showError('Nepodařilo se smazat klienta')
  }
}
```

---

**Datum poslední aktualizace**: 2025-01-26
