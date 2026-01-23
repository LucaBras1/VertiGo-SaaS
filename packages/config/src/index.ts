// VertiGo SaaS - Shared Configuration
// Centralized configuration for all verticals

export type Vertical =
  | 'MUSICIANS'
  | 'PHOTOGRAPHY'
  | 'FITNESS'
  | 'EVENTS'
  | 'PERFORMING_ARTS'
  | 'TEAM_BUILDING'
  | 'KIDS_ENTERTAINMENT';

export type SubscriptionTier =
  | 'FREE'
  | 'STARTER'
  | 'PROFESSIONAL'
  | 'BUSINESS'
  | 'ENTERPRISE';

export interface VerticalConfig {
  id: Vertical;
  name: string;
  productName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  port: number;
  features: string[];
}

export const VERTICALS: Record<Vertical, VerticalConfig> = {
  MUSICIANS: {
    id: 'MUSICIANS',
    name: 'Musicians',
    productName: 'GigBook',
    tagline: 'Booking management for musicians, bands, and DJs',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    port: 3002,
    features: ['setlist-ai', 'stage-rider-ai', 'gig-price-ai'],
  },
  PHOTOGRAPHY: {
    id: 'PHOTOGRAPHY',
    name: 'Photography',
    productName: 'ShootFlow',
    tagline: 'Workflow management for photographers',
    primaryColor: '#F59E0B',
    secondaryColor: '#374151',
    port: 3003,
    features: ['shot-list-ai', 'gallery-curator-ai', 'style-matcher-ai', 'edit-time-predictor-ai'],
  },
  FITNESS: {
    id: 'FITNESS',
    name: 'Fitness',
    productName: 'FitAdmin',
    tagline: 'Client management for personal trainers',
    primaryColor: '#10B981',
    secondaryColor: '#1E293B',
    port: 3004,
    features: ['workout-ai', 'progress-predictor-ai', 'nutrition-advisor-ai', 'churn-detector-ai'],
  },
  EVENTS: {
    id: 'EVENTS',
    name: 'Events',
    productName: 'EventPro',
    tagline: 'Management for event entertainment providers',
    primaryColor: '#7C3AED',
    secondaryColor: '#F97316',
    port: 3005,
    features: ['timeline-optimizer-ai', 'budget-optimizer-ai', 'guest-experience-ai'],
  },
  PERFORMING_ARTS: {
    id: 'PERFORMING_ARTS',
    name: 'Performing Arts',
    productName: 'StageManager',
    tagline: 'Production management for theaters and performers',
    primaryColor: '#991B1B',
    secondaryColor: '#F59E0B',
    port: 3006,
    features: ['cast-scheduler-ai', 'tech-requirements-ai'],
  },
  TEAM_BUILDING: {
    id: 'TEAM_BUILDING',
    name: 'Team Building',
    productName: 'TeamForge',
    tagline: 'Corporate team building activity management',
    primaryColor: '#0EA5E9',
    secondaryColor: '#F97316',
    port: 3007,
    features: ['team-dynamics-ai', 'objective-matcher-ai', 'difficulty-calibrator-ai', 'debrief-generator-ai'],
  },
  KIDS_ENTERTAINMENT: {
    id: 'KIDS_ENTERTAINMENT',
    name: 'Kids Entertainment',
    productName: 'PartyPal',
    tagline: 'Party and event management for kids entertainers',
    primaryColor: '#F472B6',
    secondaryColor: '#60A5FA',
    port: 3008,
    features: ['age-optimizer-ai', 'safety-checker-ai', 'theme-suggester-ai', 'parent-communication-ai'],
  },
};

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, {
  name: string;
  price: number;
  aiCredits: number;
  features: string[];
}> = {
  FREE: {
    name: 'Free',
    price: 0,
    aiCredits: 100,
    features: ['Basic booking', 'Calendar view', '5 AI requests/month'],
  },
  STARTER: {
    name: 'Starter',
    price: 19,
    aiCredits: 500,
    features: ['Unlimited bookings', 'Client management', '50 AI requests/month', 'Email notifications'],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 49,
    aiCredits: 2000,
    features: ['All Starter features', 'Invoicing', '200 AI requests/month', 'Custom branding'],
  },
  BUSINESS: {
    name: 'Business',
    price: 99,
    aiCredits: 5000,
    features: ['All Professional features', 'Team members', '500 AI requests/month', 'API access'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 299,
    aiCredits: 20000,
    features: ['All Business features', 'Unlimited AI', 'Custom domain', 'Priority support', 'SLA'],
  },
};

export function getVerticalConfig(vertical: Vertical): VerticalConfig {
  return VERTICALS[vertical];
}

export function getSubscriptionTier(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier];
}

// Utility function for class names
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
