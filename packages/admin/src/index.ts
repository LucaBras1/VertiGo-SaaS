/**
 * @vertigo/admin
 * Shared admin layout and components for VertiGo SaaS platform.
 *
 * Provides a unified admin panel experience across all 7 verticals
 * with configurable branding, navigation, and command palette.
 */

// --- Types ---
export type {
  NavItem,
  NavSection,
  NavEntry,
  CommandItem,
  AdminConfig,
} from './types'
export { isNavSection } from './types'

// --- Layout Components ---
export {
  AdminLayoutClient,
  AdminSidebar,
  AdminTopbar,
  Breadcrumbs,
  CommandPalette,
  SidebarNavItem,
  ThemeToggle,
  UserMenu,
} from './layout'

// --- Shared Components ---
export {
  ListPageHeader,
  StatusBadge,
  SearchFilterBar,
  ActionButtons,
  FormSection,
  FormField,
  Select,
  Textarea,
  CheckboxGroup,
} from './shared'

// --- Providers ---
export { ThemeProvider, useTheme } from './providers'

// --- Hooks ---
export { useSidebarState } from './hooks'

// --- Lib ---
export { chartTheme } from './lib'

// --- Utils ---
export { cn } from './utils'
