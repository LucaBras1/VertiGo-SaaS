import {
  LayoutDashboard,
  CalendarDays,
  Music,
  Building2,
  Users,
  Settings,
  Plus,
} from 'lucide-react'
import type { AdminConfig } from '@vertigo/admin'

export const eventsAdminConfig: AdminConfig = {
  vertical: 'EVENTS',
  productName: 'EventPro',
  productIcon: CalendarDays,
  gradient: 'from-violet-500 to-purple-600',
  basePath: '/admin',
  storageKeyPrefix: 'eventpro',
  breadcrumbLabels: {
    admin: 'Dashboard',
    events: 'Events',
    performers: 'Performers',
    venues: 'Venues',
    clients: 'Clients',
    settings: 'Settings',
    new: 'New',
  },
  navigation: [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: CalendarDays },
    { name: 'Performers', href: '/admin/performers', icon: Music },
    { name: 'Venues', href: '/admin/venues', icon: Building2 },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  commandGroups: ['Pages', 'Actions'],
  commands: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin', group: 'Pages' },
    { id: 'events', label: 'Events', icon: CalendarDays, href: '/admin/events', group: 'Pages' },
    { id: 'performers', label: 'Performers', icon: Music, href: '/admin/performers', group: 'Pages' },
    { id: 'venues', label: 'Venues', icon: Building2, href: '/admin/venues', group: 'Pages' },
    { id: 'clients', label: 'Clients', icon: Users, href: '/admin/clients', group: 'Pages' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings', group: 'Pages' },
    { id: 'new-event', label: 'Create Event', icon: Plus, href: '/admin/events/new', group: 'Actions', keywords: ['new', 'add'] },
    { id: 'new-performer', label: 'Add Performer', icon: Plus, href: '/admin/performers/new', group: 'Actions', keywords: ['new', 'add'] },
    { id: 'new-venue', label: 'Add Venue', icon: Plus, href: '/admin/venues/new', group: 'Actions', keywords: ['new', 'add'] },
    { id: 'new-client', label: 'Add Client', icon: Plus, href: '/admin/clients/new', group: 'Actions', keywords: ['new', 'add'] },
  ],
}
