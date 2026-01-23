/**
 * Game Form Validation Schema
 * Using Zod for type-safe validation
 */

import { z } from 'zod'

export const gameFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Název je povinný')
    .min(2, 'Název musí mít alespoň 2 znaky')
    .max(200, 'Název může mít maximálně 200 znaků'),

  slug: z
    .string()
    .min(1, 'URL slug je povinný')
    .regex(/^[a-z0-9-]+$/, 'Slug může obsahovat pouze malá písmena, čísla a pomlčky'),

  category: z.enum(['skill', 'team', 'creative', 'active'], {
    required_error: 'Vyberte kategorii',
  }),

  status: z.enum(['active', 'draft', 'archived'], {
    required_error: 'Vyberte stav',
  }),

  duration: z
    .number()
    .min(1, 'Délka musí být alespoň 1 minuta')
    .max(480, 'Délka může být maximálně 480 minut'),

  ageFrom: z
    .number()
    .min(0, 'Věk od musí být alespoň 0')
    .max(99, 'Věk od může být maximálně 99'),

  ageTo: z
    .number()
    .min(1, 'Věk do musí být alespoň 1')
    .max(99, 'Věk do může být maximálně 99'),

  minPlayers: z
    .number()
    .min(1, 'Minimální počet hráčů musí být alespoň 1')
    .max(1000, 'Maximální počet hráčů je 1000')
    .optional()
    .nullable(),

  maxPlayers: z
    .number()
    .min(1, 'Maximální počet hráčů musí být alespoň 1')
    .max(1000, 'Maximální počet hráčů je 1000')
    .optional()
    .nullable(),

  featuredImageUrl: z
    .string()
    .min(1, 'Hlavní obrázek je povinný')
    .url('Zadejte platnou URL adresu obrázku'),

  excerpt: z
    .string()
    .max(500, 'Popis může mít maximálně 500 znaků')
    .optional()
    .nullable(),

  price: z
    .number()
    .min(0, 'Cena nemůže být záporná')
    .optional()
    .nullable(),
})

export type GameFormData = z.infer<typeof gameFormSchema>

/**
 * Category options for the game form
 */
export const categoryOptions = [
  { value: 'skill', label: 'Dovednostní' },
  { value: 'team', label: 'Týmové' },
  { value: 'creative', label: 'Tvořivé' },
  { value: 'active', label: 'Pohybové' },
] as const

/**
 * Status options for the game form
 */
export const statusOptions = [
  { value: 'active', label: 'Aktivní' },
  { value: 'draft', label: 'Koncept' },
  { value: 'archived', label: 'Archivováno' },
] as const

/**
 * Validate game form data and return errors
 */
export function validateGameForm(data: Partial<GameFormData>): Record<string, string> {
  const errors: Record<string, string> = {}

  // Title validation
  if (!data.title || data.title.length < 2) {
    errors.title = 'Název musí mít alespoň 2 znaky'
  }

  // Slug validation
  if (!data.slug) {
    errors.slug = 'URL slug je povinný'
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug může obsahovat pouze malá písmena, čísla a pomlčky'
  }

  // Duration validation
  if (!data.duration || data.duration < 1) {
    errors.duration = 'Délka musí být alespoň 1 minuta'
  }

  // Featured image validation
  if (!data.featuredImageUrl) {
    errors.featuredImageUrl = 'Hlavní obrázek je povinný'
  }

  // Age range validation
  if (data.ageFrom !== undefined && data.ageTo !== undefined && data.ageFrom > data.ageTo) {
    errors.ageTo = 'Věk do musí být větší než věk od'
  }

  // Players validation
  if (data.minPlayers && data.maxPlayers && data.minPlayers > data.maxPlayers) {
    errors.maxPlayers = 'Maximální počet hráčů musí být větší než minimální'
  }

  return errors
}
