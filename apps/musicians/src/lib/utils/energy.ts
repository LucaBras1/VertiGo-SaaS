/**
 * Energy calculation utilities for setlist visualization
 *
 * Energy is calculated based on mood and BPM of each song.
 * Range: 1-10 (1 = very chill, 10 = maximum energy)
 */

export type Mood = 'energetic' | 'party' | 'romantic' | 'chill' | 'mixed'

interface SongWithEnergy {
  id: string
  title: string
  artist?: string
  duration: number
  bpm?: number
  mood?: string
  order: number
}

export interface EnergyDataPoint {
  order: number
  title: string
  artist?: string
  energy: number
  bpm?: number
  mood?: string
  duration: number
  cumulativeTime: number // in seconds
}

/**
 * Base energy values for each mood
 */
const MOOD_ENERGY_BASE: Record<Mood, number> = {
  energetic: 9,
  party: 8,
  romantic: 5,
  chill: 3,
  mixed: 6,
}

/**
 * BPM modifiers for energy calculation
 * <80 BPM: -2
 * 80-100 BPM: -1
 * 100-120 BPM: 0
 * 120-140 BPM: +1
 * >140 BPM: +2
 */
function getBpmModifier(bpm?: number): number {
  if (!bpm) return 0
  if (bpm < 80) return -2
  if (bpm < 100) return -1
  if (bpm > 140) return 2
  if (bpm > 120) return 1
  return 0
}

/**
 * Calculate energy value for a single song
 * @param mood - The mood of the song
 * @param bpm - The BPM of the song (optional)
 * @returns Energy value between 1 and 10
 */
export function calculateSongEnergy(mood?: string, bpm?: number): number {
  const moodKey = (mood?.toLowerCase() as Mood) || 'mixed'
  const baseEnergy = MOOD_ENERGY_BASE[moodKey] ?? MOOD_ENERGY_BASE.mixed
  const bpmModifier = getBpmModifier(bpm)

  // Clamp between 1 and 10
  return Math.max(1, Math.min(10, baseEnergy + bpmModifier))
}

/**
 * Calculate energy flow data for an entire setlist
 * @param songs - Array of songs with mood and BPM data
 * @returns Array of energy data points for charting
 */
export function calculateEnergyFlow(songs: SongWithEnergy[]): EnergyDataPoint[] {
  const sortedSongs = [...songs].sort((a, b) => a.order - b.order)
  let cumulativeTime = 0

  return sortedSongs.map((song) => {
    const dataPoint: EnergyDataPoint = {
      order: song.order,
      title: song.title,
      artist: song.artist,
      energy: calculateSongEnergy(song.mood, song.bpm),
      bpm: song.bpm,
      mood: song.mood,
      duration: song.duration,
      cumulativeTime,
    }
    cumulativeTime += song.duration
    return dataPoint
  })
}

/**
 * Calculate average energy for a setlist
 * @param songs - Array of songs with mood and BPM data
 * @returns Average energy value
 */
export function calculateAverageEnergy(songs: SongWithEnergy[]): number {
  if (songs.length === 0) return 0

  const totalEnergy = songs.reduce((sum, song) => {
    return sum + calculateSongEnergy(song.mood, song.bpm)
  }, 0)

  return Math.round((totalEnergy / songs.length) * 10) / 10
}

/**
 * Analyze energy flow pattern
 * @param energyData - Array of energy data points
 * @returns Description of the energy pattern
 */
export function analyzeEnergyPattern(energyData: EnergyDataPoint[]): {
  pattern: 'ascending' | 'descending' | 'wave' | 'stable' | 'random'
  description: string
} {
  if (energyData.length < 3) {
    return { pattern: 'stable', description: 'Příliš málo písní pro analýzu' }
  }

  const energies = energyData.map(d => d.energy)
  const first = energies.slice(0, Math.floor(energies.length / 3))
  const middle = energies.slice(Math.floor(energies.length / 3), Math.floor(energies.length * 2 / 3))
  const last = energies.slice(Math.floor(energies.length * 2 / 3))

  const avgFirst = first.reduce((a, b) => a + b, 0) / first.length
  const avgMiddle = middle.reduce((a, b) => a + b, 0) / middle.length
  const avgLast = last.reduce((a, b) => a + b, 0) / last.length

  const variance = Math.max(...energies) - Math.min(...energies)

  if (variance < 2) {
    return { pattern: 'stable', description: 'Konzistentní energie po celou dobu' }
  }

  if (avgFirst < avgMiddle && avgMiddle > avgLast) {
    return { pattern: 'wave', description: 'Vlna - gradace k vrcholu a poté uklidnění' }
  }

  if (avgFirst < avgMiddle && avgMiddle < avgLast) {
    return { pattern: 'ascending', description: 'Vzestupná energie - gradace k závěru' }
  }

  if (avgFirst > avgMiddle && avgMiddle > avgLast) {
    return { pattern: 'descending', description: 'Sestupná energie - uklidňující průběh' }
  }

  return { pattern: 'random', description: 'Dynamický mix různých energií' }
}

/**
 * Get energy level label in Czech
 */
export function getEnergyLabel(energy: number): string {
  if (energy >= 9) return 'Maximální'
  if (energy >= 7) return 'Vysoká'
  if (energy >= 5) return 'Střední'
  if (energy >= 3) return 'Nízká'
  return 'Velmi nízká'
}

/**
 * Get energy level color for visualization
 */
export function getEnergyColor(energy: number): string {
  if (energy >= 9) return '#ef4444' // red-500
  if (energy >= 7) return '#f97316' // orange-500
  if (energy >= 5) return '#eab308' // yellow-500
  if (energy >= 3) return '#22c55e' // green-500
  return '#3b82f6' // blue-500
}
