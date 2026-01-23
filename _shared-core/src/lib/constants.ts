/**
 * Site-wide constants
 */

export const SITE_NAME = 'Divadlo Studna'
export const SITE_DESCRIPTION = 'Soukromé divadlo fungující od roku 1993 se sídlem v Hosíně u Českých Budějovic'

export const CONTACT_INFO = {
  address: 'Zborov 15, 370 06 Ledenice',
  ico: '07863390',
  emails: {
    production: 'produkce@divadlo-studna.cz',
    director: 'pepino@divadlo-studna.cz',
    personal: 'divstudna@gmail.com',
  },
  phones: {
    production: '+420 773 916 665',
    director: '+420 777 166 655',
    personal: '+420 602 166 655',
  },
}

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/divadlostudna',
  facebook: 'https://facebook.com/divadlostudna',
  youtube: '',
}

export const MAIN_MENU = [
  { label: 'Program', href: '/program' },
  {
    label: 'Repertoár',
    href: '/repertoar',
    submenu: [
      { label: 'Všechna představení', href: '/repertoar' },
      { label: '🎭 Divadelní představení', href: '/repertoar?category=theatre' },
      { label: '🚶 Chůdová představení', href: '/repertoar?category=stilts' },
      { label: '🎵 Hudební produkce', href: '/repertoar?category=music' },
      { label: 'divider' },
      { label: '📦 Již nehrajeme', href: '/archiv' },
    ]
  },
  {
    label: 'Doprovodný program',
    href: '/hry',
    submenu: [
      { label: 'Vše', href: '/hry' },
      { label: '🎯 Interaktivní hry', href: '/hry#hry' },
      { label: 'divider' },
      { label: '🚲 Jednokolkový trenažér', href: '/hry/jednokolkovy-trenazer' },
      { label: '🎭 Divadelní ateliér', href: '/hry/divadelni-atelier' },
      { label: '🎨 Divadelní dílna', href: '/hry/divadelni-dilna' },
      { label: '✉️ Andělská pošta', href: '/hry/andelska-posta' },
    ]
  },
  {
    label: 'O nás',
    href: '/soubor',
    submenu: [
      { label: '👥 Náš soubor', href: '/soubor' },
      { label: '📖 Náš příběh', href: '/nas-pribeh' },
    ]
  },
  { label: 'Pro pořadatele', href: '/pro-poradatele' },
  { label: 'Aktuality', href: '/aktuality' },
  { label: 'Kontakt', href: '/kontakt' },
] as const

export const PERFORMANCE_CATEGORIES = {
  theatre: '🎭 Divadelní představení',
  stilts: '🚶 Chůdové představení',
  music: '🎵 Hudební produkce',
  special: '🎪 Speciální služby',
} as const

export const GAME_CATEGORIES = {
  adventure: '🏰 Dobrodružné hry',
  skill: '🎯 Dovednostní hry',
  creative: '🎨 Tvůrčí aktivity',
  physical: '🏃 Pohybové hry',
} as const

export const EVENT_STATUS = {
  confirmed: '✅ Potvrzeno',
  tentative: '⏳ Předběžně',
  cancelled: '❌ Zrušeno',
} as const

// Aliases for easier usage in components
export const NAVIGATION = MAIN_MENU
export const CONTACT = {
  phone: CONTACT_INFO.phones.production,
  email: CONTACT_INFO.emails.production,
  address: {
    street: 'Zborov 15',
    city: '370 06 Ledenice',
  },
  ico: CONTACT_INFO.ico,
  social: SOCIAL_LINKS,
}
