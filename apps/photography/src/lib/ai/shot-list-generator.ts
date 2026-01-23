/**
 * ShotListAI - AI-powered shot list generation for photographers
 *
 * Generates comprehensive shot lists based on:
 * - Event type (wedding, portrait, corporate, product)
 * - Venue and location details
 * - Timeline and schedule
 * - Client preferences and must-have shots
 */

import { z } from 'zod'

// Input schema
export const ShotListInputSchema = z.object({
  eventType: z.enum(['wedding', 'engagement', 'portrait', 'family', 'corporate', 'product', 'event', 'newborn', 'maternity', 'other']),

  // Timeline
  startTime: z.string().optional(), // e.g., "14:00"
  endTime: z.string().optional(),
  keyMoments: z.array(z.object({
    time: z.string(),
    event: z.string(),
    location: z.string().optional(),
    priority: z.enum(['must-have', 'nice-to-have', 'optional']).default('must-have'),
  })).optional(),

  // Venue details
  venue: z.object({
    name: z.string().optional(),
    type: z.enum(['indoor', 'outdoor', 'mixed']),
    lightingConditions: z.string().optional(),
    specialFeatures: z.array(z.string()).optional(), // e.g., "staircase", "garden", "chandelier"
  }).optional(),

  // People involved
  subjects: z.array(z.object({
    name: z.string(),
    role: z.string(), // bride, groom, CEO, model, etc.
    specialRequests: z.array(z.string()).optional(),
  })).optional(),

  // For weddings
  weddingDetails: z.object({
    brideGetting ready: z.boolean().optional(),
    groomGettingReady: z.boolean().optional(),
    firstLook: z.boolean().optional(),
    ceremony: z.boolean().optional(),
    reception: z.boolean().optional(),
    speeches: z.boolean().optional(),
    firstDance: z.boolean().optional(),
    cakeCutting: z.boolean().optional(),
    bouquetToss: z.boolean().optional(),
    sendOff: z.boolean().optional(),
  }).optional(),

  // Style preferences
  style: z.object({
    mood: z.enum(['documentary', 'traditional', 'artistic', 'editorial', 'candid', 'mixed']).default('mixed'),
    colorProfile: z.enum(['bright-airy', 'moody-dark', 'film', 'natural', 'vibrant']).optional(),
  }).optional(),

  // Equipment
  equipment: z.array(z.string()).optional(), // Available lenses, lighting, etc.

  // Special requests
  mustHaveShots: z.array(z.string()).optional(),
  avoidShots: z.array(z.string()).optional(),
})

// Output schema
export const ShotListSchema = z.object({
  sections: z.array(z.object({
    name: z.string(),
    timeSlot: z.string().optional(),
    location: z.string().optional(),
    shots: z.array(z.object({
      id: z.string(),
      description: z.string(),
      priority: z.enum(['must-have', 'nice-to-have', 'optional']),
      subjects: z.array(z.string()).optional(),
      technicalNotes: z.string().optional(),
      suggestedSettings: z.object({
        aperture: z.string().optional(),
        lens: z.string().optional(),
        lighting: z.string().optional(),
      }).optional(),
      composition: z.string().optional(),
      timing: z.string().optional(),
    })),
    notes: z.string().optional(),
  })),

  summary: z.object({
    totalShots: z.number(),
    mustHaveCount: z.number(),
    estimatedTime: z.number(), // minutes
    challengesIdentified: z.array(z.string()),
  }),

  equipmentSuggestions: z.array(z.object({
    item: z.string(),
    reason: z.string(),
  })),

  lightingPlan: z.object({
    naturalLight: z.array(z.string()),
    flashRequired: z.array(z.string()),
    goldenHour: z.string().optional(),
  }).optional(),

  backupPlans: z.array(z.object({
    scenario: z.string(),
    solution: z.string(),
  })),
})

export type ShotListInput = z.infer<typeof ShotListInputSchema>
export type ShotList = z.infer<typeof ShotListSchema>

/**
 * Generate AI-powered shot list
 */
export async function generateShotList(
  input: ShotListInput,
  context: { tenantId: string }
): Promise<ShotList> {
  const validatedInput = ShotListInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, returning template shot list')
    return generateTemplateShootList(validatedInput)
  }

  try {
    const { createAIClient } = await import('@vertigo/ai-core')

    const ai = createAIClient({
      apiKey,
      defaultModel: 'gpt-4o',
      cache: { enabled: true, ttlMs: 600000 }, // 10 min cache
      rateLimit: { enabled: true, requestsPerMinute: 30 }
    })

    const response = await ai.chatStructured(
      [{ role: 'user', content: userPrompt }],
      ShotListSchema,
      { tenantId: context.tenantId, vertical: 'photography' },
      { systemPrompt, model: 'gpt-4o', temperature: 0.7 }
    )

    return response.data
  } catch (error) {
    console.error('AI shot list generation failed, falling back to template:', error)
    return generateTemplateShootList(validatedInput)
  }
}

function buildSystemPrompt(): string {
  return `You are an expert wedding and event photographer with 15+ years of experience.
Your specialty is creating comprehensive shot lists that ensure no important moment is missed.

Key principles:
1. PRIORITIZE: Mark shots as must-have, nice-to-have, or optional
2. TIMING: Consider the event timeline and light conditions
3. TECHNICAL: Include camera settings and equipment suggestions
4. COMPOSITION: Describe framing and angles for each shot
5. BACKUP PLANS: Always have alternatives for weather/lighting issues

For WEDDINGS, essential coverage includes:
- Getting ready (details, emotions, helpers)
- First look or pre-ceremony
- Ceremony (processional, vows, rings, kiss, recessional)
- Family formals (prioritize immediate family)
- Couple portraits (variety of locations)
- Reception details (decor, cake, table settings)
- Key moments (first dance, toasts, cake cutting)
- Candid moments throughout

For PORTRAITS:
- Variety of poses and expressions
- Multiple backgrounds/locations
- Detail shots (hands, accessories)
- Movement and action shots

Consider:
- Golden hour timing
- Backup indoor locations for weather
- Group shot efficiency (largest groups first)
- Energy level management (high-energy after low-energy)`
}

function buildUserPrompt(input: ShotListInput): string {
  let prompt = `Create a comprehensive shot list for a ${input.eventType} shoot.

EVENT DETAILS:`

  if (input.startTime && input.endTime) {
    prompt += `\n- Time: ${input.startTime} - ${input.endTime}`
  }

  if (input.venue) {
    prompt += `\n- Venue: ${input.venue.name || 'TBD'} (${input.venue.type})`
    if (input.venue.lightingConditions) {
      prompt += `\n- Lighting: ${input.venue.lightingConditions}`
    }
    if (input.venue.specialFeatures?.length) {
      prompt += `\n- Features: ${input.venue.specialFeatures.join(', ')}`
    }
  }

  if (input.subjects?.length) {
    prompt += `\n\nSUBJECTS:`
    input.subjects.forEach(s => {
      prompt += `\n- ${s.name} (${s.role})`
      if (s.specialRequests?.length) {
        prompt += ` - Special requests: ${s.specialRequests.join(', ')}`
      }
    })
  }

  if (input.weddingDetails) {
    prompt += `\n\nWEDDING COVERAGE:`
    const details = input.weddingDetails
    if (details.brideGettingReady) prompt += '\n- Bride getting ready: Yes'
    if (details.groomGettingReady) prompt += '\n- Groom getting ready: Yes'
    if (details.firstLook) prompt += '\n- First look: Yes'
    if (details.ceremony) prompt += '\n- Ceremony: Yes'
    if (details.reception) prompt += '\n- Reception: Yes'
  }

  if (input.mustHaveShots?.length) {
    prompt += `\n\nMUST-HAVE SHOTS:\n${input.mustHaveShots.map(s => `- ${s}`).join('\n')}`
  }

  if (input.avoidShots?.length) {
    prompt += `\n\nAVOID:\n${input.avoidShots.map(s => `- ${s}`).join('\n')}`
  }

  prompt += `\n\nProvide a detailed shot list organized by section with:
1. Clear shot descriptions
2. Priority levels
3. Technical suggestions
4. Timing notes
5. Backup plans for potential issues`

  return prompt
}

/**
 * Generate template shot list based on event type
 */
function generateTemplateShootList(input: ShotListInput): ShotList {
  if (input.eventType === 'wedding') {
    return generateWeddingShotList(input)
  }

  return generateGenericShotList(input)
}

function generateWeddingShotList(input: ShotListInput): ShotList {
  const sections = []

  // Getting Ready
  if (input.weddingDetails?.brideGettingReady) {
    sections.push({
      name: 'Bride Getting Ready',
      timeSlot: input.startTime || 'TBD',
      shots: [
        {
          id: 'bgr-1',
          description: 'Dress hanging shot with natural light',
          priority: 'must-have' as const,
          technicalNotes: 'Use window light, shallow depth of field',
          suggestedSettings: { aperture: 'f/2.8', lens: '35mm or 50mm' },
        },
        {
          id: 'bgr-2',
          description: 'Bride putting on earrings/jewelry - detail',
          priority: 'must-have' as const,
          composition: 'Close-up, soft focus background',
        },
        {
          id: 'bgr-3',
          description: 'Mom helping with dress/veil',
          priority: 'must-have' as const,
          technicalNotes: 'Capture emotion and connection',
        },
        {
          id: 'bgr-4',
          description: 'Bridesmaids reaction to bride',
          priority: 'nice-to-have' as const,
          composition: 'Wide shot capturing multiple reactions',
        },
        {
          id: 'bgr-5',
          description: 'Shoe detail shot',
          priority: 'nice-to-have' as const,
          suggestedSettings: { aperture: 'f/2.8', lens: '85mm or macro' },
        },
      ],
      notes: 'Allow 45-60 minutes for this section',
    })
  }

  // Ceremony
  if (input.weddingDetails?.ceremony) {
    sections.push({
      name: 'Ceremony',
      shots: [
        {
          id: 'cer-1',
          description: 'Venue wide shot before guests arrive',
          priority: 'must-have' as const,
          timing: '15 minutes before ceremony',
        },
        {
          id: 'cer-2',
          description: 'Groom watching bride walk down aisle',
          priority: 'must-have' as const,
          technicalNotes: 'Position for groom reaction, not bride back',
          composition: 'Tight on groom face, bride soft in background',
        },
        {
          id: 'cer-3',
          description: 'Exchange of vows',
          priority: 'must-have' as const,
          subjects: ['Bride', 'Groom'],
        },
        {
          id: 'cer-4',
          description: 'Ring exchange close-up',
          priority: 'must-have' as const,
          suggestedSettings: { lens: '70-200mm from distance' },
        },
        {
          id: 'cer-5',
          description: 'First kiss',
          priority: 'must-have' as const,
          technicalNotes: 'High shutter speed, continuous shooting',
        },
        {
          id: 'cer-6',
          description: 'Recessional - couple walking back',
          priority: 'must-have' as const,
          composition: 'Wide shot with guests celebrating',
        },
      ],
      notes: 'Position second shooter for alternate angles',
    })
  }

  // Portraits
  sections.push({
    name: 'Couple Portraits',
    timeSlot: 'After ceremony, 30-45 min',
    shots: [
      {
        id: 'por-1',
        description: 'Classic posed shot - full length',
        priority: 'must-have' as const,
        composition: 'Formal pose, clean background',
      },
      {
        id: 'por-2',
        description: 'Romantic walking shot',
        priority: 'must-have' as const,
        technicalNotes: 'Have them walk slowly, look at each other',
      },
      {
        id: 'por-3',
        description: 'Forehead touch intimate moment',
        priority: 'must-have' as const,
        composition: 'Close-up, soft lighting',
      },
      {
        id: 'por-4',
        description: 'Creative shot using venue feature',
        priority: 'nice-to-have' as const,
        subjects: ['Bride', 'Groom'],
      },
      {
        id: 'por-5',
        description: 'Golden hour silhouette (if timing allows)',
        priority: 'optional' as const,
        timing: 'During golden hour',
      },
    ],
    notes: 'Scout locations during venue walkthrough',
  })

  // Family formals
  sections.push({
    name: 'Family Formals',
    timeSlot: 'Immediately after ceremony, 20-30 min max',
    shots: [
      {
        id: 'fam-1',
        description: 'Couple with both sets of parents',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-2',
        description: 'Couple with bride parents',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-3',
        description: 'Couple with groom parents',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-4',
        description: 'Couple with grandparents',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-5',
        description: 'Bridal party - bridesmaids',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-6',
        description: 'Bridal party - groomsmen',
        priority: 'must-have' as const,
      },
      {
        id: 'fam-7',
        description: 'Full bridal party',
        priority: 'must-have' as const,
      },
    ],
    notes: 'Have list printed, work from largest to smallest groups',
  })

  // Reception
  if (input.weddingDetails?.reception) {
    sections.push({
      name: 'Reception',
      shots: [
        {
          id: 'rec-1',
          description: 'Room setup - wide shot before guests',
          priority: 'must-have' as const,
        },
        {
          id: 'rec-2',
          description: 'Table settings detail',
          priority: 'nice-to-have' as const,
        },
        {
          id: 'rec-3',
          description: 'Cake detail',
          priority: 'must-have' as const,
        },
        {
          id: 'rec-4',
          description: 'First dance',
          priority: 'must-have' as const,
          technicalNotes: 'Mix of wide and tight shots',
        },
        {
          id: 'rec-5',
          description: 'Parent dances',
          priority: 'must-have' as const,
        },
        {
          id: 'rec-6',
          description: 'Toasts/speeches',
          priority: 'must-have' as const,
          technicalNotes: 'Capture both speaker and couple reaction',
        },
        {
          id: 'rec-7',
          description: 'Cake cutting',
          priority: 'must-have' as const,
        },
        {
          id: 'rec-8',
          description: 'Dance floor action',
          priority: 'nice-to-have' as const,
        },
      ],
      notes: 'Coordinate timing with DJ/coordinator',
    })
  }

  const allShots = sections.flatMap(s => s.shots)

  return {
    sections,
    summary: {
      totalShots: allShots.length,
      mustHaveCount: allShots.filter(s => s.priority === 'must-have').length,
      estimatedTime: 480, // 8 hours typical wedding
      challengesIdentified: [
        'Coordinate with vendors for timing',
        'Have backup locations for portraits',
        'Watch for harsh midday light during formals',
      ],
    },
    equipmentSuggestions: [
      { item: '24-70mm f/2.8', reason: 'Versatile for ceremonies and formals' },
      { item: '70-200mm f/2.8', reason: 'Ceremony shots from distance' },
      { item: '35mm f/1.4', reason: 'Low light reception, storytelling' },
      { item: '85mm f/1.4', reason: 'Portraits with beautiful bokeh' },
      { item: 'Flash with diffuser', reason: 'Reception dancing' },
    ],
    lightingPlan: {
      naturalLight: ['Getting ready', 'Ceremony', 'Portraits'],
      flashRequired: ['Reception dancing', 'Evening portraits'],
      goldenHour: 'Check sunset time for couple portraits',
    },
    backupPlans: [
      {
        scenario: 'Rain during outdoor ceremony',
        solution: 'Confirm indoor backup location, bring umbrella for creative shots',
      },
      {
        scenario: 'Harsh midday sun for formals',
        solution: 'Use venue overhang or trees for open shade',
      },
      {
        scenario: 'Timeline running behind',
        solution: 'Prioritize must-have shots, skip nice-to-have if needed',
      },
    ],
  }
}

function generateGenericShotList(input: ShotListInput): ShotList {
  return {
    sections: [
      {
        name: 'Opening Shots',
        shots: [
          {
            id: 'gen-1',
            description: 'Wide establishing shot',
            priority: 'must-have',
          },
          {
            id: 'gen-2',
            description: 'Subject portrait - standard pose',
            priority: 'must-have',
          },
          {
            id: 'gen-3',
            description: 'Subject portrait - candid/natural',
            priority: 'must-have',
          },
        ],
      },
    ],
    summary: {
      totalShots: 3,
      mustHaveCount: 3,
      estimatedTime: 60,
      challengesIdentified: ['Consider lighting conditions'],
    },
    equipmentSuggestions: [
      { item: 'Standard zoom', reason: 'Versatility' },
    ],
    backupPlans: [
      {
        scenario: 'Poor lighting',
        solution: 'Use flash or find better natural light',
      },
    ],
  }
}
