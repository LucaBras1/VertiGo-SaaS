/**
 * TechRiderAI - AI-powered technical rider generation
 *
 * Generates comprehensive technical riders for performances:
 * - Stage requirements
 * - Sound and lighting needs
 * - Backline and equipment
 * - Dressing room requirements
 * - Safety considerations
 */

import { z } from 'zod'

// Input schema
export const TechRiderInputSchema = z.object({
  production: z.object({
    name: z.string(),
    type: z.enum(['theater', 'dance', 'circus', 'music', 'comedy', 'variety', 'kids', 'other']),
    duration: z.number(), // minutes
    intermission: z.boolean().default(false),
    intermissionLength: z.number().optional(), // minutes
  }),

  cast: z.object({
    performerCount: z.number(),
    crewCount: z.number().optional(),
    roles: z.array(z.object({
      name: z.string(),
      requirements: z.array(z.string()).optional(),
    })).optional(),
  }),

  stage: z.object({
    minWidth: z.number(), // meters
    minDepth: z.number(),
    minHeight: z.number().optional(),
    surface: z.enum(['wood', 'concrete', 'marley', 'any']).optional(),
    specialRequirements: z.array(z.string()).optional(),
  }),

  technical: z.object({
    sound: z.object({
      microphoneCount: z.number().optional(),
      monitorsNeeded: z.number().optional(),
      playbackRequired: z.boolean().optional(),
      soundboardRequired: z.boolean().optional(),
    }).optional(),
    lighting: z.object({
      followSpotNeeded: z.boolean().optional(),
      specialEffects: z.array(z.string()).optional(),
      dmxChannels: z.number().optional(),
    }).optional(),
    rigging: z.object({
      flySystemRequired: z.boolean().optional(),
      rigPoints: z.number().optional(),
      weightCapacity: z.number().optional(), // kg
    }).optional(),
    backline: z.array(z.string()).optional(),
  }).optional(),

  setDesign: z.object({
    pieces: z.array(z.object({
      name: z.string(),
      dimensions: z.string().optional(),
      weight: z.number().optional(),
    })).optional(),
    quickChanges: z.boolean().optional(),
    flyingElements: z.boolean().optional(),
  }).optional(),

  venue: z.object({
    dressing rooms: z.number().optional(),
    loadInAccess: z.string().optional(),
    powerAvailable: z.string().optional(),
  }).optional(),
})

// Output schema
export const TechRiderSchema = z.object({
  header: z.object({
    productionName: z.string(),
    productionType: z.string(),
    version: z.string(),
    lastUpdated: z.string(),
    contactInfo: z.string().optional(),
  }),

  stageRequirements: z.object({
    minimumDimensions: z.object({
      width: z.number(),
      depth: z.number(),
      height: z.number().optional(),
    }),
    surface: z.string(),
    masking: z.string().optional(),
    specialNotes: z.array(z.string()),
  }),

  soundRequirements: z.object({
    fohSystem: z.string(),
    monitors: z.object({
      count: z.number(),
      type: z.string(),
    }),
    microphones: z.array(z.object({
      type: z.string(),
      quantity: z.number(),
      usage: z.string(),
    })),
    playback: z.object({
      required: z.boolean(),
      format: z.string().optional(),
      cueCount: z.number().optional(),
    }),
    specialNotes: z.array(z.string()),
  }),

  lightingRequirements: z.object({
    minimumRig: z.string(),
    followSpot: z.object({
      required: z.boolean(),
      count: z.number().optional(),
      operator: z.boolean().optional(),
    }),
    specialEffects: z.array(z.object({
      effect: z.string(),
      quantity: z.number().optional(),
      notes: z.string().optional(),
    })),
    colorRequirements: z.array(z.string()).optional(),
    specialNotes: z.array(z.string()),
  }),

  riggingRequirements: z.object({
    pointsNeeded: z.number(),
    totalWeight: z.number(),
    locations: z.array(z.object({
      position: z.string(),
      weight: z.number(),
      purpose: z.string(),
    })),
    certificationRequired: z.boolean(),
  }).optional(),

  backline: z.array(z.object({
    item: z.string(),
    quantity: z.number(),
    specifications: z.string().optional(),
    providedBy: z.enum(['venue', 'company', 'rental']),
  })),

  dressingRooms: z.object({
    required: z.number(),
    specifications: z.array(z.string()),
    quickChangeAreas: z.number().optional(),
  }),

  loadIn: z.object({
    minimumTime: z.number(), // hours
    accessRequirements: z.array(z.string()),
    equipmentList: z.array(z.string()),
  }),

  schedule: z.object({
    loadIn: z.string(),
    soundcheck: z.string(),
    techRehearsal: z.string().optional(),
    showCall: z.string(),
    showStart: z.string(),
    loadOut: z.string(),
  }),

  safety: z.object({
    requirements: z.array(z.string()),
    specialEffectsProtocols: z.array(z.string()).optional(),
    emergencyProcedures: z.array(z.string()),
  }),

  hospitality: z.object({
    meals: z.string(),
    drinks: z.array(z.string()),
    parking: z.string(),
    accommodation: z.string().optional(),
  }),
})

export type TechRiderInput = z.infer<typeof TechRiderInputSchema>
export type TechRider = z.infer<typeof TechRiderSchema>

/**
 * Generate comprehensive tech rider
 */
export async function generateTechRider(
  input: TechRiderInput,
  context: { tenantId: string }
): Promise<TechRider> {
  const validatedInput = TechRiderInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // TODO: Integrate with @vertigo/ai-core
  // const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  // const response = await ai.chatStructured(...)

  // Generate tech rider
  return buildTechRider(validatedInput)
}

function buildSystemPrompt(): string {
  return `You are an expert technical director and stage manager with extensive touring experience.
Your specialty is creating comprehensive, clear technical riders that ensure smooth load-ins and performances.

KEY PRINCIPLES:

1. CLARITY: Be specific and unambiguous
   - Exact quantities and specifications
   - Clear diagrams and measurements
   - No assumptions about venue capabilities

2. SAFETY: Prioritize safety requirements
   - Rigging certifications
   - Fire safety for special effects
   - Emergency procedures

3. PROFESSIONALISM: Standard industry format
   - Organized sections
   - Version control
   - Contact information

4. FLEXIBILITY: Include alternatives
   - Minimum vs ideal specifications
   - Substitution options
   - Adaptation notes for different venues`
}

function buildUserPrompt(input: TechRiderInput): string {
  return `Generate a tech rider for: ${input.production.name}

PRODUCTION:
- Type: ${input.production.type}
- Duration: ${input.production.duration} minutes
- Intermission: ${input.production.intermission ? `Yes (${input.production.intermissionLength || 15} min)` : 'No'}

CAST & CREW:
- Performers: ${input.cast.performerCount}
- Crew: ${input.cast.crewCount || 'TBD'}

STAGE:
- Minimum: ${input.stage.minWidth}m x ${input.stage.minDepth}m
${input.stage.minHeight ? `- Height: ${input.stage.minHeight}m minimum` : ''}
${input.stage.surface ? `- Surface: ${input.stage.surface}` : ''}

Generate a complete tech rider including all sections.`
}

/**
 * Build tech rider from input
 */
function buildTechRider(input: TechRiderInput): TechRider {
  const { production, cast, stage, technical, venue } = input

  // Calculate sound needs based on cast size
  const micCount = technical?.sound?.microphoneCount || Math.ceil(cast.performerCount / 2)
  const monitorCount = technical?.sound?.monitorsNeeded || Math.min(cast.performerCount, 6)

  // Calculate lighting based on production type
  const needsFollowSpot = ['theater', 'dance', 'circus'].includes(production.type)

  // Calculate rigging if needed
  const hasRigging = technical?.rigging?.flySystemRequired || input.setDesign?.flyingElements

  return {
    header: {
      productionName: production.name,
      productionType: production.type.charAt(0).toUpperCase() + production.type.slice(1),
      version: '1.0',
      lastUpdated: new Date().toISOString().split('T')[0],
    },

    stageRequirements: {
      minimumDimensions: {
        width: stage.minWidth,
        depth: stage.minDepth,
        height: stage.minHeight,
      },
      surface: stage.surface || 'Sprung wood floor preferred, marley acceptable',
      masking: 'Black legs and borders, full blackout capability',
      specialNotes: [
        'Clear wing space both sides minimum 2m',
        stage.specialRequirements?.join(', ') || 'Standard theater configuration',
        production.type === 'dance' ? 'Dance floor must be clean and splinter-free' : '',
        production.type === 'circus' ? 'Floor must support rigging anchor points' : '',
      ].filter(Boolean),
    },

    soundRequirements: {
      fohSystem: 'Full-range PA system appropriate for venue size',
      monitors: {
        count: monitorCount,
        type: 'Wedge monitors or IEM system',
      },
      microphones: [
        {
          type: 'Wireless handheld',
          quantity: Math.min(micCount, 4),
          usage: 'Principal performers',
        },
        {
          type: 'Wireless lavalier',
          quantity: Math.max(0, micCount - 4),
          usage: 'Additional cast members',
        },
        {
          type: 'Area microphones',
          quantity: 2,
          usage: 'Ambient pickup',
        },
      ],
      playback: {
        required: technical?.sound?.playbackRequired ?? true,
        format: 'QLab or similar cue-based system',
        cueCount: Math.ceil(production.duration / 5), // Estimate 1 cue per 5 min
      },
      specialNotes: [
        'Sound operator required for all performances',
        'Headset communication system for SM and crew',
        production.type === 'music' ? 'High-quality monitoring essential' : '',
      ].filter(Boolean),
    },

    lightingRequirements: {
      minimumRig: `Minimum 24 conventionals, 12 moving fixtures recommended for ${production.type}`,
      followSpot: {
        required: needsFollowSpot,
        count: needsFollowSpot ? 1 : 0,
        operator: needsFollowSpot,
      },
      specialEffects: technical?.lighting?.specialEffects?.map(e => ({
        effect: e,
        notes: 'Must be operated by qualified technician',
      })) || [],
      colorRequirements: ['R60 (No Color Blue)', 'L201 (Full CT Blue)', 'R26 (Light Red)', 'Open White'],
      specialNotes: [
        'Lighting plot will be provided 2 weeks before load-in',
        'Focus call required day of performance',
        production.type === 'dance' ? 'Side lighting essential for dance' : '',
      ].filter(Boolean),
    },

    ...(hasRigging ? {
      riggingRequirements: {
        pointsNeeded: technical?.rigging?.rigPoints || 4,
        totalWeight: technical?.rigging?.weightCapacity || 500,
        locations: [
          {
            position: 'Center stage',
            weight: 200,
            purpose: 'Primary aerial point',
          },
          {
            position: 'Upstage left/right',
            weight: 150,
            purpose: 'Set pieces / scenic elements',
          },
        ],
        certificationRequired: true,
      },
    } : {}),

    backline: technical?.backline?.map(item => ({
      item,
      quantity: 1,
      providedBy: 'venue' as const,
    })) || [
      {
        item: 'Piano/keyboard',
        quantity: 1,
        specifications: '88-key weighted',
        providedBy: 'venue' as const,
      },
    ],

    dressingRooms: {
      required: venue?.dressingRooms || Math.ceil(cast.performerCount / 4),
      specifications: [
        'Lighted mirrors',
        'Clothing racks',
        'Private bathroom access',
        'Temperature controlled',
      ],
      quickChangeAreas: input.setDesign?.quickChanges ? 2 : 0,
    },

    loadIn: {
      minimumTime: production.type === 'circus' ? 8 : production.type === 'theater' ? 6 : 4,
      accessRequirements: [
        venue?.loadInAccess || 'Loading dock access for truck',
        'Clear path to stage minimum 2.5m wide',
        'Elevator access if stage not ground level',
      ],
      equipmentList: [
        'Flight cases and set pieces',
        'Costume wardrobe cases',
        'Props and hand props',
        'Technical equipment cases',
      ],
    },

    schedule: {
      loadIn: '08:00',
      soundcheck: '14:00',
      techRehearsal: production.intermission ? '15:00' : undefined,
      showCall: formatShowCall(production.duration),
      showStart: '19:30',
      loadOut: 'Immediately following performance',
    },

    safety: {
      requirements: [
        'Fire extinguisher accessible from stage',
        'First aid kit on site',
        'Emergency exits clearly marked and accessible',
        hasRigging ? 'Rigging certification must be provided' : '',
      ].filter(Boolean),
      emergencyProcedures: [
        'Company stage manager has authority to stop show',
        'Evacuation plan to be reviewed at load-in',
        'Emergency contact numbers posted backstage',
      ],
    },

    hospitality: {
      meals: `Hot meal for ${cast.performerCount + (cast.crewCount || 2)} people`,
      drinks: ['Coffee/tea', 'Water', 'Soft drinks', 'Fresh fruit'],
      parking: `${Math.ceil((cast.performerCount + (cast.crewCount || 2)) / 4)} parking spaces`,
    },
  }
}

function formatShowCall(duration: number): string {
  // Show call is typically 30-60 min before show
  const callMinutes = duration > 90 ? 60 : 30
  return `18:${60 - callMinutes < 10 ? '0' : ''}${60 - callMinutes || '30'}`
}

/**
 * Generate simplified tech rider for smaller venues
 */
export function generateSimpleTechRider(input: TechRiderInput): string {
  const { production, cast, stage } = input

  return `
${production.name.toUpperCase()}
Technical Requirements Summary

STAGE: Minimum ${stage.minWidth}m x ${stage.minDepth}m
${stage.minHeight ? `Height: ${stage.minHeight}m minimum` : ''}

SOUND:
- PA suitable for venue
- ${Math.ceil(cast.performerCount / 2)} wireless microphones
- Playback system (computer/QLab)

LIGHTING:
- Basic stage wash
- Specials as available
${['theater', 'dance', 'circus'].includes(production.type) ? '- Follow spot required' : ''}

DRESSING ROOM:
- ${Math.ceil(cast.performerCount / 4)} rooms with mirrors

LOAD-IN: ${production.type === 'circus' ? '6-8 hours' : '3-4 hours'} before show

For full technical rider, contact production management.
  `.trim()
}
