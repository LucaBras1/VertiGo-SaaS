# ShootFlow AI Modules - Usage Examples

This document provides practical examples of how to use each AI module in ShootFlow.

---

## 1. ShotListAI - Shot List Generation

### Basic Wedding Shot List

```typescript
import { generateShotList } from '@/lib/ai/shot-list-generator'

const result = await generateShotList({
  eventType: 'wedding',
  startTime: '14:00',
  endTime: '23:00',

  weddingDetails: {
    brideGettingReady: true,
    groomGettingReady: true,
    ceremony: true,
    reception: true,
    firstDance: true,
    cakeCutting: true,
  },

  venue: {
    type: 'mixed',
    name: 'Garden Estate',
    lightingConditions: 'Natural light ceremony, dim reception',
    specialFeatures: ['Garden', 'Grand staircase', 'Fountain'],
  },

  mustHaveShots: [
    'Ring detail shot',
    'Grandparents with couple',
    'Sunset portraits',
  ],
}, { tenantId: 'user-123' })

// Result includes:
// - sections: Array of shot categories
// - summary: Total shots, must-haves, estimated time
// - equipmentSuggestions: Recommended lenses and gear
// - lightingPlan: Natural vs flash requirements
// - backupPlans: Weather contingencies
```

### Portrait Session Shot List

```typescript
const result = await generateShotList({
  eventType: 'portrait',
  startTime: '10:00',
  endTime: '11:30',

  venue: {
    type: 'outdoor',
    specialFeatures: ['Urban brick wall', 'Park with trees'],
  },

  subjects: [
    {
      name: 'Sarah',
      role: 'model',
      specialRequests: ['No close-up face shots', 'Full-body preferred'],
    },
  ],

  style: {
    mood: 'editorial',
    colorProfile: 'moody-dark',
  },
}, { tenantId: 'user-123' })
```

### API Usage

```bash
curl -X POST http://localhost:3003/api/ai/shot-list/generate \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "wedding",
    "weddingDetails": {
      "ceremony": true,
      "reception": true
    },
    "mustHaveShots": ["First kiss", "Family group photo"]
  }'
```

---

## 2. GalleryCuratorAI - Photo Curation

### Curate Wedding Gallery

```typescript
import { createGalleryCuratorAI } from '@/lib/ai/gallery-curator'

const curator = createGalleryCuratorAI()

const result = await curator.curate({
  images: [
    {
      id: 'img-1',
      url: 'https://storage.com/wedding/ceremony-001.jpg',
      filename: 'ceremony-001.jpg',
      metadata: {
        timestamp: '2024-06-15T15:30:00Z',
        camera: 'Canon R5',
        lens: '70-200mm f/2.8',
        aperture: 'f/2.8',
        shutterSpeed: '1/500',
        iso: 400,
      },
    },
    // ... more images
  ],

  eventType: 'wedding',

  preferences: {
    selectionPercentage: 20, // Select top 20%
    prioritizeEmotions: true,
    includeVariety: true,
  },

  categories: [
    'Getting Ready',
    'Ceremony',
    'Portraits',
    'Reception',
    'Details',
  ],
}, { tenantId: 'user-123' })

// Result includes:
// - selected: Photos with quality scores and reasoning
// - rejected: Photos with rejection reasons
// - categoryBreakdown: Distribution by category
// - summary: Overall quality and coverage analysis
```

### Quick Curation for Preview

```typescript
import { quickCurate } from '@/lib/ai/gallery-curator'

const imageUrls = [
  'https://storage.com/photo1.jpg',
  'https://storage.com/photo2.jpg',
  // ... 500 photos
]

const selectedUrls = await quickCurate(imageUrls, 50) // Select top 50
```

### API Usage

```bash
curl -X POST http://localhost:3003/api/ai/gallery/curate \
  -H "Content-Type: application/json" \
  -d '{
    "images": [
      {
        "id": "1",
        "url": "https://example.com/photo1.jpg",
        "filename": "ceremony-01.jpg"
      }
    ],
    "eventType": "wedding",
    "preferences": {
      "selectionPercentage": 25,
      "prioritizeEmotions": true
    }
  }'
```

---

## 3. StyleMatcherAI - Style Analysis

### Analyze Portfolio Style

```typescript
import { createStyleMatcherAI } from '@/lib/ai/style-matcher'

const matcher = createStyleMatcherAI()

const result = await matcher.analyzeStyle({
  portfolioImages: [
    {
      url: 'https://portfolio.com/wedding1.jpg',
      title: 'Golden Hour Wedding',
      eventType: 'wedding',
    },
    {
      url: 'https://portfolio.com/portrait1.jpg',
      title: 'Natural Light Portrait',
      eventType: 'portrait',
    },
    // ... at least 5 images required
  ],

  photographerBio: 'I love capturing authentic moments in natural light',
  targetMarket: ['wedding', 'portrait', 'family'],
}, { tenantId: 'user-123' })

// Result includes:
// - styleProfile: Detailed style description
// - keywords: SEO keywords for marketing
// - idealClients: Types of clients who match your style
// - marketingCopy: Ready-to-use bio and tagline
```

### Extract Quick Style Keywords

```typescript
import { extractStyleKeywords } from '@/lib/ai/style-matcher'

const keywords = await extractStyleKeywords([
  'https://portfolio.com/img1.jpg',
  'https://portfolio.com/img2.jpg',
])

// Returns: ['natural light', 'bright and airy', 'documentary', ...]
```

### API Usage

```bash
curl -X POST http://localhost:3003/api/ai/style/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioImages": [
      {"url": "https://example.com/portfolio1.jpg"},
      {"url": "https://example.com/portfolio2.jpg"},
      {"url": "https://example.com/portfolio3.jpg"},
      {"url": "https://example.com/portfolio4.jpg"},
      {"url": "https://example.com/portfolio5.jpg"}
    ],
    "photographerBio": "I capture timeless moments"
  }'
```

---

## 4. EditTimePredictorAI - Editing Time Estimation

### Estimate Wedding Edit Time

```typescript
import { createEditTimePredictorAI } from '@/lib/ai/edit-time-predictor'

const predictor = createEditTimePredictorAI()

const result = await predictor.estimateEditingTime({
  shotCount: 500,
  eventType: 'wedding',
  editingComplexity: 'standard',

  workflow: {
    cullingDone: false,
    includeRetouching: true,
    includeAlbumDesign: true,
  },

  photographerSpeed: 'average',
}, { tenantId: 'user-123' })

// Result includes:
// - estimatedHours: Total time needed
// - breakdown: Time per workflow stage
// - deliveryDate: Suggested delivery date
// - industryBenchmark: Comparison to industry average
// - tips: Efficiency recommendations
```

### Quick Estimate

```typescript
import { quickEstimate } from '@/lib/ai/edit-time-predictor'

const hours = quickEstimate(300, 'portrait')
// Returns: Estimated hours for 300 portrait photos
```

### Corporate Shoot with Rush Delivery

```typescript
const result = await predictor.estimateEditingTime({
  shotCount: 150,
  eventType: 'corporate',
  editingComplexity: 'basic',

  workflow: {
    cullingDone: true, // Already selected best shots
    colorCorrectionOnly: true, // Quick turnaround
    includeRetouching: false,
  },

  photographerSpeed: 'fast',
}, { tenantId: 'user-123' })

console.log(`Estimated: ${result.estimatedHours} hours`)
console.log(`Delivery: ${result.deliveryDate.suggestedDate}`)
console.log(`Rush available: ${result.deliveryDate.rushAvailable}`)
```

### API Usage

```bash
curl -X POST http://localhost:3003/api/ai/edit-time/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "shotCount": 500,
    "eventType": "wedding",
    "editingComplexity": "standard",
    "workflow": {
      "cullingDone": false,
      "includeRetouching": true
    },
    "photographerSpeed": "average"
  }'
```

---

## Integration Examples

### Full Workflow: New Wedding Booking

```typescript
// 1. Create Package
const package = await createPackage({
  title: 'Sarah & John Wedding',
  eventType: 'wedding',
  eventDate: new Date('2024-08-15'),
  shotCount: 500,
})

// 2. Generate Shot List
const shotList = await generateShotList({
  eventType: 'wedding',
  weddingDetails: {
    ceremony: true,
    reception: true,
  },
}, { tenantId: 'user-123' })

// 3. Estimate Editing Time
const estimate = await predictor.estimateEditingTime({
  shotCount: 500,
  eventType: 'wedding',
  editingComplexity: 'standard',
}, { tenantId: 'user-123' })

// Update package with estimates
await updatePackage(package.id, {
  deliveryDays: estimate.deliveryDate.turnaroundDays,
  editingHours: estimate.estimatedHours,
})
```

### Post-Shoot Workflow

```typescript
// 1. Upload photos to gallery
const gallery = await createGallery({
  shootId: 'shoot-123',
  name: 'Sarah & John Wedding - Full Gallery',
})

await uploadPhotos(gallery.id, photoFiles)

// 2. AI Curation
const curator = createGalleryCuratorAI()
const curation = await curator.curate({
  images: galleryPhotos,
  eventType: 'wedding',
  preferences: {
    selectionPercentage: 20,
  },
}, { tenantId: 'user-123' })

// 3. Apply AI selections
await updateGallery(gallery.id, {
  aiCurated: true,
  curationData: curation.summary,
})

for (const photo of curation.selected) {
  await updatePhoto(photo.imageId, {
    selected: true,
    qualityScore: photo.score,
    category: photo.category,
    isHighlight: photo.isHighlight,
  })
}

// 4. Client delivery
await sendGalleryLink(client.email, gallery.publicUrl)
```

---

## React Component Integration

### Shot List Generator Component

```tsx
'use client'

import { useState } from 'react'
import { generateShotList, type ShotListInput } from '@/lib/ai/shot-list-generator'

export function ShotListGenerator() {
  const [loading, setLoading] = useState(false)
  const [shotList, setShotList] = useState(null)

  async function handleGenerate(input: ShotListInput) {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/shot-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const result = await response.json()
      setShotList(result.data)
    } catch (error) {
      console.error('Failed to generate shot list:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Form UI */}
      {loading && <p>Generating shot list...</p>}
      {shotList && <ShotListDisplay shotList={shotList} />}
    </div>
  )
}
```

### Gallery Curation Button

```tsx
'use client'

export function CurateGalleryButton({ galleryId }: { galleryId: string }) {
  const [curating, setCurating] = useState(false)

  async function handleCurate() {
    setCurating(true)
    try {
      const photos = await fetchGalleryPhotos(galleryId)

      const response = await fetch('/api/ai/gallery/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: photos.map(p => ({
            id: p.id,
            url: p.url,
            filename: p.filename,
          })),
          eventType: 'wedding',
        }),
      })

      const result = await response.json()

      // Apply curation results
      await updateGalleryWithCuration(galleryId, result.data)

      // Refresh gallery
      window.location.reload()
    } finally {
      setCurating(false)
    }
  }

  return (
    <button
      onClick={handleCurate}
      disabled={curating}
      className="px-4 py-2 bg-amber-500 text-white rounded"
    >
      {curating ? 'Curating...' : 'AI Curation'}
    </button>
  )
}
```

---

## Error Handling

### Handle API Errors

```typescript
try {
  const result = await generateShotList(input, { tenantId })
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error
    console.error('Invalid input:', error.errors)
  } else if (error.message.includes('API key')) {
    // OpenAI API error
    console.error('AI service unavailable')
  } else {
    // Generic error
    console.error('Failed to generate shot list:', error)
  }
}
```

### Client-side Error Handling

```tsx
const [error, setError] = useState<string | null>(null)

async function handleSubmit() {
  setError(null)
  try {
    const response = await fetch('/api/ai/shot-list/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const error = await response.json()
      setError(error.error || 'Something went wrong')
      return
    }

    const result = await response.json()
    // Handle success
  } catch (error) {
    setError('Network error. Please try again.')
  }
}
```

---

## Testing

### Unit Test Example

```typescript
import { generateShotList } from '@/lib/ai/shot-list-generator'

describe('ShotListAI', () => {
  it('generates wedding shot list', async () => {
    const result = await generateShotList({
      eventType: 'wedding',
      weddingDetails: { ceremony: true },
    }, { tenantId: 'test' })

    expect(result.sections.length).toBeGreaterThan(0)
    expect(result.summary.totalShots).toBeGreaterThan(0)
    expect(result.summary.mustHaveCount).toBeGreaterThan(0)
  })
})
```

---

## Performance Tips

1. **Batch AI Requests:** Process multiple images together for curation
2. **Cache Results:** Store shot list templates for reuse
3. **Async Processing:** Use background jobs for large galleries
4. **Pagination:** Load photos in chunks for UI
5. **Debounce:** Delay AI requests on form input

---

## Next Steps

- Integrate real OpenAI API for production
- Add user-specific learning (save editing speeds)
- Create shot list templates library
- Build gallery curation UI
- Add export to PDF functionality
