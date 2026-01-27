/**
 * StageRiderAI - AI-powered technical rider generation
 *
 * Generates professional stage/tech riders based on:
 * - Band size and instrumentation
 * - Venue type
 * - Equipment ownership (own PA, backline, etc.)
 */

import { z } from 'zod'
import { generateStructuredCompletion, isOpenAIAvailable } from './openai-client'

// Input schema
export const StageRiderInputSchema = z.object({
  bandName: z.string(),
  bandSize: z.number().min(1).max(20),
  instruments: z.array(z.object({
    type: z.string(), // 'vocals', 'guitar', 'bass', 'drums', 'keys', 'sax', 'dj'
    quantity: z.number().default(1),
    notes: z.string().optional(),
  })),
  venueType: z.enum(['club', 'theater', 'outdoor', 'corporate', 'restaurant', 'festival']),
  hasOwnPA: z.boolean().default(false),
  hasBackline: z.boolean().default(false),
  eventDuration: z.number().optional(), // minutes
  specialRequirements: z.array(z.string()).optional(),
})

// Output schema
export const StageRiderSchema = z.object({
  // Header
  bandName: z.string(),
  riderDate: z.string(),
  contactPerson: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),

  // Executive Summary
  summary: z.string(),

  // Input List
  inputList: z.array(z.object({
    channel: z.number(),
    instrument: z.string(),
    microphone: z.string().optional(), // Suggested mic type
    notes: z.string().optional(),
  })),

  // Monitor Requirements
  monitors: z.object({
    quantity: z.number(),
    mixType: z.string(), // 'stereo' | 'mono'
    configuration: z.string(),
    notes: z.string().optional(),
  }),

  // Backline Requirements
  backline: z.array(z.object({
    item: z.string(),
    specifications: z.string(),
    optional: z.boolean().default(false),
  })),

  // Stage Requirements
  stage: z.object({
    minimumSize: z.string(), // e.g., "6m x 4m"
    ceilingHeight: z.string().optional(),
    powerOutlets: z.string(),
    notes: z.string().optional(),
  }),

  // Sound System Requirements
  soundSystem: z.object({
    required: z.boolean(),
    specifications: z.string().optional(),
    notes: z.string().optional(),
  }),

  // Lighting (if applicable)
  lighting: z.object({
    required: z.boolean(),
    specifications: z.string().optional(),
  }).optional(),

  // Timing
  timing: z.object({
    loadInTime: z.string(), // e.g., "2 hours before show"
    soundcheckDuration: z.string(), // e.g., "45 minutes"
    setupTime: z.string(),
    teardownTime: z.string(),
  }),

  // Hospitality
  hospitality: z.object({
    greenRoom: z.boolean(),
    greenRoomRequirements: z.string().optional(),
    catering: z.string().optional(),
    parking: z.string(),
  }),

  // Additional Notes
  additionalNotes: z.array(z.string()).optional(),

  // Contact Footer
  footer: z.string(),
})

export type StageRiderInput = z.infer<typeof StageRiderInputSchema>
export type StageRider = z.infer<typeof StageRiderSchema>

/**
 * Generate AI-powered stage rider
 */
export async function generateStageRider(
  input: StageRiderInput,
  context: { tenantId: string; contactInfo?: any }
): Promise<StageRider> {
  const validatedInput = StageRiderInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildStageRiderSystemPrompt()
  const userPrompt = buildStageRiderUserPrompt(validatedInput)

  // Try to use OpenAI if available
  if (isOpenAIAvailable()) {
    try {
      const aiResponse = await generateStructuredCompletion<StageRider>(
        systemPrompt,
        userPrompt + '\n\nIMPORTANT: Respond with valid JSON matching the stage rider schema. Include all sections.',
        {
          temperature: 0.5, // Lower temperature for more consistent technical specs
          maxTokens: 2500,
          model: 'gpt-4o-mini',
        }
      )

      if (aiResponse) {
        // Validate AI response and merge with context
        const validatedRider = StageRiderSchema.parse({
          ...aiResponse,
          bandName: validatedInput.bandName,
          riderDate: new Date().toISOString().split('T')[0],
          contactPerson: context.contactInfo,
        })
        console.log('[StageRiderAI] Generated rider using OpenAI')
        return validatedRider
      }
    } catch (error) {
      console.error('[StageRiderAI] OpenAI generation failed, falling back to template:', error)
    }
  }

  // Fallback to template-based generation
  console.log('[StageRiderAI] Using template-based generation')
  return generateStageRiderContent(validatedInput, context)
}

function buildStageRiderSystemPrompt(): string {
  return `You are an experienced tour manager and sound engineer who creates professional technical riders.

Your expertise includes:
- Standard audio equipment and specifications
- Venue technical requirements
- Professional stage plot design
- Union and safety regulations
- Industry-standard terminology

Create clear, professional technical riders that:
1. Are organized and easy to read
2. Use industry-standard terminology
3. Are realistic and reasonable
4. Include all necessary technical details
5. Consider venue limitations
6. Provide alternatives when possible

Format the rider professionally with clear sections and bullet points.`
}

function buildStageRiderUserPrompt(input: StageRiderInput): string {
  const instrumentList = input.instruments
    .map(i => `- ${i.quantity}x ${i.type}${i.notes ? ` (${i.notes})` : ''}`)
    .join('\n')

  return `Create a professional technical rider for:

BAND: ${input.bandName}
SIZE: ${input.bandSize} members
VENUE TYPE: ${input.venueType}

INSTRUMENTATION:
${instrumentList}

EQUIPMENT:
- Own PA System: ${input.hasOwnPA ? 'YES' : 'NO (venue must provide)'}
- Own Backline: ${input.hasBackline ? 'YES' : 'NO (venue must provide)'}

${input.specialRequirements?.length ? `SPECIAL REQUIREMENTS:\n${input.specialRequirements.map(r => `- ${r}`).join('\n')}` : ''}

Generate a complete technical rider including:
1. Input list with channel assignments
2. Monitor requirements
3. Backline needs (if applicable)
4. Stage specifications
5. Sound system requirements
6. Load-in and soundcheck timing
7. Hospitality requirements
8. Any additional technical notes

Be professional, clear, and industry-standard.`
}

function generateStageRiderContent(input: StageRiderInput, context: any): StageRider {
  const totalChannels = input.instruments.reduce((sum, i) => {
    // Estimate channels per instrument
    const channelsPerType: Record<string, number> = {
      vocals: 1,
      guitar: 1,
      bass: 1,
      drums: 8, // Typical drum mic setup
      keys: 2,
      sax: 1,
      dj: 2,
    }
    return sum + (channelsPerType[i.type.toLowerCase()] || 1) * i.quantity
  }, 0)

  // Generate input list
  const inputList: StageRider['inputList'] = []
  let channelNumber = 1

  input.instruments.forEach(({ type, quantity, notes }) => {
    const micSuggestions: Record<string, string> = {
      vocals: 'SM58 or equivalent',
      guitar: 'SM57 on cabinet',
      bass: 'DI + optional mic',
      drums: 'Kick: D6, Snare: SM57, Toms: MD421, OH: Condensers',
      keys: 'Stereo DI',
      sax: 'Condenser mic',
      dj: 'Stereo DI',
    }

    for (let i = 0; i < quantity; i++) {
      if (type.toLowerCase() === 'drums') {
        inputList.push(
          { channel: channelNumber++, instrument: 'Kick Drum', microphone: 'AKG D6 or equivalent' },
          { channel: channelNumber++, instrument: 'Snare Top', microphone: 'SM57' },
          { channel: channelNumber++, instrument: 'Snare Bottom', microphone: 'SM57 (optional)' },
          { channel: channelNumber++, instrument: 'Hi-Tom', microphone: 'Sennheiser MD421' },
          { channel: channelNumber++, instrument: 'Mid-Tom', microphone: 'Sennheiser MD421' },
          { channel: channelNumber++, instrument: 'Floor Tom', microphone: 'Sennheiser MD421' },
          { channel: channelNumber++, instrument: 'OH Left', microphone: 'Condenser' },
          { channel: channelNumber++, instrument: 'OH Right', microphone: 'Condenser' }
        )
      } else {
        inputList.push({
          channel: channelNumber++,
          instrument: type.charAt(0).toUpperCase() + type.slice(1),
          microphone: micSuggestions[type.toLowerCase()],
          notes,
        })
      }
    }
  })

  const rider: StageRider = {
    bandName: input.bandName,
    riderDate: new Date().toISOString().split('T')[0],
    contactPerson: context.contactInfo,

    summary: `${input.bandName} is a ${input.bandSize}-piece ${input.instruments.map(i => i.type).join('/')} band. ${
      input.hasOwnPA ? 'We provide our own PA system.' : 'We require the venue to provide a professional PA system.'
    } ${
      input.hasBackline ? 'We bring our own backline.' : 'We require the venue to provide backline as specified below.'
    } Total input channels required: ${totalChannels}.`,

    inputList,

    monitors: {
      quantity: Math.ceil(input.bandSize / 2),
      mixType: input.bandSize > 4 ? 'stereo' : 'mono',
      configuration: `${Math.ceil(input.bandSize / 2)} floor monitors (${input.bandSize > 4 ? 'stereo mix preferred' : 'mono acceptable'})`,
      notes: input.bandSize > 6 ? 'In-ear monitoring system available upon request' : undefined,
    },

    backline: input.hasBackline ? [] : [
      ...(input.instruments.some(i => i.type.toLowerCase() === 'drums') ? [
        { item: 'Drum Kit', specifications: '5-piece kit with cymbals (kick, snare, 3 toms, hi-hat, ride, crash)', optional: false },
        { item: 'Drum Throne', specifications: 'Adjustable height', optional: false },
      ] : []),
      ...(input.instruments.some(i => i.type.toLowerCase().includes('guitar')) ? [
        { item: 'Guitar Amplifier', specifications: '50W+ combo or half-stack (Fender, Marshall, or equivalent)', optional: false },
      ] : []),
      ...(input.instruments.some(i => i.type.toLowerCase() === 'bass') ? [
        { item: 'Bass Amplifier', specifications: '100W+ combo or stack (Ampeg, GK, or equivalent)', optional: false },
      ] : []),
      ...(input.instruments.some(i => i.type.toLowerCase() === 'keys') ? [
        { item: 'Keyboard Stand', specifications: 'Heavy-duty X or Z stand', optional: false },
      ] : []),
    ],

    stage: {
      minimumSize: calculateStageSize(input.bandSize),
      'ceilingHeight': input.venueType === 'outdoor' ? 'N/A' : '3m minimum',
      powerOutlets: `${Math.ceil(input.instruments.length / 2)} x 230V outlets (grounded)`,
      notes: input.venueType === 'outdoor' ? 'Covered stage required in case of rain' : undefined,
    },

    soundSystem: {
      required: !input.hasOwnPA,
      specifications: input.hasOwnPA ? 'Band provides own PA system' : `Professional PA system suitable for ${input.venueType} venue. FOH engineer required.`,
      notes: !input.hasOwnPA ? '2-3kW system minimum, stereo configuration' : undefined,
    },

    lighting: input.venueType !== 'restaurant' ? {
      required: ['concert', 'festival', 'theater'].includes(input.venueType),
      specifications: ['concert', 'festival'].includes(input.venueType) ?
        'Stage wash lighting minimum. Moving heads or intelligent lighting preferred.' :
        'Basic stage lighting acceptable',
    } : undefined,

    timing: {
      loadInTime: input.venueType === 'festival' ? '2 hours before performance' : '1.5 hours before performance',
      soundcheckDuration: `${input.bandSize > 5 ? '45-60' : '30-45'} minutes`,
      setupTime: `${input.hasBackline ? '30' : '45'} minutes`,
      teardownTime: '30 minutes',
    },

    hospitality: {
      greenRoom: input.bandSize > 4,
      greenRoomRequirements: input.bandSize > 4 ?
        `Private space for ${input.bandSize} people with seating, mirror, and power outlets` : undefined,
      catering: input.eventDuration && input.eventDuration > 180 ?
        'Light refreshments and bottled water for band members' : 'Bottled water',
      parking: `${Math.ceil(input.bandSize / 4)} vehicle parking spaces near load-in area`,
    },

    additionalNotes: [
      'Please contact us 48 hours before the event to confirm final details',
      'We require access to the venue for load-in at the specified time',
      ...(input.specialRequirements || []),
    ],

    footer: `For questions about this rider, please contact:\n${context.contactInfo?.name || '[Band Contact]'}\n${context.contactInfo?.phone || '[Phone]'}\n${context.contactInfo?.email || '[Email]'}`,
  }

  return rider
}

function calculateStageSize(bandSize: number): string {
  if (bandSize <= 3) return '4m x 3m'
  if (bandSize <= 5) return '6m x 4m'
  if (bandSize <= 8) return '8m x 5m'
  return '10m x 6m'
}

/**
 * Export stage rider as PDF
 * @param rider - The stage rider data to export
 * @returns Promise<Buffer> - PDF buffer that can be converted to Blob client-side
 */
export async function exportStageRiderPDF(rider: StageRider): Promise<Buffer> {
  // Dynamic import to avoid SSR issues
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { StageRiderPDF } = await import('../pdf/stage-rider-pdf')
  const React = await import('react')

  const riderData = {
    ...rider,
    generatedDate: new Date().toISOString(),
  }

  const pdfBuffer = await renderToBuffer(
    React.createElement(StageRiderPDF, { data: riderData }) as any
  )

  return pdfBuffer
}

/**
 * Export stage rider as plain text
 */
export function exportStageRiderText(rider: StageRider): string {
  return `
TECHNICAL RIDER
${rider.bandName}
Date: ${rider.riderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
${rider.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT LIST (${rider.inputList.length} channels)
${rider.inputList.map(i => `${i.channel}. ${i.instrument}${i.microphone ? ` - ${i.microphone}` : ''}${i.notes ? ` (${i.notes})` : ''}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONITOR REQUIREMENTS
- Quantity: ${rider.monitors.quantity}
- Configuration: ${rider.monitors.configuration}
${rider.monitors.notes ? `- Notes: ${rider.monitors.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKLINE REQUIREMENTS
${rider.backline.length > 0 ? rider.backline.map(b => `- ${b.item}: ${b.specifications}${b.optional ? ' (optional)' : ''}`).join('\n') : 'Band provides own backline'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAGE REQUIREMENTS
- Minimum Size: ${rider.stage.minimumSize}
${rider.stage['ceilingHeight'] ? `- Ceiling Height: ${rider.stage['ceilingHeight']}` : ''}
- Power: ${rider.stage.powerOutlets}
${rider.stage.notes ? `- Notes: ${rider.stage.notes}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOUND SYSTEM
${rider.soundSystem.specifications}
${rider.soundSystem.notes ? `Notes: ${rider.soundSystem.notes}` : ''}

${rider.lighting ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LIGHTING
${rider.lighting.specifications || 'Basic stage lighting'}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMING
- Load-in: ${rider.timing.loadInTime}
- Soundcheck: ${rider.timing.soundcheckDuration}
- Setup: ${rider.timing.setupTime}
- Teardown: ${rider.timing.teardownTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOSPITALITY
- Green Room: ${rider.hospitality.greenRoom ? 'Required' : 'Not required'}
${rider.hospitality.greenRoomRequirements ? `  ${rider.hospitality.greenRoomRequirements}` : ''}
- Catering: ${rider.hospitality.catering}
- Parking: ${rider.hospitality.parking}

${rider.additionalNotes?.length ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADDITIONAL NOTES
${rider.additionalNotes.map(n => `- ${n}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${rider.footer}
`.trim()
}
