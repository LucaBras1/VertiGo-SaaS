# PartyPal - Kids Entertainment Vertical

## Product Overview

**Name:** PartyPal
**Tagline:** "Magical moments, zero stress"
**Target:** Kids party entertainers, animators
**Market Size:** $5B+ kids entertainment
**Target Users:** 50k+ kids entertainers

## Branding

- **Primary Color:** Fun Pink (#EC4899)
- **Secondary Color:** Playful Yellow (#FACC15)
- **Icon:** Balloon / Party hat
- **Tone:** Fun, magical, family-friendly

## Entity Mapping

| Core Entity | PartyPal Name | Description |
|-------------|---------------|-------------|
| Performance | Package | Birthday party package |
| Game | Activity | Game, animation, show |
| Service | Extra | Costumes, decorations, cake |
| Event | Party | Scheduled party |

## AI Features

1. **AgeOptimizer** - Adapt program to age group (3-5, 6-9, 10-12)
2. **SafetyChecker** - Check activities for safety, allergies
3. **ThemeSuggester** - Suggest themes based on child's interests
4. **ParentCommunicationAI** - Generate parent updates
5. **PhotoMomentPredictor** - Suggest best times to capture photos

## Specific Fields

```prisma
model Package {
  ageGroupMin     Int?
  ageGroupMax     Int?
  maxChildren     Int?
  themeName       String?   // Frozen, Superhero, Princess
  includesCharacter Boolean @default(false)
  characterName   String?
  duration        Int?      // minutes
  includesCake    Boolean   @default(false)
  includesGoodybags Boolean @default(false)
}

model Activity {
  ageAppropriate  String[]  // 3-5, 6-9, etc.
  safetyNotes     String?
  allergensInvolved String[]
  indoorOutdoor   String?
  energyLevel     String?   // calm, moderate, high
  materials       String[]
}

model Party {
  childName       String?
  childAge        Int?
  childInterests  String[]
  allergies       String[]
  parentPhone     String?
  guestCount      Int?
  venue           String?
  specialRequests String?
}
```

## Key Differentiators

- Age-appropriate activity filtering
- Allergy/safety management
- Theme-based package builder
- Parent communication tools
- Photo moment suggestions

## Safety Features

- Allergy checklist per activity
- Age verification for activities
- Emergency contact management
- Insurance documentation
- Background check tracking

## Success Metrics

- Parent satisfaction >4.8/5
- Rebooking rate >30%
- Safety incident rate 0%
- On-time arrival >95%
- Photo delivery <24h
