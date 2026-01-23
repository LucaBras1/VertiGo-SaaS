/**
 * PartyPal TypeScript Types
 * Shared type definitions
 */

// Age Groups
export type AgeGroup = 'TODDLER_3_5' | 'KIDS_6_9' | 'TWEENS_10_12' | 'TEENS_13_PLUS'

// Safety Ratings
export type SafetyRating = 'VERY_SAFE' | 'SAFE' | 'REQUIRES_SUPERVISION' | 'ADULT_ONLY'

// Energy Levels
export type EnergyLevel = 'CALM' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'

// Package Category
export type PackageCategory = 'full_party' | 'entertainment' | 'workshop' | 'show'

// Activity Category
export type ActivityCategory =
  | 'skill_game'
  | 'creative'
  | 'active'
  | 'educational'
  | 'performance'

// Extra Category
export type ExtraCategory = 'costume' | 'decoration' | 'food' | 'photo' | 'other'

// Venue Type
export type VenueType = 'home' | 'venue' | 'outdoor'

// Party Status
export type PartyStatus = 'inquiry' | 'confirmed' | 'completed' | 'cancelled'

// Order Status
export type OrderStatus = 'new' | 'confirmed' | 'completed' | 'cancelled'

// Invoice Status
export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'DISPUTED'

// Message Types
export type MessageType = 'confirmation' | 'reminder' | 'update' | 'followup' | 'problem'

// Photo Moment Types
export type PhotoMomentType =
  | 'candid'
  | 'milestone'
  | 'group'
  | 'detail'
  | 'emotional'
  | 'activity'

// Risk Levels
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

// Budget Levels
export type BudgetLevel = 'economy' | 'standard' | 'premium'

// Package with Relations
export interface PackageWithRelations {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  subtitle?: string
  excerpt?: string
  description?: any
  ageGroupMin?: number
  ageGroupMax?: number
  ageGroups: string[]
  maxChildren?: number
  duration: number
  themeName?: string
  includesCharacter: boolean
  characterName?: string
  includesCake: boolean
  includesGoodybags: boolean
  includesDecoration: boolean
  includesPhotos: boolean
  safetyNotes?: string
  allergens: string[]
  indoorOutdoor?: string
  price?: number
  pricePerChild?: number
  featuredImageUrl: string
  featuredImageAlt: string
  galleryImages?: any
  videoUrl?: string
  activities?: ActivityWithRelations[]
  createdAt: Date
  updatedAt: Date
}

// Activity with Relations
export interface ActivityWithRelations {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  subtitle?: string
  excerpt?: string
  description?: any
  duration: number
  ageAppropriate: string[]
  minChildren?: number
  maxChildren?: number
  safetyRating: string
  safetyNotes?: string
  allergensInvolved: string[]
  choking_hazard: boolean
  energyLevel?: string
  indoorOutdoor?: string
  materials: string[]
  setupTime?: number
  skillsDeveloped: string[]
  educationalValue?: string
  price?: number
  featuredImageUrl: string
  featuredImageAlt: string
  galleryImages?: any
  createdAt: Date
  updatedAt: Date
}

// Party with Relations
export interface PartyWithRelations {
  id: string
  date: Date
  endDate?: Date
  venue: any
  childName?: string
  childAge?: number
  childBirthday?: Date
  childGender?: string
  childInterests: string[]
  guestCount?: number
  ageRange?: any
  theme?: string
  specialRequests?: string
  allergies: string[]
  dietaryRestrictions: string[]
  specialNeeds?: string
  emergencyContact?: any
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  status: string
  isPublic: boolean
  photoMoments?: any
  photosUrl?: string
  feedbackRating?: number
  feedbackComment?: string
  package?: PackageWithRelations
  activity?: ActivityWithRelations
  createdAt: Date
  updatedAt: Date
}

// Customer with Relations
export interface CustomerWithRelations {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  organization?: string
  organizationType?: string
  address?: any
  billingInfo?: any
  children?: any
  preferredThemes: string[]
  communicationPrefs?: any
  tags?: any
  notes?: string
  gdprConsent?: any
  totalPartiesBooked: number
  lastPartyDate?: Date
  lifetimeValue: number
  createdAt: Date
  updatedAt: Date
}

// Entertainer
export interface Entertainer {
  id: string
  firstName: string
  lastName: string
  stageName?: string
  role: string
  bio?: any
  photoUrl?: string
  photoAlt?: string
  email?: string
  phone?: string
  specializations: string[]
  ageGroups: string[]
  languages: string[]
  backgroundCheckDate?: Date
  backgroundCheckStatus?: string
  firstAidCertified: boolean
  firstAidExpiryDate?: Date
  insuranceNumber?: string
  insuranceExpiryDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// AI Response Types
export interface AgeOptimization {
  modifications: Array<{
    activityId: string
    suggestedChanges: string[]
    reasoning: string
  }>
  timingAdjustments: Array<{
    activityId: string
    originalDuration: number
    recommendedDuration: number
    reasoning: string
  }>
  safetyConsiderations: string[]
  engagementStrategies: string[]
  backupActivities: string[]
}

export interface SafetyCheck {
  overallRisk: RiskLevel
  activityRisks: Array<{
    activityId: string
    activityName: string
    physicalSafety: {
      risk: RiskLevel
      concerns: string[]
      mitigations: string[]
    }
    allergenConcerns: {
      risk: RiskLevel
      allergens: string[]
      mitigations: string[]
    }
    supervisionNeeded: boolean
    ageAppropriate: boolean
    recommendations: string[]
  }>
  generalRecommendations: string[]
  emergencyPreparations: string[]
}

export interface ThemeSuggestion {
  themeName: string
  tagline: string
  matchReasoning: string
  activities: string[]
  decorationIdeas: string[]
  characterSuggestions: string[]
  estimatedBudget: string
  complexity: 'simple' | 'moderate' | 'elaborate'
}

export interface PhotoMoment {
  time: string
  whatToCapture: string
  reasoning: string
  photoType: PhotoMomentType
  preparationTips: string[]
  priority: 'must-have' | 'nice-to-have' | 'optional'
  technicalNotes: string[]
}
