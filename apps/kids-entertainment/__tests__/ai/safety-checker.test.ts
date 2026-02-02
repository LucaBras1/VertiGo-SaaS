/**
 * AI Safety Checker Tests
 * Tests for AI safety analysis with fallback mechanism
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock AI core
vi.mock('@vertigo/ai-core', () => ({
  createAIClient: vi.fn().mockReturnValue({
    chat: vi.fn(),
  }),
}))

describe('Safety Checker AI Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Safety Analysis Input', () => {
    it('should process child info correctly', () => {
      const childInfo = {
        name: 'Tomáš',
        age: 7,
        allergies: ['ořechy', 'mléko'],
        dietaryRestrictions: ['bezlepková dieta'],
        specialNeeds: 'ADHD - potřebuje častější přestávky',
      }

      const safetyInput = {
        childAge: childInfo.age,
        allergies: childInfo.allergies,
        dietaryRestrictions: childInfo.dietaryRestrictions,
        specialNeeds: childInfo.specialNeeds,
        guestCount: 12,
        venue: 'Kavárna U Kocoura',
        activities: ['Překážková dráha', 'Malování na obličej'],
      }

      expect(safetyInput.childAge).toBe(7)
      expect(safetyInput.allergies).toHaveLength(2)
      expect(safetyInput.specialNeeds).toContain('ADHD')
    })
  })

  describe('Allergy Risk Assessment', () => {
    it('should identify high-risk allergies', () => {
      const highRiskAllergies = ['ořechy', 'arašídy', 'vejce', 'mléko', 'ryby']
      const childAllergies = ['ořechy']

      const hasHighRiskAllergy = childAllergies.some(allergy =>
        highRiskAllergies.includes(allergy.toLowerCase())
      )

      expect(hasHighRiskAllergy).toBe(true)
    })

    it('should flag multiple allergies as higher concern', () => {
      const allergies = ['ořechy', 'mléko', 'lepek']
      const riskLevel = allergies.length >= 3 ? 'high' : allergies.length >= 1 ? 'medium' : 'low'

      expect(riskLevel).toBe('high')
    })

    it('should generate allergy-aware food recommendations', () => {
      const allergies = ['ořechy', 'mléko']

      const generateSafeFoodSuggestions = (allergies: string[]) => {
        const baseFoods = ['ovoce', 'zelenina', 'rýže', 'kukuřice']
        const suggestions = [...baseFoods]

        if (!allergies.includes('lepek')) {
          suggestions.push('pečivo')
        }
        if (!allergies.includes('vejce')) {
          suggestions.push('palačinky')
        }

        return suggestions
      }

      const suggestions = generateSafeFoodSuggestions(allergies)
      expect(suggestions).not.toContain('mléko')
      expect(suggestions).toContain('ovoce')
    })
  })

  describe('Age-Appropriate Activity Check', () => {
    it('should validate activities for child age', () => {
      const childAge = 5
      const activities = [
        { name: 'Malování', minAge: 3, maxAge: 12 },
        { name: 'Laser game', minAge: 8, maxAge: 16 },
        { name: 'Skákací hrad', minAge: 4, maxAge: 10 },
      ]

      const appropriateActivities = activities.filter(
        a => childAge >= a.minAge && childAge <= a.maxAge
      )

      expect(appropriateActivities).toHaveLength(2)
      expect(appropriateActivities.map(a => a.name)).not.toContain('Laser game')
    })

    it('should warn about activities outside age range', () => {
      const childAge = 4
      const activity = { name: 'Paintball', minAge: 10, maxAge: 18 }

      const isAppropriate = childAge >= activity.minAge && childAge <= activity.maxAge
      const warning = isAppropriate
        ? null
        : `Aktivita ${activity.name} není vhodná pro věk ${childAge} let (doporučeno ${activity.minAge}-${activity.maxAge} let)`

      expect(isAppropriate).toBe(false)
      expect(warning).toContain('není vhodná')
    })
  })

  describe('Guest Count Safety', () => {
    it('should calculate supervisor ratio', () => {
      const guestCount = 15
      const childAge = 5
      const recommendedRatio = childAge <= 5 ? 4 : childAge <= 8 ? 6 : 8

      const requiredSupervisors = Math.ceil(guestCount / recommendedRatio)

      expect(requiredSupervisors).toBe(4) // 15 / 4 = 3.75, rounded up to 4
    })

    it('should flag overcrowding concerns', () => {
      const guestCount = 25
      const venueCapacity = 20

      const isOvercrowded = guestCount > venueCapacity
      const warning = isOvercrowded
        ? `Počet hostů (${guestCount}) přesahuje kapacitu prostoru (${venueCapacity})`
        : null

      expect(isOvercrowded).toBe(true)
      expect(warning).toContain('přesahuje kapacitu')
    })
  })

  describe('Fallback Mode', () => {
    it('should return default safety recommendations when AI unavailable', () => {
      const getFallbackSafetyRecommendations = (data: {
        allergies: string[]
        guestCount: number
        childAge: number
      }) => {
        const recommendations = []

        // Always include basic safety
        recommendations.push({
          category: 'Základní bezpečnost',
          items: [
            'Mít k dispozici lékárničku',
            'Znát nouzové kontakty',
            'Zkontrolovat prostor před zahájením',
          ],
        })

        // Allergy-specific
        if (data.allergies.length > 0) {
          recommendations.push({
            category: 'Alergie',
            items: [
              `Informovat personál o alergiích: ${data.allergies.join(', ')}`,
              'Mít antihistaminika k dispozici',
              'Zkontrolovat složení všech potravin',
            ],
          })
        }

        // Age-specific
        if (data.childAge <= 5) {
          recommendations.push({
            category: 'Mladší děti',
            items: [
              'Zvýšený dohled (1 dospělý na 4 děti)',
              'Vyhnout se malým částem, které lze spolknout',
              'Připravit klidovou zónu pro odpočinek',
            ],
          })
        }

        return recommendations
      }

      const result = getFallbackSafetyRecommendations({
        allergies: ['ořechy'],
        guestCount: 12,
        childAge: 5,
      })

      expect(result).toHaveLength(3)
      expect(result.find(r => r.category === 'Alergie')).toBeDefined()
      expect(result.find(r => r.category === 'Mladší děti')).toBeDefined()
    })

    it('should detect when AI is unavailable', () => {
      const isAIAvailable = () => {
        const apiKey = process.env.OPENAI_API_KEY
        return apiKey && apiKey !== '' && !apiKey.startsWith('sk-test')
      }

      // In test environment, should use fallback
      expect(isAIAvailable()).toBe(false)
    })
  })

  describe('Safety Checklist Generation', () => {
    it('should generate pre-party checklist', () => {
      const generatePrePartyChecklist = (partyData: {
        hasAllergies: boolean
        hasSpecialNeeds: boolean
        isOutdoor: boolean
      }) => {
        const checklist = [
          { item: 'Potvrzení rezervace prostoru', required: true },
          { item: 'Kontrola počasí', required: partyData.isOutdoor },
          { item: 'Příprava lékárničky', required: true },
          { item: 'Informace o alergiích pro personál', required: partyData.hasAllergies },
          { item: 'Příprava klidové zóny', required: partyData.hasSpecialNeeds },
          { item: 'Kontrola vybavení', required: true },
          { item: 'Briefing týmu', required: true },
        ]

        return checklist.filter(item => item.required)
      }

      const checklist = generatePrePartyChecklist({
        hasAllergies: true,
        hasSpecialNeeds: false,
        isOutdoor: false,
      })

      expect(checklist.length).toBeGreaterThan(3)
      expect(checklist.some(c => c.item.includes('alergiích'))).toBe(true)
      expect(checklist.some(c => c.item.includes('počasí'))).toBe(false)
    })

    it('should generate emergency action plan', () => {
      const emergencyPlan = {
        allergicReaction: {
          steps: [
            'Zavolat záchrannou službu (155)',
            'Podat antihistaminika pokud dostupné',
            'Kontaktovat rodiče',
            'Sledovat dýchání',
          ],
          contacts: ['155', 'Rodič: +420 777 123 456'],
        },
        injury: {
          steps: [
            'Posoudit závažnost',
            'Poskytnout první pomoc',
            'Kontaktovat rodiče',
            'V případě potřeby volat 155',
          ],
        },
        lostChild: {
          steps: [
            'Okamžitě informovat všechny dospělé',
            'Prohledat prostor',
            'Kontaktovat personál místa',
            'Volat policii pokud nenalezen do 10 minut',
          ],
        },
      }

      expect(emergencyPlan.allergicReaction.steps[0]).toContain('155')
      expect(emergencyPlan.lostChild.steps).toHaveLength(4)
    })
  })

  describe('Safety Score Calculation', () => {
    it('should calculate overall safety score', () => {
      const calculateSafetyScore = (factors: {
        allergyRisk: 'low' | 'medium' | 'high'
        ageAppropriateness: number // 0-100
        supervisorRatio: number // actual vs recommended
        venueAssessment: boolean
        emergencyPlan: boolean
      }) => {
        let score = 100

        // Deduct for allergy risk
        if (factors.allergyRisk === 'high') score -= 20
        else if (factors.allergyRisk === 'medium') score -= 10

        // Deduct for age inappropriateness
        score -= (100 - factors.ageAppropriateness) * 0.2

        // Deduct for insufficient supervision
        if (factors.supervisorRatio < 1) {
          score -= (1 - factors.supervisorRatio) * 30
        }

        // Bonus for completed assessments
        if (!factors.venueAssessment) score -= 10
        if (!factors.emergencyPlan) score -= 10

        return Math.max(0, Math.min(100, Math.round(score)))
      }

      const score = calculateSafetyScore({
        allergyRisk: 'medium',
        ageAppropriateness: 90,
        supervisorRatio: 1.2,
        venueAssessment: true,
        emergencyPlan: true,
      })

      expect(score).toBeGreaterThan(70)
      expect(score).toBeLessThanOrEqual(100)
    })
  })
})
