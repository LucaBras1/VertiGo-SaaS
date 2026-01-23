/**
 * Vertical-specific type definitions for VertiGo SaaS
 * These types define the structure of verticalData JSON fields
 */

import type { Vertical } from '@prisma/client';

// ============================================================================
// MUSICIANS (GigBook)
// ============================================================================

export interface MusicianPerformanceData {
  setlistSongs?: string[];
  stageRider?: StageRider;
  bandMembers?: number;
  instruments?: string[];
  genres?: string[];
  repertoireSize?: number;
}

export interface StageRider {
  soundRequirements?: string[];
  monitoringNeeds?: string[];
  lightingNeeds?: string[];
  backlineProvided?: string[];
  backlineNeeded?: string[];
  stageSize?: { width: number; depth: number };
}

export interface MusicianEventData {
  loadInTime?: string;
  soundcheckTime?: string;
  setTimes?: { start: string; end: string }[];
  greenRoomRequired?: boolean;
  mealProvided?: boolean;
}

// ============================================================================
// PHOTOGRAPHY (ShootFlow)
// ============================================================================

export interface PhotographyPerformanceData {
  shotCount?: number;
  deliveryDays?: number;
  editingHours?: number;
  styleTags?: string[];
  equipment?: string[];
  secondShooter?: boolean;
  droneIncluded?: boolean;
}

export interface PhotographyEventData {
  timeline?: TimelineItem[];
  locations?: Location[];
  contactPerson?: { name: string; phone: string };
  shotListGenerated?: boolean;
}

export interface TimelineItem {
  time: string;
  description: string;
  location?: string;
  notes?: string;
}

export interface Location {
  name: string;
  address?: string;
  accessNotes?: string;
}

// ============================================================================
// FITNESS (FitAdmin)
// ============================================================================

export interface FitnessCustomerData {
  goals?: string[];
  currentWeight?: number;
  targetWeight?: number;
  measurements?: Measurements;
  bodyFatPercent?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  injuryHistory?: string;
  dietaryNotes?: string;
  medicalNotes?: string;
  creditsRemaining?: number;
  membershipType?: string;
  membershipExpiry?: string;
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  weight?: number;
  date?: string;
}

export interface FitnessPerformanceData {
  workoutPlan?: WorkoutPlan;
  muscleGroups?: string[];
  difficulty?: number;
  caloriesBurned?: number;
}

export interface WorkoutPlan {
  warmup?: Exercise[];
  mainWorkout?: Exercise[];
  cooldown?: Exercise[];
  notes?: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  restSeconds?: number;
  weight?: string;
  notes?: string;
}

// ============================================================================
// EVENTS (EventPro)
// ============================================================================

export interface EventPerformanceData {
  performanceType?: string; // fire, magic, circus, stilts
  safetyRequirements?: SafetyRequirement[];
  setupTime?: number;
  breakdownTime?: number;
  technicalNeeds?: string[];
  insuranceCert?: string;
  performerCount?: number;
}

export interface SafetyRequirement {
  item: string;
  description: string;
  mandatory: boolean;
}

export interface EventEventData {
  weatherBackup?: string;
  vendorContacts?: VendorContact[];
  timeline?: TimelineItem[];
  guestCount?: number;
}

export interface VendorContact {
  name: string;
  company: string;
  role: string;
  phone: string;
  email?: string;
}

// ============================================================================
// PERFORMING ARTS (StageManager)
// ============================================================================

export interface PerformingArtsPerformanceData {
  genre?: string[];
  ageRecommendation?: string;
  duration?: number;
  intermission?: boolean;
  castSize?: number;
  crewNeeded?: number;
  stageRequirements?: StageRequirements;
  educationalThemes?: string[];
  premiereDate?: string;
  tourDates?: TourDate[];
}

export interface StageRequirements {
  minWidth?: number;
  minDepth?: number;
  minHeight?: number;
  blackout?: boolean;
  flySystem?: boolean;
  specialRequirements?: string[];
}

export interface TourDate {
  date: string;
  venue: string;
  city: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface PerformingArtsEventData {
  techCallTime?: string;
  houseOpen?: string;
  intermissionLength?: number;
  expectedAudience?: number;
}

// ============================================================================
// TEAM BUILDING (TeamForge)
// ============================================================================

export interface TeamBuildingPerformanceData {
  minParticipants?: number;
  maxParticipants?: number;
  objectives?: string[];
  industryType?: string;
  physicalLevel?: 'low' | 'medium' | 'high';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  duration?: number;
  includesCatering?: boolean;
  debriefIncluded?: boolean;
}

export interface TeamBuildingActivityData {
  learningOutcomes?: string[];
  materialsNeeded?: string[];
  facilitatorGuide?: FacilitatorGuide;
  physicalDemand?: 'low' | 'medium' | 'high';
}

export interface FacilitatorGuide {
  introduction?: string;
  instructions?: string[];
  debriefQuestions?: string[];
  variations?: string[];
}

export interface TeamBuildingEventData {
  teamSize?: number;
  teamComposition?: string;
  briefingTime?: string;
  debriefTime?: string;
  hrContact?: { name: string; email: string; phone: string };
}

// ============================================================================
// KIDS ENTERTAINMENT (PartyPal)
// ============================================================================

export interface KidsPerformanceData {
  ageGroupMin?: number;
  ageGroupMax?: number;
  maxChildren?: number;
  themeName?: string;
  includesCharacter?: boolean;
  characterName?: string;
  duration?: number;
  includesCake?: boolean;
  includesGoodybags?: boolean;
}

export interface KidsActivityData {
  ageAppropriate?: string[];
  safetyNotes?: string;
  allergensInvolved?: string[];
  indoorOutdoor?: 'indoor' | 'outdoor' | 'both';
  energyLevel?: 'calm' | 'moderate' | 'high';
  materials?: string[];
}

export interface KidsEventData {
  childName?: string;
  childAge?: number;
  childInterests?: string[];
  allergies?: string[];
  parentPhone?: string;
  guestCount?: number;
  venue?: 'home' | 'venue' | 'outdoor';
  specialRequests?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type VerticalPerformanceData =
  | MusicianPerformanceData
  | PhotographyPerformanceData
  | FitnessPerformanceData
  | EventPerformanceData
  | PerformingArtsPerformanceData
  | TeamBuildingPerformanceData
  | KidsPerformanceData;

export type VerticalEventData =
  | MusicianEventData
  | PhotographyEventData
  | EventEventData
  | PerformingArtsEventData
  | TeamBuildingEventData
  | KidsEventData;

export type VerticalCustomerData = FitnessCustomerData;

// Helper to get the correct type based on vertical
export function getVerticalPerformanceType(vertical: Vertical) {
  const typeMap: Record<Vertical, string> = {
    MUSICIANS: 'MusicianPerformanceData',
    PHOTOGRAPHY: 'PhotographyPerformanceData',
    FITNESS: 'FitnessPerformanceData',
    EVENTS: 'EventPerformanceData',
    PERFORMING_ARTS: 'PerformingArtsPerformanceData',
    TEAM_BUILDING: 'TeamBuildingPerformanceData',
    KIDS_ENTERTAINMENT: 'KidsPerformanceData',
  };
  return typeMap[vertical];
}
