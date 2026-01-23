# EventPro - Event Entertainment Vertical

## Product Overview

**Name:** EventPro
**Tagline:** "Event entertainment, simplified"
**Target:** Fire performers, magicians, circus artists, entertainment agencies
**Market Size:** $20B+ event entertainment
**Target Users:** 200k+ entertainment providers

## Branding

- **Primary Color:** Festive Red (#EF4444)
- **Secondary Color:** Gold (#EAB308)
- **Icon:** Sparkle / Star
- **Tone:** Exciting, professional, memorable

## Entity Mapping

| Core Entity | EventPro Name | Description |
|-------------|---------------|-------------|
| Performance | Show | Entertainment performance |
| Game | Activity | Interactive entertainment |
| Service | Extra | Setup, travel, equipment |
| Event | Gig | Calendar booking |

## AI Features

1. **TimelineOptimizer** - Generate event schedules
2. **VendorCoordinator** - Coordinate multiple performers
3. **BudgetAI** - Estimate costs, suggest savings
4. **WeatherWatcher** - Monitor weather, suggest backup plans
5. **GuestExperienceAI** - Recommend activities by audience

## Specific Fields

```prisma
model Show {
  performanceType  String   // fire, magic, circus, stilts
  safetyRequirements Json?
  setupTime        Int?     // minutes
  breakdownTime    Int?
  technicalNeeds   Json?
  insuranceCert    String?
  performerCount   Int?
}
```

## Key Differentiators

- Safety checklist integration
- Weather monitoring
- Multi-performer coordination
- Insurance document management
