export interface ParsedSong {
  title: string
  artist?: string
  genre?: string
  duration?: number // in seconds
  bpm?: number
  key?: string
  notes?: string
}

export interface CSVParseResult {
  success: boolean
  songs: ParsedSong[]
  errors: Array<{ row: number; message: string }>
  totalRows: number
}

export function parseRepertoireCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) {
    return {
      success: false,
      songs: [],
      errors: [{ row: 0, message: 'CSV must have header and at least one data row' }],
      totalRows: 0
    }
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
  const titleIndex = findColumnIndex(headers, ['title', 'název', 'name', 'song'])

  if (titleIndex === -1) {
    return {
      success: false,
      songs: [],
      errors: [{ row: 0, message: 'Title column is required' }],
      totalRows: 0
    }
  }

  const songs: ParsedSong[] = []
  const errors: Array<{ row: number; message: string }> = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    try {
      const values = parseCSVLine(line)
      const song = mapRowToSong(headers, values)
      if (song.title) {
        songs.push(song)
      } else {
        errors.push({ row: i + 1, message: 'Missing title' })
      }
    } catch (e) {
      errors.push({ row: i + 1, message: String(e) })
    }
  }

  return {
    success: errors.length === 0,
    songs,
    errors,
    totalRows: lines.length - 1
  }
}

function parseCSVLine(line: string): string[] {
  // Handle quoted values and commas inside quotes
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  return headers.findIndex(h => possibleNames.includes(h))
}

function mapRowToSong(headers: string[], values: string[]): ParsedSong {
  const getValue = (possibleNames: string[]): string | undefined => {
    const idx = findColumnIndex(headers, possibleNames)
    return idx !== -1 && values[idx] ? values[idx] : undefined
  }

  const durationStr = getValue(['duration', 'délka', 'length', 'trvání'])
  const bpmStr = getValue(['bpm', 'tempo'])

  return {
    title: getValue(['title', 'název', 'name', 'song', 'píseň']) || '',
    artist: getValue(['artist', 'interpret', 'author', 'autor']),
    genre: getValue(['genre', 'žánr', 'style', 'styl']),
    duration: durationStr ? parseDuration(durationStr) : undefined,
    bpm: bpmStr ? parseInt(bpmStr) : undefined,
    key: getValue(['key', 'tónina', 'tonalita']),
    notes: getValue(['notes', 'poznámky', 'note', 'comment', 'komentář']),
  }
}

function parseDuration(str: string): number {
  // Handle formats: "3:45", "225", "3m45s"
  if (str.includes(':')) {
    const [min, sec] = str.split(':').map(Number)
    return min * 60 + sec
  }
  const match = str.match(/(\d+)m\s*(\d+)?s?/)
  if (match) {
    return parseInt(match[1]) * 60 + (parseInt(match[2]) || 0)
  }
  return parseInt(str) || 0
}
