import { parseRepertoireCSV, ParsedSong } from '../csv-parser'

describe('parseRepertoireCSV', () => {
  it('should parse basic CSV with English headers', () => {
    const csv = `title,artist,genre,duration,bpm,key,notes
Bohemian Rhapsody,Queen,Rock,355,72,Bb,Classic rock anthem
Imagine,John Lennon,Pop,183,76,C,Peace song`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs).toHaveLength(2)
    expect(result.errors).toHaveLength(0)
    expect(result.totalRows).toBe(2)

    expect(result.songs[0]).toEqual({
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      genre: 'Rock',
      duration: 355,
      bpm: 72,
      key: 'Bb',
      notes: 'Classic rock anthem',
    })
  })

  it('should parse CSV with Czech headers', () => {
    const csv = `název,interpret,žánr,délka,tempo,tónina,poznámky
Bohemian Rhapsody,Queen,Rock,355,72,Bb,Klasická rocková hymna`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs).toHaveLength(1)
    expect(result.songs[0].title).toBe('Bohemian Rhapsody')
  })

  it('should handle quoted values with commas', () => {
    const csv = `title,artist,notes
"Song, with comma","Artist, name","Notes, with, commas"`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs[0].title).toBe('Song, with comma')
  })

  it('should parse duration in MM:SS format', () => {
    const csv = `title,duration
Test Song,3:45`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs[0].duration).toBe(225) // 3*60 + 45
  })

  it('should parse duration in minutes format (3m45s)', () => {
    const csv = `title,duration
Test Song,3m45s`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs[0].duration).toBe(225)
  })

  it('should parse duration in seconds', () => {
    const csv = `title,duration
Test Song,180`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs[0].duration).toBe(180)
  })

  it('should handle missing optional fields', () => {
    const csv = `title,artist
Test Song,`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs[0]).toEqual({
      title: 'Test Song',
      artist: undefined,
      genre: undefined,
      duration: undefined,
      bpm: undefined,
      key: undefined,
      notes: undefined,
    })
  })

  it('should skip empty lines', () => {
    const csv = `title,artist
Test Song,Artist


Another Song,Artist 2`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(true)
    expect(result.songs).toHaveLength(2)
  })

  it('should return error if title column is missing', () => {
    const csv = `artist,genre
Queen,Rock`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(false)
    expect(result.errors[0].message).toContain('Title column is required')
  })

  it('should return error if CSV has no data rows', () => {
    const csv = `title,artist,genre`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(false)
    expect(result.errors[0].message).toContain('at least one data row')
  })

  it('should report error for rows with missing title', () => {
    const csv = `title,artist
,Queen
Test Song,Artist`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(false)
    expect(result.songs).toHaveLength(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].row).toBe(2)
    expect(result.errors[0].message).toContain('Missing title')
  })

  it('should handle mixed valid and invalid rows', () => {
    const csv = `title,artist,duration
Song 1,Artist 1,180
,Artist 2,200
Song 3,Artist 3,invalid
Song 4,Artist 4,150`

    const result = parseRepertoireCSV(csv)

    expect(result.success).toBe(false)
    expect(result.songs.length).toBeGreaterThan(0)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
