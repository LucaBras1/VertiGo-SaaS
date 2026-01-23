/**
 * Database utility functions for VertiGo SaaS
 */

import type { Vertical } from '@prisma/client';

/**
 * Entity naming per vertical
 * Maps generic entity names to vertical-specific names
 */
export const entityNames: Record<
  Vertical,
  {
    performance: string;
    performancePlural: string;
    activity: string;
    activityPlural: string;
    service: string;
    servicePlural: string;
    event: string;
    eventPlural: string;
    customer: string;
    customerPlural: string;
  }
> = {
  MUSICIANS: {
    performance: 'Gig',
    performancePlural: 'Gigs',
    activity: 'Setlist',
    activityPlural: 'Setlists',
    service: 'Extra',
    servicePlural: 'Extras',
    event: 'Gig',
    eventPlural: 'Gigs',
    customer: 'Client',
    customerPlural: 'Clients',
  },
  PHOTOGRAPHY: {
    performance: 'Package',
    performancePlural: 'Packages',
    activity: 'Addon',
    activityPlural: 'Addons',
    service: 'Extra',
    servicePlural: 'Extras',
    event: 'Shoot',
    eventPlural: 'Shoots',
    customer: 'Client',
    customerPlural: 'Clients',
  },
  FITNESS: {
    performance: 'Session',
    performancePlural: 'Sessions',
    activity: 'Class',
    activityPlural: 'Classes',
    service: 'Package',
    servicePlural: 'Packages',
    event: 'Appointment',
    eventPlural: 'Appointments',
    customer: 'Client',
    customerPlural: 'Clients',
  },
  EVENTS: {
    performance: 'Show',
    performancePlural: 'Shows',
    activity: 'Activity',
    activityPlural: 'Activities',
    service: 'Extra',
    servicePlural: 'Extras',
    event: 'Gig',
    eventPlural: 'Gigs',
    customer: 'Client',
    customerPlural: 'Clients',
  },
  PERFORMING_ARTS: {
    performance: 'Production',
    performancePlural: 'Productions',
    activity: 'Workshop',
    activityPlural: 'Workshops',
    service: 'Service',
    servicePlural: 'Services',
    event: 'Show',
    eventPlural: 'Shows',
    customer: 'Venue',
    customerPlural: 'Venues',
  },
  TEAM_BUILDING: {
    performance: 'Program',
    performancePlural: 'Programs',
    activity: 'Activity',
    activityPlural: 'Activities',
    service: 'Extra',
    servicePlural: 'Extras',
    event: 'Session',
    eventPlural: 'Sessions',
    customer: 'Company',
    customerPlural: 'Companies',
  },
  KIDS_ENTERTAINMENT: {
    performance: 'Package',
    performancePlural: 'Packages',
    activity: 'Activity',
    activityPlural: 'Activities',
    service: 'Extra',
    servicePlural: 'Extras',
    event: 'Party',
    eventPlural: 'Parties',
    customer: 'Parent',
    customerPlural: 'Parents',
  },
};

/**
 * Get entity name for a specific vertical
 */
export function getEntityName(
  vertical: Vertical,
  entity: keyof (typeof entityNames)[Vertical],
  plural = false
): string {
  const names = entityNames[vertical];
  if (plural) {
    const pluralKey = `${entity}Plural` as keyof typeof names;
    return names[pluralKey] || names[entity];
  }
  return names[entity];
}

/**
 * Generate next order number for a tenant
 */
export function generateOrderNumber(
  vertical: Vertical,
  sequence: number
): string {
  const prefixes: Record<Vertical, string> = {
    MUSICIANS: 'GB',
    PHOTOGRAPHY: 'SF',
    FITNESS: 'FA',
    EVENTS: 'EP',
    PERFORMING_ARTS: 'SM',
    TEAM_BUILDING: 'TF',
    KIDS_ENTERTAINMENT: 'PP',
  };

  const year = new Date().getFullYear().toString().slice(-2);
  const paddedSequence = sequence.toString().padStart(5, '0');

  return `${prefixes[vertical]}-${year}-${paddedSequence}`;
}

/**
 * Generate next invoice number for a tenant
 */
export function generateInvoiceNumber(
  vertical: Vertical,
  sequence: number
): string {
  const prefixes: Record<Vertical, string> = {
    MUSICIANS: 'INV-GB',
    PHOTOGRAPHY: 'INV-SF',
    FITNESS: 'INV-FA',
    EVENTS: 'INV-EP',
    PERFORMING_ARTS: 'INV-SM',
    TEAM_BUILDING: 'INV-TF',
    KIDS_ENTERTAINMENT: 'INV-PP',
  };

  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(5, '0');

  return `${prefixes[vertical]}-${year}-${paddedSequence}`;
}

/**
 * Vertical metadata
 */
export const verticalMeta: Record<
  Vertical,
  {
    name: string;
    productName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    icon: string;
  }
> = {
  MUSICIANS: {
    name: 'Musicians',
    productName: 'GigBook',
    tagline: 'AI-powered booking for musicians',
    primaryColor: '#7C3AED',
    secondaryColor: '#3B82F6',
    icon: 'music',
  },
  PHOTOGRAPHY: {
    name: 'Photography',
    productName: 'ShootFlow',
    tagline: 'AI assistant for photographers',
    primaryColor: '#F59E0B',
    secondaryColor: '#374151',
    icon: 'camera',
  },
  FITNESS: {
    name: 'Fitness',
    productName: 'FitAdmin',
    tagline: 'Smart management for fitness pros',
    primaryColor: '#10B981',
    secondaryColor: '#1E293B',
    icon: 'dumbbell',
  },
  EVENTS: {
    name: 'Events',
    productName: 'EventPro',
    tagline: 'Event entertainment, simplified',
    primaryColor: '#EF4444',
    secondaryColor: '#EAB308',
    icon: 'sparkles',
  },
  PERFORMING_ARTS: {
    name: 'Performing Arts',
    productName: 'StageManager',
    tagline: 'Manage your art, not paperwork',
    primaryColor: '#DC2626',
    secondaryColor: '#7C3AED',
    icon: 'theater-masks',
  },
  TEAM_BUILDING: {
    name: 'Team Building',
    productName: 'TeamForge',
    tagline: 'Build stronger teams with AI',
    primaryColor: '#2563EB',
    secondaryColor: '#059669',
    icon: 'users',
  },
  KIDS_ENTERTAINMENT: {
    name: 'Kids Entertainment',
    productName: 'PartyPal',
    tagline: 'Magical moments, zero stress',
    primaryColor: '#EC4899',
    secondaryColor: '#FACC15',
    icon: 'balloon',
  },
};

/**
 * Get vertical from product name
 */
export function getVerticalFromProductName(
  productName: string
): Vertical | null {
  const entry = Object.entries(verticalMeta).find(
    ([, meta]) => meta.productName.toLowerCase() === productName.toLowerCase()
  );
  return entry ? (entry[0] as Vertical) : null;
}
