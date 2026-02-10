import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  name: string
  icon: LucideIcon
  children: NavItem[]
}

export type NavEntry = NavItem | NavSection

export function isNavSection(entry: NavEntry): entry is NavSection {
  return 'children' in entry
}

export interface CommandItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  group: string
  keywords?: string[]
}

export interface AdminConfig {
  vertical: string
  productName: string
  productIcon: LucideIcon
  gradient: string
  basePath: string
  navigation: NavEntry[]
  commands: CommandItem[]
  commandGroups?: string[]
  breadcrumbLabels?: Record<string, string>
  storageKeyPrefix: string
}
