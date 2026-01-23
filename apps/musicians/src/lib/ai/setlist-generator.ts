/**
 * SetlistAI - AI-powered setlist generation for musicians
 *
 * Generates optimal setlists based on:
 * - Event type (wedding, corporate, party, concert, festival)
 * - Duration and number of sets
 * - Mood and energy flow
 * - Audience demographics
 * - Band's repertoire
 */

import { z } from 'zod'

// Input schema
export const SetlistGeneratorInputSchema = z.object({
  eventType: z.enum(['wedding', 'corporate', 'party', 'concert', 'festival', 'private', 'other']),
  duration: z.number().min(30).max(480), // Minutes: 30min - 8 hours
  numberOfSets: z.number().min(1).max(5).default(1),
  breakDuration: z.number().min(0).max(60).default(15), // Minutes
  mood: z.enum(['energetic', 'romantic', 'chill', 'mixed', 'party']),
  audienceAge: z.string().optional(), // e.g., "25-45", "40-60"
  venueType: z.enum(['indoor', 'outdoor', 'club', 'theater', 'restaurant']).optional(),
  specialRequests: z.array(z.string()).optional(),
  repertoire: z.array(z.object({
    title: z.string(),
    artist: z.string().optional(),
    duration: z.number(), // seconds
    genre: z.string().optional(),
    mood: z.string().optional(),
    bpm: z.number().optional(),
    key: z.string().optional(),
  })),
})

// Output schema
export const SetlistSchema = z.object({
  sets: z.array(z.object({
    setNumber: z.number(),
    startTime: z.string().optional(), // e.g., "19:00"
    duration: z.number(), // minutes
    songs: z.array(z.object({
      order: z.number(),
      title: z.string(),
      artist: z.string().optional(),
      duration: z.number(), // seconds
      key: z.string().optional(),
      bpm: z.number().optional(),
      mood: z.string(),
      notes: z.string().optional(), // Performance notes
      reason: z.string(), // Why this song fits
    })),
    totalDuration: z.number(), // seconds
    energyLevel: z.string(), // 'high' | 'medium' | 'low'
    transitionNotes: z.string().optional(),
  })),
  totalDuration: z.number(), // minutes
  moodProgression: z.string(), // Description of energy flow
  recommendations: z.array(z.string()),
  contingencyPlan: z.object({
    extraSongs: z.array(z.string()), // Song titles to add if running short
    songsToSkip: z.array(z.string()), // Songs to skip if running long
  }).optional(),
})

export type SetlistGeneratorInput = z.infer<typeof SetlistGeneratorInputSchema>
export type Setlist = z.infer<typeof SetlistSchema>

/**
 * Generate AI-powered setlist
 */
export async function generateSetlist(
  input: SetlistGeneratorInput,
  context: { tenantId: string }
): Promise<Setlist> {
  // Validate input
  const validatedInput = SetlistGeneratorInputSchema.parse(input)

  // Build AI prompt
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(validatedInput)

  // Call AI (placeholder - will integrate with @vertigo/ai-core)
  // const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
  // const response = await ai.chatStructured(
  //   [
  //     { role: 'system', content: systemPrompt },
  //     { role: 'user', content: userPrompt }
  //   ],
  //   SetlistSchema,
  //   { tenantId: context.tenantId, vertical: 'musicians' }
  // )

  // For now, return mock data
  return generateMockSetlist(validatedInput)
}

function buildSystemPrompt(): string {
  return `You are an expert music programmer and bandleader with 20+ years of experience.
Your specialty is creating perfect setlists that:

1. Match the event's mood and energy requirements
2. Consider audience demographics and preferences
3. Create smooth transitions between songs
4. Build and maintain energy throughout the performance
5. Include crowd-pleasers at strategic moments
6. Allow for natural breaks and pacing

Key principles:
- START STRONG: Open with a recognizable, mid-energy song to engage the crowd
- BUILD GRADUALLY: Increase energy over the first 15-20 minutes
- PEAK MOMENTS: Place biggest crowd-pleasers 2/3 through each set
- SMOOTH TRANSITIONS: Group songs by key, tempo, or mood when possible
- END MEMORABLY: Close each set with a sing-along or high-energy anthem
- VARIETY: Mix genres, eras, and tempos to maintain interest
- RECOVERY SONGS: Include slower songs after high-energy peaks

For WEDDINGS:
- Start romantic during dinner
- Build to dance-party energy after first dance
- Include classics that span generations
- End with an uplifting group sing-along

For CORPORATE:
- Professional but engaging
- Avoid controversial songs
- Include recognizable crowd-pleasers
- Keep energy positive and upbeat

For CONCERTS:
- Showcase best original material early
- Include covers strategically
- Build to climactic finale
- Consider encore potential

Output a detailed setlist with timing, transitions, and reasoning for each song choice.`
}

function buildUserPrompt(input: SetlistGeneratorInput): string {
  const repertoireList = input.repertoire
    .map(song => `- "${song.title}"${song.artist ? ` by ${song.artist}` : ''} (${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}, ${song.mood || 'unknown mood'}, ${song.bpm ? song.bpm + ' BPM' : 'no BPM'})`)
    .join('\n')

  return `Generate a ${input.numberOfSets}-set setlist for a ${input.eventType} event.

EVENT DETAILS:
- Total Duration: ${input.duration} minutes
- Number of Sets: ${input.numberOfSets}
- Break Duration: ${input.breakDuration} minutes
- Desired Mood: ${input.mood}
${input.audienceAge ? `- Audience Age: ${input.audienceAge}` : ''}
${input.venueType ? `- Venue Type: ${input.venueType}` : ''}
${input.specialRequests?.length ? `\nSPECIAL REQUESTS:\n${input.specialRequests.map(r => `- ${r}`).join('\n')}` : ''}

AVAILABLE REPERTOIRE:
${repertoireList}

Create a setlist that:
1. Fits the total duration (accounting for breaks)
2. Matches the event type and mood
3. Creates an engaging energy arc
4. Uses ONLY songs from the provided repertoire
5. Includes performance notes and transition tips

Also provide:
- Overall mood progression strategy
- Contingency plan (songs to add/skip for timing adjustments)
- Tips for maximum audience engagement`
}

/**
 * Generate mock setlist for development/testing
 */
function generateMockSetlist(input: SetlistGeneratorInput): Setlist {
  const setDuration = (input.duration - (input.numberOfSets - 1) * input.breakDuration) / input.numberOfSets

  return {
    sets: Array.from({ length: input.numberOfSets }, (_, i) => ({
      setNumber: i + 1,
      duration: setDuration,
      songs: [
        {
          order: 1,
          title: input.repertoire[0]?.title || 'Opening Song',
          artist: input.repertoire[0]?.artist,
          duration: input.repertoire[0]?.duration || 240,
          mood: 'energetic',
          reason: 'Strong opener to grab attention',
          notes: 'Start with confidence, make eye contact with audience',
        },
        {
          order: 2,
          title: input.repertoire[1]?.title || 'Second Song',
          artist: input.repertoire[1]?.artist,
          duration: input.repertoire[1]?.duration || 220,
          mood: 'upbeat',
          reason: 'Build energy momentum',
        },
      ],
      totalDuration: 460,
      energyLevel: i === 0 ? 'medium' : 'high',
      transitionNotes: i < input.numberOfSets - 1 ? `Take ${input.breakDuration}-minute break. Return with high energy` : undefined,
    })),
    totalDuration: input.duration,
    moodProgression: `Start ${input.mood === 'romantic' ? 'gentle and intimate' : 'energetic'}, build to peak energy 2/3 through, close strong.`,
    recommendations: [
      'Engage with audience between songs',
      'Watch crowd energy and adjust tempo if needed',
      'Save biggest crowd-pleaser for 2/3 mark',
    ],
    contingencyPlan: {
      extraSongs: input.repertoire.slice(0, 3).map(s => s.title),
      songsToSkip: input.repertoire.slice(-2).map(s => s.title),
    },
  }
}

/**
 * Calculate optimal set break times
 */
export function calculateSetTimes(
  startTime: string,
  totalDuration: number,
  numberOfSets: number,
  breakDuration: number
): Array<{ setNumber: number; startTime: string; endTime: string }> {
  const [hours, minutes] = startTime.split(':').map(Number)
  let currentTime = hours * 60 + minutes // Convert to minutes

  const setDuration = (totalDuration - (numberOfSets - 1) * breakDuration) / numberOfSets
  const times = []

  for (let i = 0; i < numberOfSets; i++) {
    const setStart = currentTime
    const setEnd = currentTime + setDuration

    times.push({
      setNumber: i + 1,
      startTime: formatTime(setStart),
      endTime: formatTime(setEnd),
    })

    currentTime = setEnd + (i < numberOfSets - 1 ? breakDuration : 0)
  }

  return times
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
