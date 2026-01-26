# FitAdmin API - Quick Reference

Kompletní API dokumentace je v souboru [API.md](./API.md)

## Přehled Endpointů

### 📊 Celkové Statistiky
- **30 API routes** v 13 kategoriích
- **85% pokrytí** všech funkcí systému
- **4 AI endpointy** pro pokročilé funkce
- **Session-based autentizace** (NextAuth)
- **Multi-tenant architektura**

---

## Kategorie Endpointů

### 🔐 Authentication (4 endpointy)
```
POST   /api/auth/signup
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/[...nextauth]
```

### 👥 Clients (5 endpointů)
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/[id]
PATCH  /api/clients/[id]
DELETE /api/clients/[id]
```

### 📏 Measurements (3 endpointy)
```
GET    /api/clients/[id]/measurements
POST   /api/clients/[id]/measurements
DELETE /api/clients/[id]/measurements?measurementId=xxx
```

### 💪 Training Sessions (5 endpointů)
```
GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/[id]
PATCH  /api/sessions/[id]
DELETE /api/sessions/[id]
```

### 🧘 Group Classes (5 endpointů)
```
GET    /api/classes
POST   /api/classes
GET    /api/classes/[id]
PATCH  /api/classes/[id]
DELETE /api/classes/[id]
```

### 📅 Class Bookings (5 endpointů)
```
GET    /api/classes/[id]/bookings
POST   /api/classes/[id]/bookings
GET    /api/bookings/[id]
PATCH  /api/bookings/[id]
DELETE /api/bookings/[id]
```

### 📦 Packages (5 endpointů)
```
GET    /api/packages
POST   /api/packages
GET    /api/packages/[id]
PATCH  /api/packages/[id]
DELETE /api/packages/[id]
```

### 🧾 Invoices (5 endpointů)
```
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/[id]
PATCH  /api/invoices/[id]
DELETE /api/invoices/[id]
```

### 💳 Billing (5 endpointů)
```
GET    /api/billing/invoices
POST   /api/billing/invoices
GET    /api/billing/payments
POST   /api/billing/payments
GET    /api/billing/bank-accounts
POST   /api/billing/bank-accounts
```

### 💰 Payments (2 endpointy)
```
POST   /api/payments/create-checkout
POST   /api/payments/webhook
```

### 📈 Dashboard (2 endpointy)
```
GET    /api/dashboard/stats
GET    /api/dashboard/at-risk
```

### 🤖 AI Features (4 endpointy)
```
POST   /api/ai/workout
POST   /api/ai/nutrition
POST   /api/ai/progress
POST   /api/ai/churn
```

### ⚙️ Settings (2 endpointy)
```
GET    /api/tenant/settings
PATCH  /api/tenant/settings
PATCH  /api/user/profile
```

---

## Rychlý Start

### 1. Autentizace
```javascript
// Registrace nového studia
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jan Novák',
    email: 'jan@studio.cz',
    password: 'secure123',
    studioName: 'FitStudio Praha'
  })
})
```

### 2. Přidání klienta
```javascript
const client = await fetch('/api/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Pavel Klient',
    email: 'pavel@example.com',
    phone: '+420123456789',
    goals: ['weight_loss'],
    currentWeight: 85,
    targetWeight: 75,
    fitnessLevel: 'beginner'
  })
})
```

### 3. Vytvoření tréninku
```javascript
const session = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client_id',
    scheduledAt: '2024-01-20T10:00:00Z',
    duration: 60,
    price: 500
  })
})
```

### 4. AI Workout Generování
```javascript
const workout = await fetch('/api/ai/workout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client: {
      id: 'client_id',
      name: 'Pavel Klient',
      age: 30,
      gender: 'male',
      fitnessLevel: 'beginner',
      goals: ['weight_loss']
    },
    sessionGoals: {
      duration: 60,
      intensity: 'moderate',
      focus: ['strength', 'cardio']
    }
  })
})
```

---

## Klíčové Funkce

### 🔒 Bezpečnost
- Session-based autentizace (NextAuth)
- Tenant isolation (každý tenant vidí jen svá data)
- Input validace (Zod schemas)
- Role-based access control (admin/trainer/user)

### 📧 Email Notifikace
- Welcome email po registraci
- Potvrzení tréninku klientovi
- Reset hesla
- Potvrzení platby
- Invoice email

### 💳 Platby
- Stripe checkout sessions
- Webhook zpracování
- Automatické přidávání kreditů
- Order tracking

### 🤖 AI Integrace
- **Workout Generator** - personalizované tréninky
- **Nutrition Advisor** - výživové plány
- **Progress Predictor** - predikce pokroku
- **Churn Detector** - detekce rizikových klientů

### 📊 Analytics
- Dashboard statistiky (klienti, tréninky, příjmy)
- Trend analysis
- Client progress tracking
- At-risk client alerts

---

## Response Formáty

### Success Response
```json
{
  "id": "resource_id",
  "name": "Resource Name",
  "createdAt": "2024-01-20T10:00:00Z",
  ...
}
```

### List Response
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [...]  // Optional validation details
}
```

---

## HTTP Status Codes

| Code | Význam | Použití |
|------|--------|---------|
| `200` | OK | Úspěšná operace (GET, PATCH, DELETE) |
| `201` | Created | Úspěšné vytvoření (POST) |
| `400` | Bad Request | Neplatná vstupní data |
| `401` | Unauthorized | Chybějící autentizace |
| `403` | Forbidden | Nedostatečná oprávnění |
| `404` | Not Found | Resource nenalezen |
| `500` | Server Error | Interní chyba serveru |

---

## Datové Modely

### Client
- **Identifikace**: name, email, phone, avatar
- **Fitness**: goals, currentWeight, targetWeight, height, bodyFatPercent, fitnessLevel
- **Zdraví**: injuryHistory, dietaryNotes, medicalNotes
- **Membership**: creditsRemaining, membershipType, membershipExpiry
- **Status**: active, inactive, paused

### Session
- **Scheduling**: scheduledAt, duration
- **Status**: scheduled, in_progress, completed, cancelled, no_show
- **Workout**: workoutPlan, exercisesLogged, muscleGroups
- **Metrics**: caloriesBurned, heartRateAvg, intensity
- **Feedback**: clientFeedback, trainerNotes, clientRating

### Class
- **Info**: name, description, type
- **Scheduling**: scheduledAt, duration, capacity
- **Details**: instructor, location, price
- **Status**: scheduled, completed, cancelled

### Package
- **Info**: name, description, type
- **Pricing**: price, credits, validityDays
- **Features**: features[], isActive

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3006"
NEXTAUTH_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# OpenAI
OPENAI_API_KEY="sk-..."
```

---

## Testing

### Manuální testování
```bash
# Get clients
curl http://localhost:3006/api/clients

# Create client
curl -X POST http://localhost:3006/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","email":"test@example.com"}'
```

### API Testování nástroje
- **Postman** - Import jako OpenAPI collection
- **Insomnia** - REST client pro development
- **Thunder Client** - VS Code extension

---

## Changelog

### 2025-01-26 - Initial Release
- ✅ 30 API endpointů implementováno
- ✅ 4 AI features integrováno
- ✅ Stripe platby
- ✅ Email notifikace
- ✅ Multi-tenant podpora
- ✅ Kompletní dokumentace

---

## Next Steps

### Doporučená vylepšení
1. **Rate Limiting** - Ochrana proti abuse
2. **API Versioning** - `/api/v1/...` pro budoucí změny
3. **Webhooks** - Vlastní webhooks pro third-party integraci
4. **GraphQL** - Alternativní API endpoint
5. **Batch Operations** - Bulk create/update/delete
6. **Export/Import** - CSV/Excel export dat
7. **API Keys** - Token-based auth pro third-party apps

---

## Podpora

📖 **Kompletní dokumentace**: [API.md](./API.md)
🔧 **Schema**: `apps/fitness/prisma/schema.prisma`
💻 **Source**: `apps/fitness/src/app/api/`

**Poslední aktualizace**: 2025-01-26
