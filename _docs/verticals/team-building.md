# TeamForge - Team Building Vertical

## Product Overview

**Name:** TeamForge
**Tagline:** "Build stronger teams with AI"
**Target:** Corporate team building companies
**Market Size:** $4B+ team building market
**Target Users:** 30k+ team building providers

## Branding

- **Primary Color:** Corporate Blue (#2563EB)
- **Secondary Color:** Trust Green (#059669)
- **Icon:** Connected people / Handshake
- **Tone:** Professional, results-oriented, collaborative

## Entity Mapping

| Core Entity | TeamForge Name | Description |
|-------------|----------------|-------------|
| Performance | Program | Complete team building program |
| Game | Activity | Individual activity/game |
| Service | Extra | Facilitation, catering coord |
| Event | Session | Scheduled team building |

## AI Features

1. **TeamDynamicsAI** - Analyze team size/composition, suggest activities
2. **ObjectiveMatcher** - Match goals to activities ("improve communication")
3. **DifficultyCalibrator** - Adjust activity difficulty to group
4. **DebriefGenerator** - Create post-event reports for HR

## Specific Fields

```prisma
model Program {
  teamSize        Int?
  objectives      String[]  // communication, trust, leadership
  industryType    String?   // tech, finance, healthcare
  physicalLevel   String?   // low, medium, high
  indoorOutdoor   String?
  duration        Int?      // hours
  includesCatering Boolean  @default(false)
  debriefIncluded Boolean   @default(true)
}

model Activity {
  minParticipants Int?
  maxParticipants Int?
  physicalDemand  String?
  learningOutcomes String[]
  materialsNeeded String[]
  facilitatorGuide Json?
}
```

## Key Differentiators

- HR-ready reporting
- Objective-based activity matching
- Corporate invoicing integration
- Post-event analytics
