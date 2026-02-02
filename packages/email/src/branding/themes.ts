/**
 * @vertigo/email - Vertical Themes
 * Pre-defined branding configurations for each vertical
 */

import type { EmailBranding, VerticalType } from '../types'

/**
 * Fitness (FitAdmin) theme - Emerald
 */
export const fitnessTheme: EmailBranding = {
  appName: 'FitAdmin',
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  tagline: 'Professional Fitness Management',
  websiteUrl: 'https://fitadmin.app',
  fromEmail: 'FitAdmin <noreply@fitadmin.app>',
}

/**
 * Musicians (GigBook) theme - Blue
 */
export const musiciansTheme: EmailBranding = {
  appName: 'GigBook',
  primaryColor: '#2563eb',
  secondaryColor: '#1d4ed8',
  tagline: 'Správa koncertů pro muzikanty',
  websiteUrl: 'https://gigbook.app',
  fromEmail: 'GigBook <noreply@gigbook.app>',
}

/**
 * Photography (ShootFlow) theme - Amber
 */
export const photographyTheme: EmailBranding = {
  appName: 'ShootFlow',
  primaryColor: '#F59E0B',
  secondaryColor: '#D97706',
  tagline: 'Professional Photography Management',
  websiteUrl: 'https://shootflow.app',
  fromEmail: 'ShootFlow <noreply@shootflow.app>',
}

/**
 * Team Building (TeamForge) theme - Sky
 */
export const teamBuildingTheme: EmailBranding = {
  appName: 'TeamForge',
  primaryColor: '#0EA5E9',
  secondaryColor: '#0284C7',
  tagline: 'Corporate Team Building Solutions',
  websiteUrl: 'https://teamforge.app',
  fromEmail: 'TeamForge <noreply@teamforge.app>',
}

/**
 * Events (EventPro) theme - Purple
 */
export const eventsTheme: EmailBranding = {
  appName: 'EventPro',
  primaryColor: '#8B5CF6',
  secondaryColor: '#7C3AED',
  tagline: 'Professional Event Management',
  websiteUrl: 'https://eventpro.app',
  fromEmail: 'EventPro <noreply@eventpro.app>',
}

/**
 * Performing Arts (StageManager) theme - Red
 */
export const performingArtsTheme: EmailBranding = {
  appName: 'StageManager',
  primaryColor: '#DC2626',
  secondaryColor: '#B91C1C',
  tagline: 'Theatre & Performance Management',
  websiteUrl: 'https://stagemanager.app',
  fromEmail: 'StageManager <noreply@stagemanager.app>',
}

/**
 * Kids Entertainment (PartyPal) theme - Pink
 */
export const kidsEntertainmentTheme: EmailBranding = {
  appName: 'PartyPal',
  primaryColor: '#EC4899',
  secondaryColor: '#F472B6',
  tagline: 'Nezapomenutelné dětské oslavy',
  websiteUrl: 'https://partypal.cz',
  fromEmail: 'PartyPal <noreply@partypal.cz>',
}

/**
 * All vertical themes indexed by type
 */
export const verticalThemes: Record<VerticalType, EmailBranding> = {
  fitness: fitnessTheme,
  musicians: musiciansTheme,
  photography: photographyTheme,
  'team-building': teamBuildingTheme,
  events: eventsTheme,
  'performing-arts': performingArtsTheme,
  'kids-entertainment': kidsEntertainmentTheme,
}

/**
 * Get theme by vertical type
 */
export function getTheme(vertical: VerticalType): EmailBranding {
  return verticalThemes[vertical]
}
