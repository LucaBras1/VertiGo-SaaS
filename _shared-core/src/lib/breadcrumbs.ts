/**
 * Breadcrumbs Configuration
 *
 * Mappings pro auto-generation breadcrumbs z pathname
 */

export interface BreadcrumbSegment {
  label: string
  href: string
}

/**
 * Entity name mappings (z URL segmentu na český název)
 */
export const ENTITY_NAMES: Record<string, string> = {
  // Produkce
  'performances': 'Inscenace',
  'games': 'Hry',
  'services': 'Služby',
  'events': 'Akce',

  // Obchod
  'orders': 'Objednávky',
  'customers': 'Zákazníci',
  'invoices': 'Faktury',

  // Obsah
  'posts': 'Aktuality',
  'pages': 'Stránky',
  'team': 'Tým',

  // Správa
  'settings': 'Nastavení',

  // Akce
  'new': 'Nová',
  'edit': 'Upravit'
}

/**
 * Section mappings (kategorie)
 */
export const SECTION_NAMES: Record<string, string> = {
  'performances': 'Produkce',
  'games': 'Produkce',
  'services': 'Produkce',
  'events': 'Produkce',
  'orders': 'Obchod',
  'customers': 'Obchod',
  'invoices': 'Obchod',
  'posts': 'Obsah',
  'pages': 'Obsah',
  'team': 'Obsah',
  'settings': 'Správa'
}

/**
 * Generuje breadcrumbs z pathname
 */
export function generateBreadcrumbs(pathname: string, entityTitle?: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbSegment[] = []

  // Vždy začínáme s Admin
  breadcrumbs.push({
    label: 'Admin',
    href: '/admin'
  })

  // Zpracujeme cestu po segmentech
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    // Skip 'admin' protože už máme v breadcrumbs
    if (segment === 'admin') {
      currentPath += '/admin'
      continue
    }

    currentPath += `/${segment}`

    // Je to UUID/ID? (dynamický segment)
    const isId = /^[a-f0-9-]{20,}$/i.test(segment) || /^[0-9]+$/.test(segment)

    if (isId) {
      // Pro detail/edit stránky - použij entity title pokud je k dispozici
      if (entityTitle) {
        breadcrumbs.push({
          label: entityTitle,
          href: currentPath
        })
      } else {
        // Fallback - použij "Detail" nebo číslo
        breadcrumbs.push({
          label: `Detail`,
          href: currentPath
        })
      }
    } else {
      // Normální segment - najdi mapping
      const label = ENTITY_NAMES[segment] || segment
      breadcrumbs.push({
        label,
        href: currentPath
      })
    }
  }

  return breadcrumbs
}

/**
 * Pomocná funkce - zkrátí dlouhý title pro breadcrumb
 */
export function truncateBreadcrumbTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title
  return title.slice(0, maxLength) + '...'
}
