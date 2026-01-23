/**
 * TimelineOptimizerAI - AI-powered event timeline generation
 *
 * Creates optimized event schedules considering:
 * - Multiple performers and vendors
 * - Setup and breakdown times
 * - Guest experience flow
 * - Weather contingencies
 * - Safety requirements
 */

import { z } from 'zod'

// Input schema
export const TimelineInputSchema = z.object({
  event: z.object({
    name: z.string(),
    type: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'gala', 'concert', 'product_launch', 'other']),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    guestCount: z.number(),
  }),

  venue: z.object({
    name: z.string(),
    type: z.enum(['indoor', 'outdoor', 'mixed']),
    capacity: z.number().optional(),
    setupAccessTime: z.string().optional(),
    curfew: z.string().optional(),
    restrictions: z.array(z.string()).optional(),
  }),

  performers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['fire', 'magic', 'circus', 'music', 'dance', 'comedy', 'interactive', 'other']),
    setupTime: z.number(), // minutes
    performanceTime: z.number(), // minutes
    breakdownTime: z.number(), // minutes
    requirements: z.object({
      space: z.string().optional(),
      power: z.boolean().optional(),
      rigging: z.boolean().optional(),
      safetyDistance: z.number().optional(), // meters
    }).optional(),
    mustPerformBefore: z.array(z.string()).optional(), // performer IDs
    mustPerformAfter: z.array(z.string()).optional(),
  })),

  activities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['roaming', 'static', 'workshop', 'interactive']),
    duration: z.number(), // minutes
    capacity: z.number().optional(),
    requirements: z.array(z.string()).optional(),
  })).optional(),

  milestones: z.array(z.object({
    name: z.string(),
    time: z.string(),
    duration: z.number().optional(),
    isFlexible: z.boolean().default(false),
  })).optional(), // e.g., speeches, cake cutting

  constraints: z.object({
    breaksBetweenActs: z.number().default(10), // minutes
    simultaneousPerformersMax: z.number().default(2),
    weatherSensitive: z.boolean().default(false),
  }).optional(),
})

// Output schema
export const TimelineSchema = z.object({
  schedule: z.array(z.object({
    time: z.string(),
    endTime: z.string(),
    type: z.enum(['setup', 'performance', 'activity', 'milestone', 'break', 'transition', 'backup']),
    title: z.string(),
    description: z.string().optional(),
    performerId: z.string().optional(),
    location: z.string().optional(),
    staffNotes: z.string().optional(),
    guestFacing: z.boolean().default(true),
  })),

  performerCallTimes: z.array(z.object({
    performerId: z.string(),
    performerName: z.string(),
    callTime: z.string(),
    setupStart: z.string(),
    performanceStart: z.string(),
    performanceEnd: z.string(),
    loadOut: z.string(),
    notes: z.string().optional(),
  })),

  vendorTimeline: z.array(z.object({
    vendor: z.string(),
    arrivalTime: z.string(),
    setupComplete: z.string(),
    loadOut: z.string(),
  })).optional(),

  guestExperience: z.object({
    peakMoments: z.array(z.object({
      time: z.string(),
      description: z.string(),
    })),
    flowDescription: z.string(),
    energyArc: z.string(),
  }),

  contingencyPlans: z.array(z.object({
    scenario: z.string(),
    trigger: z.string(),
    plan: z.string(),
    affectedItems: z.array(z.string()),
  })),

  summary: z.object({
    totalRuntime: z.number(), // minutes
    numberOfPerformances: z.number(),
    setupTimeRequired: z.number(),
    peakStaffNeeded: z.number(),
    potentialIssues: z.array(z.string()),
  }),
})

export type TimelineInput = z.infer<typeof TimelineInputSchema>
export type Timeline = z.infer<typeof TimelineSchema>

/**
 * Generate optimized event timeline
 */
export async function generateTimeline(
  input: TimelineInput,
  context: { tenantId: string }
): Promise<Timeline> {
  const validatedInput = TimelineInputSchema.parse(input)

  // Build prompts
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // TODO: Integrate with @vertigo/ai-core
  // const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  // const response = await ai.chatStructured(...)

  // Generate timeline
  return optimizeTimeline(validatedInput)
}

function buildSystemPrompt(): string {
  return `You are an expert event producer and stage manager with 20+ years of experience.
Your specialty is creating seamless event timelines that maximize guest experience and performer safety.

KEY PRINCIPLES:

1. FLOW: Create natural energy progression
   - Start medium, build to peaks, allow valleys for recovery
   - Place spectacular acts at key moments
   - End on a high note

2. LOGISTICS: Account for all technical needs
   - Adequate setup/breakdown time between acts
   - Safety distances for fire/aerial acts
   - Power and rigging requirements
   - Weather contingencies for outdoor events

3. GUEST EXPERIENCE: Keep guests engaged
   - Minimize dead time
   - Use roaming entertainment during gaps
   - Consider guest energy levels

4. SAFETY: Always prioritize safety
   - Fire acts need safety briefings
   - Aerial acts need rigging checks
   - Weather protocols for outdoor events

TIMELINE STRUCTURE:
- Setup calls: Well before event start
- Buffer time: Always build in extra time
- Show calls: Clear performer call times
- Transitions: Allow proper changeover time
- Contingency: Have backup plans ready`
}

function buildUserPrompt(input: TimelineInput): string {
  const { event, venue, performers, activities, milestones, constraints } = input

  let prompt = `Create an optimized timeline for this event:

EVENT DETAILS:
- Name: ${event.name}
- Type: ${event.type}
- Date: ${event.date}
- Time: ${event.startTime} - ${event.endTime}
- Guest Count: ${event.guestCount}

VENUE:
- Name: ${venue.name}
- Type: ${venue.type}
${venue.setupAccessTime ? `- Setup Access: ${venue.setupAccessTime}` : ''}
${venue.curfew ? `- Curfew: ${venue.curfew}` : ''}
${venue.restrictions?.length ? `- Restrictions: ${venue.restrictions.join(', ')}` : ''}

PERFORMERS:`

  performers.forEach((p, i) => {
    prompt += `\n${i + 1}. ${p.name} (${p.type})
   - Performance: ${p.performanceTime} min
   - Setup: ${p.setupTime} min, Breakdown: ${p.breakdownTime} min`
    if (p.requirements?.safetyDistance) {
      prompt += `\n   - Safety distance: ${p.requirements.safetyDistance}m`
    }
    if (p.mustPerformAfter?.length) {
      prompt += `\n   - Must perform after: ${p.mustPerformAfter.join(', ')}`
    }
  })

  if (activities?.length) {
    prompt += `\n\nACTIVITIES:`
    activities.forEach((a, i) => {
      prompt += `\n${i + 1}. ${a.name} (${a.type}, ${a.duration} min)`
    })
  }

  if (milestones?.length) {
    prompt += `\n\nKEY MILESTONES:`
    milestones.forEach(m => {
      prompt += `\n- ${m.time}: ${m.name}${m.isFlexible ? ' (flexible)' : ''}`
    })
  }

  prompt += `\n\nCONSTRAINTS:
- Min break between acts: ${constraints?.breaksBetweenActs || 10} min
- Max simultaneous performers: ${constraints?.simultaneousPerformersMax || 2}
- Weather sensitive: ${constraints?.weatherSensitive ? 'Yes' : 'No'}

Create a complete timeline with:
1. All performer call times
2. Detailed schedule with transitions
3. Guest experience flow
4. Contingency plans`

  return prompt
}

/**
 * Optimize timeline with algorithm
 */
function optimizeTimeline(input: TimelineInput): Timeline {
  const { event, performers, milestones, constraints } = input

  // Parse times
  const eventStart = parseTime(event.startTime)
  const eventEnd = parseTime(event.endTime)
  const breakDuration = constraints?.breaksBetweenActs || 10

  // Sort performers by dependencies and duration
  const sortedPerformers = [...performers].sort((a, b) => {
    // Fire acts typically go later (after dark)
    if (a.type === 'fire' && b.type !== 'fire') return 1
    if (b.type === 'fire' && a.type !== 'fire') return -1
    // Longer acts in peak positions
    return b.performanceTime - a.performanceTime
  })

  // Generate schedule
  const schedule: Timeline['schedule'] = []
  const performerCallTimes: Timeline['performerCallTimes'] = []

  // Add setup phase
  let currentTime = eventStart - 60 // 1 hour before for setup

  schedule.push({
    time: formatTime(currentTime),
    endTime: formatTime(eventStart),
    type: 'setup',
    title: 'Venue setup and sound check',
    description: 'All vendors and performers setup',
    guestFacing: false,
    staffNotes: 'Confirm all performers have arrived',
  })

  // Add milestones to timeline first
  milestones?.forEach(m => {
    schedule.push({
      time: m.time,
      endTime: formatTime(parseTime(m.time) + (m.duration || 15)),
      type: 'milestone',
      title: m.name,
      guestFacing: true,
    })
  })

  // Schedule performers
  currentTime = eventStart + 15 // Start entertainment 15 min after event starts

  sortedPerformers.forEach((performer, index) => {
    const setupStart = currentTime - performer.setupTime
    const performanceStart = currentTime
    const performanceEnd = currentTime + performer.performanceTime
    const loadOut = performanceEnd + performer.breakdownTime

    // Add to schedule
    schedule.push({
      time: formatTime(performanceStart),
      endTime: formatTime(performanceEnd),
      type: 'performance',
      title: performer.name,
      description: `${performer.type} performance`,
      performerId: performer.id,
      guestFacing: true,
      staffNotes: performer.requirements?.safetyDistance
        ? `Maintain ${performer.requirements.safetyDistance}m safety distance`
        : undefined,
    })

    // Add call time
    performerCallTimes.push({
      performerId: performer.id,
      performerName: performer.name,
      callTime: formatTime(setupStart - 30), // 30 min before setup
      setupStart: formatTime(setupStart),
      performanceStart: formatTime(performanceStart),
      performanceEnd: formatTime(performanceEnd),
      loadOut: formatTime(loadOut),
    })

    // Move time forward
    currentTime = performanceEnd + breakDuration
  })

  // Sort schedule by time
  schedule.sort((a, b) => parseTime(a.time) - parseTime(b.time))

  // Calculate summary
  const totalRuntime = eventEnd - eventStart

  return {
    schedule,
    performerCallTimes,

    guestExperience: {
      peakMoments: [
        {
          time: formatTime(eventStart + Math.round(totalRuntime * 0.3)),
          description: 'First major performance peak',
        },
        {
          time: formatTime(eventStart + Math.round(totalRuntime * 0.7)),
          description: 'Climactic entertainment moment',
        },
      ],
      flowDescription: 'Gradual build from welcoming entertainment to peak excitement, with recovery moments between acts',
      energyArc: 'Start medium → Build → Peak at 70% → Sustain → Memorable finale',
    },

    contingencyPlans: [
      {
        scenario: 'Performer no-show',
        trigger: 'Performer not present 30 min before call time',
        plan: 'Extend adjacent acts, add roaming entertainment',
        affectedItems: ['Schedule adjustment', 'Guest communication'],
      },
      {
        scenario: 'Weather deterioration (outdoor)',
        trigger: 'Rain or high winds detected',
        plan: 'Move to backup indoor location or covered area',
        affectedItems: ['All outdoor performances', 'Guest seating'],
      },
      {
        scenario: 'Technical failure',
        trigger: 'Sound or lighting malfunction',
        plan: 'Switch to acoustic/unplugged acts while resolving',
        affectedItems: ['Power-dependent performances'],
      },
    ],

    summary: {
      totalRuntime,
      numberOfPerformances: performers.length,
      setupTimeRequired: performers.reduce((sum, p) => sum + p.setupTime, 0) + 60,
      peakStaffNeeded: Math.ceil(performers.length / 2) + 2,
      potentialIssues: [
        performers.some(p => p.type === 'fire') && input.venue.type === 'indoor'
          ? 'Fire act in indoor venue - verify safety clearance'
          : '',
        totalRuntime > 300 ? 'Long event - ensure staff rotation' : '',
      ].filter(Boolean),
    },
  }
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Calculate optimal performer order
 */
export function optimizePerformerOrder(
  performers: TimelineInput['performers'],
  eventType: string
): string[] {
  // Score each performer for different positions
  const scored = performers.map(p => ({
    id: p.id,
    openingScore: p.type === 'interactive' ? 80 : p.type === 'music' ? 70 : 50,
    middleScore: p.type === 'circus' ? 90 : p.type === 'magic' ? 85 : 60,
    closingScore: p.type === 'fire' ? 95 : p.performanceTime > 20 ? 80 : 60,
  }))

  // Simple greedy allocation
  const result: string[] = []
  const used = new Set<string>()

  // Best opener
  const opener = scored
    .filter(s => !used.has(s.id))
    .sort((a, b) => b.openingScore - a.openingScore)[0]
  if (opener) {
    result.push(opener.id)
    used.add(opener.id)
  }

  // Best closer
  const closer = scored
    .filter(s => !used.has(s.id))
    .sort((a, b) => b.closingScore - a.closingScore)[0]

  // Middle acts
  scored
    .filter(s => !used.has(s.id) && s.id !== closer?.id)
    .sort((a, b) => b.middleScore - a.middleScore)
    .forEach(s => {
      result.push(s.id)
      used.add(s.id)
    })

  // Add closer at end
  if (closer && !used.has(closer.id)) {
    result.push(closer.id)
  }

  return result
}
