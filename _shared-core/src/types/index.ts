// Public-facing type definitions
// These types match the Prisma schema structure

export interface Performance {
  id: string
  title: string
  slug: string
  category: 'theatre' | 'stilts' | 'music' | 'special'
  status: 'active' | 'archived' | 'draft'
  subtitle?: string | null
  excerpt?: string | null
  description?: any // JSON field - can be Portable Text
  duration: number
  ageRange?: {
    from?: number
    to?: number
  } | null
  technicalRequirements?: {
    space?: string
    water?: number
    electricity?: number
    other?: string
  } | null
  crew?: Array<{
    role: string
    name: string
  }> | null
  premiere?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }> | null
  videoUrl?: string | null
  references?: Array<{
    quote: string
    author: string
    organization?: string
    date?: string
  }> | null
  featured: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  date: Date
  endDate?: Date | null
  venue: {
    name: string
    city: string
    address?: string
  } | null
  status: 'confirmed' | 'tentative' | 'cancelled'
  ticketUrl?: string | null
  performance?: {
    id: string
    title: string
    slug: string
    category: string
    featuredImageUrl?: string | null
  } | null
  isPublic: boolean
}

export interface Game {
  id: string
  title: string
  slug: string
  category: 'adventure' | 'skill' | 'physical' | 'creative'
  status: 'active' | 'archived' | 'draft'
  featured: boolean
  order: number
  excerpt?: string | null
  description?: any // JSON field - can be Portable Text
  ageRange?: {
    from?: number
    to?: number
  } | null
  minPlayers?: number | null
  maxPlayers?: number | null
  duration?: number | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }> | null
  videoUrl?: string | null
  technicalRequirements?: Array<{
    requirement: string
    value: string
  }> | null
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
}

export interface Service {
  id: string
  title: string
  slug: string
  category: string
  status: 'active' | 'archived' | 'draft'
  order: number
  excerpt?: string | null
  description?: any // JSON field - can be Portable Text
  priceFrom?: number | null
  priceUnit?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }> | null
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
}

export interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  publishedAt?: Date | null
  excerpt?: string | null
  content?: any // JSON field - Portable Text or Tiptap
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  tags?: string[] | null
  author?: string | null
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  } | null
}

export interface TeamMember {
  id: string
  firstName: string
  lastName: string
  role: string
  order: number
  isActive: boolean
  photoUrl?: string | null
  photoAlt?: string | null
  bio?: any | null // JSON field
  email?: string | null
  phone?: string | null
}
