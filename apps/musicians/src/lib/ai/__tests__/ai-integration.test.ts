/**
 * AI Integration Tests
 *
 * Tests the OpenAI integration for all AI modules.
 * Tests will use mock data when OPENAI_API_KEY is not set.
 */

import { describe, it, expect } from '@jest/globals'
import { generateSetlist } from '../setlist-generator'
import { calculateGigPrice } from '../gig-price-calculator'
import { generateStageRider } from '../stage-rider-generator'
import { isOpenAIAvailable } from '../openai-client'

describe('AI Integration', () => {
  describe('OpenAI Client', () => {
    it('should detect if OpenAI is available', () => {
      const available = isOpenAIAvailable()
      expect(typeof available).toBe('boolean')

      if (!available) {
        console.log('OPENAI_API_KEY not set - tests will use mock data')
      }
    })
  })

  describe('Setlist Generator', () => {
    it('should generate a setlist with valid data', async () => {
      const input = {
        eventType: 'wedding' as const,
        duration: 240,
        numberOfSets: 3,
        breakDuration: 15,
        mood: 'mixed' as const,
        audienceAge: '25-55',
        venueType: 'indoor' as const,
        repertoire: [
          {
            title: 'Valerie',
            artist: 'Amy Winehouse',
            duration: 230,
            genre: 'Soul',
            mood: 'upbeat',
            bpm: 110,
            key: 'C',
          },
          {
            title: 'Thinking Out Loud',
            artist: 'Ed Sheeran',
            duration: 281,
            genre: 'Pop',
            mood: 'romantic',
            bpm: 79,
            key: 'D',
          },
          {
            title: 'Uptown Funk',
            artist: 'Bruno Mars',
            duration: 269,
            genre: 'Funk',
            mood: 'energetic',
            bpm: 115,
            key: 'Dm',
          },
        ],
      }

      const result = await generateSetlist(input, { tenantId: 'test-tenant' })

      expect(result).toBeDefined()
      expect(result.sets).toBeInstanceOf(Array)
      expect(result.sets.length).toBe(3)
      expect(result.totalDuration).toBe(240)
      expect(result.moodProgression).toBeDefined()
      expect(result.recommendations).toBeInstanceOf(Array)
    }, 30000) // 30s timeout for API call
  })

  describe('Gig Price Calculator', () => {
    it('should calculate pricing with three tiers', async () => {
      const input = {
        eventType: 'wedding' as const,
        location: {
          city: 'Prague',
          country: 'CZ',
        },
        date: '2024-06-15',
        isWeekend: true,
        isPeakSeason: true,
        duration: 240,
        numberOfSets: 3,
        bandSize: 5,
        experienceLevel: 'professional' as const,
        hasOwnPA: true,
        providesLighting: false,
        travelDistance: 50,
        requiresAccommodation: false,
      }

      const result = await calculateGigPrice(input, { tenantId: 'test-tenant' })

      expect(result).toBeDefined()
      expect(result.currency).toBe('CZK')
      expect(result.economy).toBeDefined()
      expect(result.standard).toBeDefined()
      expect(result.premium).toBeDefined()
      expect(result.standard.recommended).toBe(true)
      expect(result.breakdown).toBeDefined()
      expect(result.marketAnalysis).toBeDefined()
      expect(result.recommendations).toBeInstanceOf(Array)
    }, 30000)
  })

  describe('Stage Rider Generator', () => {
    it('should generate a technical rider', async () => {
      const input = {
        bandName: 'The Test Band',
        bandSize: 5,
        instruments: [
          { type: 'vocals', quantity: 2 },
          { type: 'guitar', quantity: 1 },
          { type: 'bass', quantity: 1 },
          { type: 'drums', quantity: 1 },
        ],
        venueType: 'club' as const,
        hasOwnPA: false,
        hasBackline: false,
        eventDuration: 180,
      }

      const result = await generateStageRider(input, {
        tenantId: 'test-tenant',
        contactInfo: {
          name: 'Test Manager',
          phone: '+420123456789',
          email: 'test@example.com',
        },
      })

      expect(result).toBeDefined()
      expect(result.bandName).toBe('The Test Band')
      expect(result.inputList).toBeInstanceOf(Array)
      expect(result.inputList.length).toBeGreaterThan(0)
      expect(result.monitors).toBeDefined()
      expect(result.backline).toBeInstanceOf(Array)
      expect(result.stage).toBeDefined()
      expect(result.soundSystem).toBeDefined()
      expect(result.timing).toBeDefined()
      expect(result.hospitality).toBeDefined()
    }, 30000)
  })
})
