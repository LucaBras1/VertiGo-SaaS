// Temporary types until Prisma generates them

export type UserRole = 'ADMIN' | 'DIRECTOR' | 'STAGE_MANAGER' | 'CREW' | 'PERFORMER'

export type ProductionType =
  | 'THEATER'
  | 'DANCE'
  | 'CIRCUS'
  | 'MUSICAL'
  | 'OPERA'
  | 'COMEDY'
  | 'VARIETY'
  | 'KIDS_SHOW'
  | 'CONCERT'
  | 'OTHER'

export type ProductionStatus =
  | 'PLANNING'
  | 'PRE_PRODUCTION'
  | 'REHEARSING'
  | 'TECH_WEEK'
  | 'RUNNING'
  | 'CLOSED'
  | 'ARCHIVED'

export type RehearsalType =
  | 'READ_THROUGH'
  | 'BLOCKING'
  | 'SCENE_WORK'
  | 'RUN_THROUGH'
  | 'TECH'
  | 'DRESS'
  | 'PREVIEW'
  | 'NOTES'
  | 'OTHER'

export interface Production {
  id: string
  tenantId: string
  name: string
  type: ProductionType | string
  status: ProductionStatus | string
  synopsis: string | null
  tagline: string | null
  duration: number | null
  hasIntermission: boolean
  intermissionLength: number | null
  openingDate: Date | null
  closingDate: Date | null
  director: string | null
  playwright: string | null
  choreographer: string | null
  musicalDirector: string | null
  setDesigner: string | null
  costumeDesigner: string | null
  lightingDesigner: string | null
  soundDesigner: string | null
  posterUrl: string | null
  images: string[]
  notes: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    performances: number
    castMembers: number
    crewMembers: number
    rehearsals: number
    scenes?: number
  }
}

export interface Rehearsal {
  id: string
  productionId: string
  venueId: string | null
  date: Date
  startTime: Date
  endTime: Date
  type: RehearsalType
  title: string | null
  scenes: string[]
  focus: string | null
  objectives: string[]
  callList: string[]
  isCancelled: boolean
  cancelReason: string | null
  location: string | null
  createdAt: Date
  updatedAt: Date
  production?: {
    id: string
    name: string
  }
  venue?: {
    id: string
    name: string
  } | null
}

export interface Venue {
  id: string
  tenantId: string
  name: string
  type: string
  address: string | null
  city: string | null
  country: string | null
  website: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  seatingCapacity: number | null
  stageWidth: number | null
  stageDepth: number | null
  stageHeight: number | null
  flySystem: boolean
  dressingRooms: number
  loadInAccess: string | null
  parkingSpaces: number | null
  greenRoom: boolean
  hasSound: boolean
  hasLighting: boolean
  hasPiano: boolean
  notes: string | null
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    performances: number
    rehearsals: number
  }
}

export interface TechRider {
  id: string
  productionId: string
  version: string
  stageMinWidth: number | null
  stageMinDepth: number | null
  stageMinHeight: number | null
  stageSurface: string | null
  stageMasking: string | null
  soundNotes: string | null
  microphoneCount: number | null
  monitorCount: number | null
  playbackNeeded: boolean
  soundOperator: boolean
  lightingNotes: string | null
  followSpotNeeded: boolean
  followSpotCount: number | null
  dmxChannels: number | null
  hazerNeeded: boolean
  riggingNotes: string | null
  riggingPoints: number | null
  totalRigWeight: number | null
  backline: unknown | null
  dressingRooms: number | null
  quickChangeAreas: number | null
  wardrobe: string | null
  loadInHours: number | null
  loadInAccess: string | null
  crewNeeded: number | null
  scheduleTemplate: unknown | null
  hospitalityNotes: string | null
  mealCount: number | null
  parkingNeeded: number | null
  safetyNotes: string | null
  specialEffects: string[]
  generatedRider: unknown | null
  pdfUrl: string | null
  createdAt: Date
  updatedAt: Date
  production?: {
    id: string
    name: string
    type: ProductionType
    status: ProductionStatus
  }
}

export interface CastMember {
  id: string
  productionId: string
  userId: string | null
  characterName: string
  role: string
  performerName: string | null
  performerEmail: string | null
  performerPhone: string | null
  contractStart: Date | null
  contractEnd: Date | null
  compensation: number | null
  notes: string | null
  isUnderstudy: boolean
  understudyFor: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CrewMember {
  id: string
  productionId: string
  userId: string | null
  department: string
  position: string
  crewName: string | null
  crewEmail: string | null
  crewPhone: string | null
  contractStart: Date | null
  contractEnd: Date | null
  compensation: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// Extended production type with relations for detail page
export interface ProductionWithDetails extends Production {
  rehearsals: Rehearsal[]
  castMembers: CastMember[]
  crewMembers: CrewMember[]
  performances: Performance[]
  techRider: TechRider | null
}

export interface Performance {
  id: string
  productionId: string
  venueId: string | null
  date: Date
  callTime: Date | null
  startTime: Date
  endTime: Date | null
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  type: 'MATINEE' | 'EVENING' | 'PREVIEW' | 'OPENING' | 'CLOSING' | 'SPECIAL'
  notes: string | null
  createdAt: Date
  updatedAt: Date
}
