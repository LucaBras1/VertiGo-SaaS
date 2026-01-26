# FitAdmin API Documentation

Comprehensive API documentation for the FitAdmin fitness vertical. All endpoints require authentication via NextAuth unless specified otherwise.

**Base URL:** `http://localhost:3006/api` (development) or your production domain

**Authentication:** Session-based authentication via NextAuth. Include session cookie in requests.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Clients](#clients)
3. [Client Measurements](#client-measurements)
4. [Training Sessions](#training-sessions)
5. [Group Classes](#group-classes)
6. [Class Bookings](#class-bookings)
7. [Packages](#packages)
8. [Invoices](#invoices)
9. [Billing](#billing)
10. [Payments](#payments)
11. [Dashboard](#dashboard)
12. [AI Features](#ai-features)
13. [Settings](#settings)

---

## Authentication

### POST /api/auth/signup

Create a new trainer/studio account with tenant.

**Authentication:** None (public endpoint)

**Request Body:**
```typescript
{
  name: string              // Min 2 characters
  email: string             // Valid email
  password: string          // Min 6 characters
  studioName: string        // Min 2 characters
}
```

**Success Response (200):**
```json
{
  "message": "Registrace úspěšná",
  "user": {
    "id": "cuid_string",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Invalid data or user already exists
- `500` - Server error

**Notes:**
- Creates both tenant (studio) and admin user in transaction
- Generates unique slug from studio name
- Sends welcome email asynchronously
- Password is hashed with bcrypt (12 rounds)
- New tenant starts with 100 AI credits

---

### POST /api/auth/forgot-password

Request password reset email.

**Authentication:** None (public endpoint)

**Request Body:**
```typescript
{
  email: string             // Valid email
}
```

**Success Response (200):**
```json
{
  "message": "Pokud účet existuje, byl odeslán email s instrukcemi."
}
```

**Error Responses:**
- `400` - Invalid email format
- `500` - Server error

**Notes:**
- Returns success message regardless of email existence (prevents enumeration)
- Generates secure 32-byte token
- Token valid for 1 hour
- Deletes any existing tokens for the email

---

### POST /api/auth/reset-password

Reset password using token from email.

**Authentication:** None (public endpoint)

**Request Body:**
```typescript
{
  token: string             // Token from email link
  password: string          // Min 8 characters
}
```

**Success Response (200):**
```json
{
  "message": "Heslo bylo úspěšně změněno. Nyní se můžete přihlásit."
}
```

**Error Responses:**
- `400` - Invalid token or expired token
- `404` - User not found
- `500` - Server error

**Notes:**
- Validates token expiration
- Hashes new password with bcrypt
- Deletes token after use

---

## Clients

### GET /api/clients

Get list of clients for the authenticated tenant.

**Authentication:** Required

**Query Parameters:**
```typescript
search?: string           // Search by name, email, or phone
status?: string          // Filter by status (active, inactive, paused)
fitnessLevel?: string    // Filter by fitness level
includeMeasurements?: boolean  // Include latest measurements
page?: number            // Page number (default: 1)
limit?: number           // Items per page (default: 20, max: 50)
```

**Success Response (200):**
```json
{
  "clients": [
    {
      "id": "client_id",
      "name": "John Client",
      "email": "client@example.com",
      "phone": "+420123456789",
      "avatar": "https://...",
      "dateOfBirth": "1990-01-01T00:00:00Z",
      "gender": "male",
      "goals": ["weight_loss", "muscle_gain"],
      "currentWeight": 80.5,
      "targetWeight": 75.0,
      "height": 180,
      "bodyFatPercent": 18.5,
      "fitnessLevel": "intermediate",
      "creditsRemaining": 10,
      "membershipType": "monthly",
      "membershipExpiry": "2024-12-31T00:00:00Z",
      "status": "active",
      "tags": ["vip", "motivated"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z",
      "_count": {
        "sessions": 45
      },
      "measurements": [...]  // If includeMeasurements=true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/clients

Create a new client.

**Authentication:** Required

**Request Body:**
```typescript
{
  name: string                    // Required, min 2 chars
  email: string                   // Required, valid email
  phone?: string
  dateOfBirth?: string           // ISO 8601 date
  gender?: string
  goals?: string[]               // e.g., ["weight_loss", "strength"]
  currentWeight?: number         // kg
  targetWeight?: number          // kg
  height?: number                // cm
  fitnessLevel?: string          // beginner, intermediate, advanced
  injuryHistory?: string
  dietaryNotes?: string
  medicalNotes?: string
  membershipType?: string
  creditsRemaining?: number
  membershipExpiry?: string      // ISO 8601 date
  notes?: string
  tags?: string[]
}
```

**Success Response (201):**
```json
{
  "id": "client_id",
  "name": "John Client",
  "email": "client@example.com",
  "status": "active",
  "creditsRemaining": 0,
  ...
}
```

**Error Responses:**
- `400` - Invalid data or duplicate email
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/clients/[id]

Get detailed information about a specific client.

**Authentication:** Required

**Success Response (200):**
```json
{
  "id": "client_id",
  "name": "John Client",
  "email": "client@example.com",
  ...,
  "sessions": [...],           // Last 10 sessions
  "measurements": [...],       // Last 10 measurements
  "progressPhotos": [...],     // Last 10 photos
  "_count": {
    "sessions": 45,
    "orders": 5,
    "invoices": 3
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

---

### PATCH /api/clients/[id]

Update client information.

**Authentication:** Required

**Request Body:**
```typescript
{
  name?: string
  email?: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  goals?: string[]
  currentWeight?: number | null
  targetWeight?: number | null
  height?: number | null
  fitnessLevel?: string | null
  injuryHistory?: string | null
  dietaryNotes?: string | null
  medicalNotes?: string | null
  membershipType?: string | null
  creditsRemaining?: number
  membershipExpiry?: string | null
  notes?: string | null
  tags?: string[]
  status?: "active" | "inactive" | "paused"
}
```

**Success Response (200):**
```json
{
  "id": "client_id",
  "name": "Updated Name",
  ...
}
```

**Error Responses:**
- `400` - Invalid data or duplicate email
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

---

### DELETE /api/clients/[id]

Delete a client (cascade deletes sessions, measurements, etc.).

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

---

## Client Measurements

### GET /api/clients/[id]/measurements

Get all measurements for a client with progress statistics.

**Authentication:** Required

**Success Response (200):**
```json
{
  "measurements": [
    {
      "id": "measurement_id",
      "clientId": "client_id",
      "date": "2024-01-15T00:00:00Z",
      "weight": 78.5,
      "bodyFat": 17.2,
      "measurements": {
        "chest": 100,
        "waist": 80,
        "hips": 95,
        "biceps": 35,
        "thighs": 55
      },
      "notes": "Great progress this week",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "totalMeasurements": 12,
    "weightChange": -2.0,          // kg lost
    "bodyFatChange": -1.3,         // % lost
    "trend": "improving",          // improving, stable, declining
    "firstMeasurement": "2024-01-01T00:00:00Z",
    "latestMeasurement": "2024-01-15T00:00:00Z",
    "startWeight": 80.5,
    "currentWeight": 78.5,
    "startBodyFat": 18.5,
    "currentBodyFat": 17.2
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

---

### POST /api/clients/[id]/measurements

Add a new measurement for a client.

**Authentication:** Required

**Request Body:**
```typescript
{
  date?: string              // ISO 8601, defaults to now
  weight?: number            // kg
  bodyFat?: number           // percentage
  measurements?: {           // Body measurements in cm
    chest?: number
    waist?: number
    hips?: number
    biceps?: number
    thighs?: number
    // ... any custom measurements
  }
  notes?: string
}
```

**Success Response (201):**
```json
{
  "measurement": {
    "id": "measurement_id",
    "clientId": "client_id",
    "date": "2024-01-15T00:00:00Z",
    "weight": 78.5,
    "bodyFat": 17.2,
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

**Notes:**
- Automatically updates client's current stats
- Creates measurement record for historical tracking

---

### DELETE /api/clients/[id]/measurements?measurementId=xxx

Delete a specific measurement.

**Authentication:** Required

**Query Parameters:**
```typescript
measurementId: string      // Required
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400` - Missing measurementId
- `401` - Unauthorized
- `404` - Client or measurement not found
- `500` - Server error

---

## Training Sessions

### GET /api/sessions

Get list of training sessions (1-on-1).

**Authentication:** Required

**Query Parameters:**
```typescript
clientId?: string          // Filter by client
status?: string           // scheduled, completed, cancelled, no_show
startDate?: string        // ISO 8601
endDate?: string          // ISO 8601
page?: number             // Default: 1
limit?: number            // Default: 50
```

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "session_id",
      "tenantId": "tenant_id",
      "clientId": "client_id",
      "scheduledAt": "2024-01-20T10:00:00Z",
      "duration": 60,
      "status": "scheduled",
      "muscleGroups": ["chest", "triceps"],
      "workoutPlan": {...},      // AI-generated plan
      "exercisesLogged": [...],
      "caloriesBurned": 450,
      "heartRateAvg": 140,
      "clientFeedback": "Great session!",
      "trainerNotes": "Client pushed hard",
      "intensity": "high",
      "clientRating": 5,
      "price": 500,
      "paid": true,
      "createdAt": "2024-01-15T00:00:00Z",
      "client": {
        "id": "client_id",
        "name": "John Client",
        "email": "client@example.com",
        "phone": "+420123456789",
        "creditsRemaining": 9
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/sessions

Create a new training session.

**Authentication:** Required

**Request Body:**
```typescript
{
  clientId: string           // Required
  scheduledAt: string        // Required, ISO 8601
  duration?: number          // Minutes, default: 60 (15-180)
  muscleGroups?: string[]
  price?: number
  notes?: string
}
```

**Success Response (201):**
```json
{
  "id": "session_id",
  "tenantId": "tenant_id",
  "clientId": "client_id",
  "scheduledAt": "2024-01-20T10:00:00Z",
  "duration": 60,
  "status": "scheduled",
  "client": {
    "id": "client_id",
    "name": "John Client",
    "email": "client@example.com"
  },
  ...
}
```

**Error Responses:**
- `400` - Invalid data
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

**Notes:**
- Sends confirmation email to client
- Email includes session date, time, duration, and location

---

### GET /api/sessions/[id]

Get detailed information about a specific session.

**Authentication:** Required

**Success Response (200):**
```json
{
  "id": "session_id",
  "scheduledAt": "2024-01-20T10:00:00Z",
  "duration": 60,
  "status": "completed",
  "workoutPlan": {
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": 10,
        "weight": 80,
        "rest": 90
      }
    ]
  },
  "exercisesLogged": [...],
  "client": {
    "id": "client_id",
    "name": "John Client",
    "email": "client@example.com",
    "goals": ["muscle_gain"],
    "fitnessLevel": "intermediate",
    "currentWeight": 78.5,
    "injuryHistory": "Previous shoulder injury"
  },
  ...
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Session not found
- `500` - Server error

---

### PATCH /api/sessions/[id]

Update session details.

**Authentication:** Required

**Request Body:**
```typescript
{
  scheduledAt?: string
  duration?: number              // 15-180 minutes
  status?: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show"
  muscleGroups?: string[]
  workoutPlan?: any             // JSON workout plan
  exercisesLogged?: any[]       // Completed exercises
  caloriesBurned?: number
  heartRateAvg?: number
  clientFeedback?: string
  trainerNotes?: string
  intensity?: "low" | "moderate" | "high"
  clientRating?: number         // 1-5
  price?: number
  paid?: boolean
}
```

**Success Response (200):**
```json
{
  "id": "session_id",
  "status": "completed",
  ...
}
```

**Error Responses:**
- `400` - Invalid data
- `401` - Unauthorized
- `404` - Session not found
- `500` - Server error

**Notes:**
- When status changes to "completed", automatically deducts 1 credit from client

---

### DELETE /api/sessions/[id]

Delete a training session.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Session not found
- `500` - Server error

---

## Group Classes

### GET /api/classes

Get list of group classes.

**Authentication:** Required

**Success Response (200):**
```json
{
  "classes": [
    {
      "id": "class_id",
      "tenantId": "tenant_id",
      "name": "Morning Yoga",
      "description": "Energizing yoga session",
      "type": "yoga",
      "scheduledAt": "2024-01-20T08:00:00Z",
      "duration": 60,
      "capacity": 15,
      "instructor": "Jane Trainer",
      "location": "Studio A",
      "price": 200,
      "isRecurring": true,
      "recurrence": "weekly",
      "status": "scheduled",
      "createdAt": "2024-01-01T00:00:00Z",
      "_count": {
        "bookings": 12
      }
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/classes

Create a new group class.

**Authentication:** Required

**Request Body:**
```typescript
{
  name: string               // Required
  description?: string
  scheduledAt: string        // Required, ISO 8601
  duration: number           // Required, minutes
  capacity: number           // Required, max participants
  location?: string
  price: number              // Required
}
```

**Success Response (201):**
```json
{
  "class": {
    "id": "class_id",
    "name": "Morning Yoga",
    "scheduledAt": "2024-01-20T08:00:00Z",
    "duration": 60,
    "capacity": 15,
    "price": 200,
    "status": "scheduled",
    ...
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/classes/[id]

Get detailed information about a specific class.

**Authentication:** Required

**Success Response (200):**
```json
{
  "class": {
    "id": "class_id",
    "name": "Morning Yoga",
    "scheduledAt": "2024-01-20T08:00:00Z",
    "capacity": 15,
    "bookings": [
      {
        "id": "booking_id",
        "clientId": "client_id",
        "status": "confirmed",
        "checkedIn": false,
        "paid": true,
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "_count": {
      "bookings": 12
    },
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### PATCH /api/classes/[id]

Update class details.

**Authentication:** Required

**Request Body:**
```typescript
{
  name?: string
  description?: string | null
  scheduledAt?: string
  duration?: number
  capacity?: number
  location?: string | null
  price?: number
  status?: string
}
```

**Success Response (200):**
```json
{
  "class": {
    "id": "class_id",
    "name": "Updated Yoga",
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### DELETE /api/classes/[id]

Delete a group class.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400` - Cannot delete class with active bookings
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

## Class Bookings

### GET /api/classes/[id]/bookings

Get all bookings for a specific class.

**Authentication:** Required

**Success Response (200):**
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "classId": "class_id",
      "clientId": "client_id",
      "status": "confirmed",
      "checkedIn": true,
      "paid": true,
      "createdAt": "2024-01-15T00:00:00Z",
      "client": {
        "id": "client_id",
        "name": "John Client",
        "email": "client@example.com",
        "phone": "+420123456789",
        "avatar": "https://...",
        "creditsRemaining": 9
      }
    }
  ],
  "totalCount": 12,
  "checkedInCount": 8,
  "capacity": 15,
  "availableSpots": 3
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Class not found
- `500` - Server error

---

### POST /api/classes/[id]/bookings

Create a booking for a class.

**Authentication:** Required

**Request Body:**
```typescript
{
  clientId: string           // Required
  useCredits?: boolean       // Default: false
}
```

**Success Response (201):**
```json
{
  "booking": {
    "id": "booking_id",
    "classId": "class_id",
    "clientId": "client_id",
    "status": "confirmed",
    "checkedIn": false,
    "paid": true,
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing clientId, class full, past class, or duplicate booking
- `401` - Unauthorized
- `404` - Class or client not found
- `500` - Server error

**Notes:**
- If `useCredits=true` and client has credits, deducts 1 credit and marks as paid
- Checks capacity before booking
- Prevents duplicate bookings
- Cannot book past classes

---

### GET /api/bookings/[id]

Get details of a specific booking.

**Authentication:** Required

**Success Response (200):**
```json
{
  "booking": {
    "id": "booking_id",
    "classId": "class_id",
    "clientId": "client_id",
    "status": "confirmed",
    "checkedIn": true,
    "paid": true,
    "createdAt": "2024-01-15T00:00:00Z",
    "class": {
      "id": "class_id",
      "name": "Morning Yoga",
      "scheduledAt": "2024-01-20T08:00:00Z",
      ...
    },
    "client": {
      "id": "client_id",
      "name": "John Client",
      "email": "client@example.com",
      ...
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Booking not found
- `500` - Server error

---

### PATCH /api/bookings/[id]

Update booking (check-in, status, payment).

**Authentication:** Required

**Request Body:**
```typescript
{
  checkedIn?: boolean
  status?: string            // confirmed, waitlist, cancelled
  paid?: boolean
}
```

**Success Response (200):**
```json
{
  "booking": {
    "id": "booking_id",
    "checkedIn": true,
    "status": "confirmed",
    "paid": true,
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Booking not found
- `500` - Server error

---

### DELETE /api/bookings/[id]

Cancel a booking (soft delete).

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Booking not found
- `500` - Server error

**Notes:**
- Changes status to "cancelled" instead of deleting
- If paid with credits, refunds 1 credit to client

---

## Packages

### GET /api/packages

Get list of packages (membership plans).

**Authentication:** Required

**Success Response (200):**
```json
{
  "packages": [
    {
      "id": "package_id",
      "tenantId": "tenant_id",
      "name": "10 Session Package",
      "description": "Perfect for beginners",
      "type": "sessions",
      "price": 4500,
      "credits": 10,
      "validityDays": 90,
      "features": [
        "10 personal training sessions",
        "Nutrition consultation",
        "Progress tracking"
      ],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/packages

Create a new package.

**Authentication:** Required

**Request Body:**
```typescript
{
  name: string               // Required
  description?: string
  type: string              // Required (sessions, classes, monthly)
  price: number             // Required
  credits: number           // Required (number of sessions/classes)
  validityDays: number      // Required (how long package is valid)
  features?: string[]
  isActive?: boolean        // Default: true
}
```

**Success Response (201):**
```json
{
  "package": {
    "id": "package_id",
    "name": "10 Session Package",
    "type": "sessions",
    "price": 4500,
    "credits": 10,
    "validityDays": 90,
    ...
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/packages/[id]

Get details of a specific package.

**Authentication:** Required

**Success Response (200):**
```json
{
  "package": {
    "id": "package_id",
    "name": "10 Session Package",
    "description": "Perfect for beginners",
    "type": "sessions",
    "price": 4500,
    "credits": 10,
    "validityDays": 90,
    "features": [...],
    "isActive": true,
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Package not found
- `500` - Server error

---

### PATCH /api/packages/[id]

Update package details.

**Authentication:** Required

**Request Body:**
```typescript
{
  name?: string
  description?: string | null
  type?: string
  price?: number
  credits?: number
  validityDays?: number
  features?: string[]
  isActive?: boolean
}
```

**Success Response (200):**
```json
{
  "package": {
    "id": "package_id",
    "name": "Updated Package",
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Package not found
- `500` - Server error

---

### DELETE /api/packages/[id]

Delete a package.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Package not found
- `500` - Server error

---

## Invoices

### GET /api/invoices

Get list of invoices.

**Authentication:** Required

**Success Response (200):**
```json
{
  "invoices": [
    {
      "id": "invoice_id",
      "tenantId": "tenant_id",
      "clientId": "client_id",
      "invoiceNumber": "20240001",
      "status": "sent",
      "issueDate": "2024-01-15T00:00:00Z",
      "dueDate": "2024-02-15T00:00:00Z",
      "paidDate": null,
      "subtotal": 4500,
      "tax": 0,
      "total": 4500,
      "paymentMethod": null,
      "notes": "10 Session Package",
      "createdAt": "2024-01-15T00:00:00Z",
      "client": {
        "id": "client_id",
        "name": "John Client",
        "email": "client@example.com"
      }
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/invoices

Create a new invoice.

**Authentication:** Required

**Request Body:**
```typescript
{
  clientId: string           // Required
  dueDate: string           // Required, ISO 8601
  items: Array<{            // Required, at least 1 item
    description: string
    quantity: number
    unitPrice: number
  }>
  notes?: string
  subtotal?: number
  tax?: number
  total?: number
}
```

**Success Response (201):**
```json
{
  "invoice": {
    "id": "invoice_id",
    "invoiceNumber": "20240001",
    "status": "draft",
    "issueDate": "2024-01-15T00:00:00Z",
    "dueDate": "2024-02-15T00:00:00Z",
    "subtotal": 4500,
    "tax": 0,
    "total": 4500,
    "client": {
      "id": "client_id",
      "name": "John Client",
      "email": "client@example.com"
    },
    ...
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Unauthorized
- `404` - Client not found
- `500` - Server error

**Notes:**
- Invoice number is auto-generated: `{YEAR}{sequential_4_digits}`
- Items are stored in notes field (schema limitation)

---

### GET /api/invoices/[id]

Get details of a specific invoice.

**Authentication:** Required

**Success Response (200):**
```json
{
  "invoice": {
    "id": "invoice_id",
    "invoiceNumber": "20240001",
    "status": "paid",
    "issueDate": "2024-01-15T00:00:00Z",
    "dueDate": "2024-02-15T00:00:00Z",
    "paidDate": "2024-01-20T00:00:00Z",
    "subtotal": 4500,
    "tax": 0,
    "total": 4500,
    "client": {
      "id": "client_id",
      "name": "John Client",
      "email": "client@example.com",
      ...
    },
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Invoice not found
- `500` - Server error

---

### PATCH /api/invoices/[id]

Update invoice status or details.

**Authentication:** Required

**Request Body:**
```typescript
{
  status?: string            // draft, sent, paid, overdue, cancelled
  paidDate?: string | null   // ISO 8601
  notes?: string | null
}
```

**Success Response (200):**
```json
{
  "invoice": {
    "id": "invoice_id",
    "status": "paid",
    "paidDate": "2024-01-20T00:00:00Z",
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Invoice not found
- `500` - Server error

---

### DELETE /api/invoices/[id]

Delete an invoice.

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `400` - Cannot delete paid invoice
- `401` - Unauthorized
- `404` - Invoice not found
- `500` - Server error

---

## Billing

### GET /api/billing/invoices

Get invoices with payment and transaction details (extended billing version).

**Authentication:** Required

**Success Response (200):**
```json
{
  "invoices": [
    {
      "id": "invoice_id",
      "invoiceNumber": "FIT-2024-0001",
      "status": "paid",
      "dueDate": "2024-02-15T00:00:00Z",
      "subtotal": 4500,
      "tax": 0,
      "total": 4500,
      "client": {...},
      "order": {...},
      "payments": [...],
      "bankTransactions": [...],
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### POST /api/billing/invoices

Create invoice with extended billing features.

**Authentication:** Required

**Request Body:**
```typescript
{
  clientId: string           // Required
  orderId?: string
  dueDate: string           // Required, ISO 8601
  subtotal: number          // Required
  tax?: number              // Default: 0
  notes?: string
}
```

**Success Response (201):**
```json
{
  "invoice": {
    "id": "invoice_id",
    "invoiceNumber": "FIT-2024-0001",
    "status": "draft",
    "dueDate": "2024-02-15T00:00:00Z",
    "subtotal": 4500,
    "tax": 0,
    "total": 4500,
    "client": {...},
    "order": {...}
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

**Notes:**
- Invoice number format: `FIT-{YEAR}-{sequential}`
- Sends invoice email to client if email exists

---

### GET /api/billing/payments

Get all invoice payments with details.

**Authentication:** Required

**Success Response (200):**
```json
{
  "payments": [
    {
      "id": "payment_id",
      "tenantId": "tenant_id",
      "invoiceId": "invoice_id",
      "amount": 4500,
      "currency": "EUR",
      "method": "STRIPE",
      "status": "COMPLETED",
      "gatewayProvider": "stripe",
      "gatewayPaymentId": "pi_xxx",
      "gatewayFee": 135,
      "transactionId": "txn_xxx",
      "reference": "INV-001",
      "processedAt": "2024-01-20T10:00:00Z",
      "completedAt": "2024-01-20T10:00:05Z",
      "createdAt": "2024-01-20T09:59:00Z",
      "invoice": {
        "id": "invoice_id",
        "invoiceNumber": "FIT-2024-0001",
        "client": {...}
      }
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### POST /api/billing/payments

Create a payment record.

**Authentication:** Required

**Request Body:**
```typescript
{
  invoiceId: string          // Required
  amount: number            // Required
  currency?: string         // Default: "EUR"
  method: string            // Required: BANK_TRANSFER, CARD, CASH, PAYPAL, STRIPE, etc.
  reference?: string
}
```

**Success Response (201):**
```json
{
  "payment": {
    "id": "payment_id",
    "invoiceId": "invoice_id",
    "amount": 4500,
    "currency": "EUR",
    "method": "BANK_TRANSFER",
    "status": "PENDING",
    "invoice": {...}
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### GET /api/billing/bank-accounts

Get all bank accounts for the tenant.

**Authentication:** Required

**Success Response (200):**
```json
{
  "bankAccounts": [
    {
      "id": "account_id",
      "tenantId": "tenant_id",
      "accountName": "Business Account",
      "accountNumber": "123456789",
      "bankCode": "0100",
      "iban": "CZ65 0800 0000 1920 0014 5399",
      "swift": "KOMBCZPP",
      "provider": "FIO",
      "currency": "EUR",
      "balance": 125000.50,
      "balanceUpdatedAt": "2024-01-20T00:00:00Z",
      "autoSync": true,
      "lastSyncAt": "2024-01-20T00:00:00Z",
      "syncFrequency": "DAILY",
      "isActive": true,
      "_count": {
        "transactions": 234
      }
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### POST /api/billing/bank-accounts

Add a new bank account.

**Authentication:** Required

**Request Body:**
```typescript
{
  accountName: string        // Required
  accountNumber: string      // Required
  bankCode?: string
  iban?: string
  swift?: string
  provider: string          // Required: FIO, WISE, REVOLUT, PLAID, etc.
  currency?: string         // Default: "EUR"
}
```

**Success Response (201):**
```json
{
  "bankAccount": {
    "id": "account_id",
    "accountName": "Business Account",
    "accountNumber": "123456789",
    "provider": "FIO",
    "currency": "EUR",
    "isActive": true,
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

## Payments

### POST /api/payments/create-checkout

Create Stripe checkout session for package purchase.

**Authentication:** Required

**Request Body:**
```typescript
{
  packageId: string          // Required
  clientId: string          // Required
}
```

**Success Response (200):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_xxx",
  "sessionId": "cs_xxx"
}
```

**Error Responses:**
- `400` - Invalid data
- `401` - Unauthorized
- `404` - Package or client not found
- `500` - Server error

**Notes:**
- Verifies package is active
- Creates Stripe checkout session with metadata
- Redirects to success/cancel URLs

---

### POST /api/payments/webhook

Stripe webhook handler for payment events.

**Authentication:** None (verified via Stripe signature)

**Headers:**
```
stripe-signature: {signature}
```

**Webhook Events Handled:**
- `checkout.session.completed` - Adds credits to client, creates order, sends confirmation email
- `payment_intent.payment_failed` - Logs failure

**Success Response (200):**
```json
{
  "received": true
}
```

**Error Responses:**
- `400` - Missing signature or invalid signature
- `500` - Webhook secret not configured

**Notes:**
- Requires raw body (body parsing disabled)
- Verifies webhook signature
- Creates order with status "completed"
- Increments client credits
- Sends payment confirmation email

---

## Dashboard

### GET /api/dashboard/stats

Get dashboard statistics and KPIs.

**Authentication:** Required

**Success Response (200):**
```json
{
  "stats": {
    "activeClients": {
      "value": 87,
      "change": 12,              // % change from last month
      "trend": "up"
    },
    "weekSessions": {
      "value": 45,
      "change": 8,               // % change from last week
      "trend": "up"
    },
    "monthlyRevenue": {
      "value": 125000,
      "formatted": "125 000 Kč",
      "change": 15,              // % change from last month
      "trend": "up"
    },
    "avgProgress": {
      "value": 68,               // % toward goals
      "change": 5,
      "trend": "up"
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

**Notes:**
- Active clients: Current month vs last month
- Week sessions: This week vs last week
- Revenue: Based on completed sessions this month vs last month
- Avg progress: Calculated from clients with target weight set

---

### GET /api/dashboard/at-risk

Get list of clients at risk of churning (AI-powered).

**Authentication:** Required

**Success Response (200):**
```json
{
  "clients": [
    {
      "id": "client_id",
      "name": "John Client",
      "email": "client@example.com",
      "avatar": "https://...",
      "riskScore": 78,
      "riskLevel": "high",        // critical, high, medium
      "daysSinceLastSession": 21,
      "topRiskFactors": [
        "Extended absence",
        "Declining attendance"
      ],
      "suggestedAction": "Personal outreach",
      "urgency": "high"
    }
  ],
  "totalAtRisk": 15,
  "summary": {
    "critical": 3,
    "high": 7,
    "medium": 5
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

**Notes:**
- Only includes clients with risk score >= 45
- Uses AI churn detection model
- Analyzes attendance, engagement, progress, and financial data
- Returns top 10 at-risk clients sorted by risk score

---

## AI Features

### POST /api/ai/workout

Generate personalized workout plan using AI.

**Authentication:** Required

**Request Body:**
```typescript
{
  client: {
    id: string
    name: string
    age: number
    gender: "male" | "female" | "other"
    fitnessLevel: "beginner" | "intermediate" | "advanced"
    goals: string[]
    injuries?: string[]
    equipment?: string[]
  }
  sessionGoals: {
    duration: number           // minutes
    intensity: "low" | "moderate" | "high"
    focus: string[]           // e.g., ["strength", "cardio"]
    targetMuscleGroups?: string[]
  }
  constraints?: {
    timeLimit?: number
    equipmentAvailable?: string[]
    avoidExercises?: string[]
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "workoutPlan": {
      "warmup": [...],
      "mainWorkout": [
        {
          "exercise": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "notes": "Focus on form",
          "muscleGroups": ["chest", "triceps"]
        }
      ],
      "cooldown": [...]
    },
    "estimatedDuration": 55,
    "estimatedCalories": 450,
    "difficulty": "intermediate",
    "notes": "Focus on progressive overload"
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - AI generation failed

**Notes:**
- Uses OpenAI GPT-4o-mini
- Logs usage and cost to AILog table
- Deducts AI credits from tenant

---

### POST /api/ai/nutrition

Generate personalized nutrition advice using AI.

**Authentication:** Required

**Request Body:**
```typescript
{
  client: {
    id: string
    name: string
    age: number
    gender: "male" | "female" | "other"
    currentWeight: number      // kg
    targetWeight: number       // kg
    height: number            // cm
    activityLevel: "sedentary" | "light" | "moderate" | "very_active" | "extremely_active"
  }
  goals: string[]             // e.g., ["weight_loss", "muscle_gain"]
  dietaryRestrictions?: string[]
  preferences?: {
    mealsPerDay?: number
    cuisine?: string[]
    budget?: "low" | "medium" | "high"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "calorieTarget": {
      "daily": 2200,
      "deficit": -500
    },
    "macros": {
      "protein": 165,          // grams
      "carbs": 220,
      "fats": 73
    },
    "mealPlan": {
      "breakfast": {...},
      "lunch": {...},
      "dinner": {...},
      "snacks": [...]
    },
    "hydrationTarget": 3.0,    // liters
    "supplements": [...],
    "tips": [...]
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - AI generation failed

---

### POST /api/ai/progress

Predict client progress and goal achievement using AI.

**Authentication:** Required

**Request Body:**
```typescript
{
  client: {
    id: string
    name: string
    currentWeight: number
    targetWeight: number
  }
  historicalData: {
    measurements: Array<{
      date: string
      weight: number
      bodyFat?: number
    }>
    attendanceRate: number     // %
    adherenceToProgram: number // %
  }
  currentProgram: {
    weeklySessionCount: number
    averageIntensity: "low" | "moderate" | "high"
    nutritionCompliance: number // %
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "estimatedGoalDate": "2024-06-15",
      "confidence": 0.85,
      "weeklyProgressRate": -0.5,  // kg per week
      "projectedFinalWeight": 74.8
    },
    "milestones": [
      {
        "date": "2024-03-01",
        "weight": 77.5,
        "percentageComplete": 25
      }
    ],
    "riskFactors": [...],
    "recommendations": [...]
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - AI prediction failed

---

### POST /api/ai/churn

Detect churn risk for a specific client using AI.

**Authentication:** Required

**Request Body:**
```typescript
{
  client: {
    id: string
    name: string
    startDate: string
    membershipType?: string
  }
  attendanceData: {
    totalSessionsBooked: number
    totalSessionsAttended: number
    totalSessionsCancelled: number
    totalNoShows: number
    lastSessionDate?: string
    daysSinceLastSession: number
    averageSessionsPerWeek: number
    trendLastMonth: "increasing" | "stable" | "decreasing"
  }
  engagementData: {
    responsiveness: "high" | "medium" | "low"
    appUsage: "frequent" | "moderate" | "rare"
  }
  progressData: {
    goalProgress: number       // % toward goal
    plateauWeeks: number
  }
  financialData: {
    outstandingBalance: number
    paymentIssues: number
    packageCreditsRemaining: number
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "riskAssessment": {
      "riskScore": 72,           // 0-100
      "riskLevel": "high",       // low, medium, high, critical
      "urgency": "immediate",
      "churnProbability": 0.68
    },
    "riskFactors": [
      {
        "factor": "Extended absence",
        "impact": "high",
        "details": "No sessions in 21 days"
      }
    ],
    "retentionStrategies": [
      {
        "action": "Personal outreach",
        "priority": "high",
        "expectedImpact": "Reduce risk by 30%",
        "implementation": "Call within 24 hours"
      }
    ],
    "timeline": "Within 2 weeks"
  }
}
```

**Error Responses:**
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - AI detection failed

---

## Settings

### GET /api/tenant/settings

Get tenant (studio) settings.

**Authentication:** Required

**Success Response (200):**
```json
{
  "tenant": {
    "id": "tenant_id",
    "name": "FitStudio Pro",
    "email": "info@fitstudio.com",
    "phone": "+420123456789",
    "website": "https://fitstudio.com"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Tenant not found
- `500` - Server error

---

### PATCH /api/tenant/settings

Update tenant settings (admin only).

**Authentication:** Required (admin role)

**Request Body:**
```typescript
{
  tenantName?: string
  address?: string
  phone?: string
  ico?: string
  dic?: string
}
```

**Success Response (200):**
```json
{
  "tenant": {
    "id": "tenant_id",
    "name": "Updated Studio Name",
    "phone": "+420987654321"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### PATCH /api/user/profile

Update user profile.

**Authentication:** Required

**Request Body:**
```typescript
{
  name?: string
  email?: string
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "Updated Name",
    "email": "newemail@example.com"
  }
}
```

**Error Responses:**
- `400` - Email already in use
- `401` - Unauthorized
- `500` - Server error

---

## Common Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Cause:** No valid session or session expired

### 403 Forbidden
```json
{
  "error": "Nemáte oprávnění k této operaci"
}
```
**Cause:** Insufficient permissions (e.g., non-admin trying admin action)

### 404 Not Found
```json
{
  "error": "Resource nenalezen"
}
```
**Cause:** Requested resource doesn't exist or doesn't belong to tenant

### 400 Bad Request
```json
{
  "error": "Neplatná data",
  "details": [...]
}
```
**Cause:** Validation error (often includes Zod validation details)

### 500 Internal Server Error
```json
{
  "error": "Interní chyba serveru"
}
```
**Cause:** Unexpected server error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for:
- AI endpoints (expensive operations)
- Authentication endpoints (prevent brute force)
- Webhook endpoints (prevent abuse)

---

## Authentication Flow

1. **Sign Up**
   - POST `/api/auth/signup` with studio details
   - Creates tenant and admin user
   - Sends welcome email

2. **Sign In**
   - Use NextAuth signin page
   - Session stored in cookie
   - Session includes `user.tenantId` for tenant isolation

3. **Password Reset**
   - POST `/api/auth/forgot-password` with email
   - Receive email with reset link
   - POST `/api/auth/reset-password` with token and new password

---

## Webhook Integration

### Stripe Webhooks

Configure webhook endpoint in Stripe dashboard:
```
POST https://yourdomain.com/api/payments/webhook
```

**Required Events:**
- `checkout.session.completed`
- `payment_intent.payment_failed`

**Webhook Secret:** Set `STRIPE_WEBHOOK_SECRET` environment variable

---

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3006"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# OpenAI
OPENAI_API_KEY="sk-..."
```

---

## Data Models

### Client
- Personal info: name, email, phone, avatar, dateOfBirth, gender
- Fitness data: goals, currentWeight, targetWeight, height, bodyFatPercent, fitnessLevel
- Health: injuryHistory, dietaryNotes, medicalNotes
- Membership: creditsRemaining, membershipType, membershipExpiry
- Status: active, inactive, paused

### Session (1-on-1 Training)
- Scheduling: scheduledAt, duration
- Status: scheduled, in_progress, completed, cancelled, no_show
- Workout: workoutPlan, exercisesLogged, muscleGroups
- Metrics: caloriesBurned, heartRateAvg, intensity
- Feedback: clientFeedback, trainerNotes, clientRating
- Payment: price, paid

### Class (Group)
- Basic: name, description, type
- Scheduling: scheduledAt, duration, capacity
- Details: instructor, location, price
- Recurring: isRecurring, recurrence
- Status: scheduled, completed, cancelled

### Package
- Details: name, description, type
- Pricing: price, credits, validityDays
- Features: features[], isActive

### Invoice
- Identity: invoiceNumber (auto-generated)
- Dates: issueDate, dueDate, paidDate
- Amounts: subtotal, tax, total
- Status: draft, sent, paid, overdue, cancelled

---

## Best Practices

### Security
- All mutations require authentication
- Tenant isolation: All queries filter by `session.user.tenantId`
- Input validation using Zod schemas
- Sensitive operations (delete, admin) have additional checks

### Performance
- Use parallel queries with `Promise.all()` where possible
- Pagination on list endpoints
- Selective includes to avoid over-fetching

### Error Handling
- Consistent error response format
- Detailed error logging to console
- User-friendly error messages (in Czech)

---

## Changelog

### Version 1.0 (Current)
- Initial API implementation
- 30 endpoints covering all core features
- AI-powered features (workout, nutrition, progress, churn)
- Stripe payment integration
- Email notifications
- Multi-tenant architecture

---

## Support

For API support or questions, contact the development team.

**Documentation last updated:** 2025-01-26
