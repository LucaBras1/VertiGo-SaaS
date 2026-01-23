import { z } from 'zod'

/**
 * Venue types for public order form
 */
export const VENUE_TYPES = {
  kindergarten: 'Mateřská škola',
  elementary_school: 'Základní škola',
  high_school: 'Střední škola',
  cultural_center: 'Kulturní dům / středisko',
  library: 'Knihovna',
  festival: 'Festival',
  private_event: 'Soukromá akce',
  corporate_event: 'Firemní akce',
  municipality: 'Obec / město',
  other: 'Jiné',
} as const

export type VenueType = keyof typeof VENUE_TYPES

/**
 * Public order form validation schema
 */
export const publicOrderSchema = z.object({
  // Contact information
  firstName: z
    .string()
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(50, 'Jméno je příliš dlouhé'),
  lastName: z
    .string()
    .min(2, 'Příjmení musí mít alespoň 2 znaky')
    .max(50, 'Příjmení je příliš dlouhé'),
  email: z
    .string()
    .email('Zadejte platnou emailovou adresu'),
  phone: z
    .string()
    .min(9, 'Telefon musí mít alespoň 9 znaků')
    .max(20, 'Telefon je příliš dlouhý'),

  // Organization (optional, for invoicing)
  organization: z.string().max(100).optional(),
  ico: z
    .string()
    .regex(/^[0-9]{8}$/, 'IČO musí mít 8 číslic')
    .optional()
    .or(z.literal('')),

  // Event details
  venueType: z.enum(Object.keys(VENUE_TYPES) as [VenueType, ...VenueType[]], {
    errorMap: () => ({ message: 'Vyberte typ akce' }),
  }),
  venueCity: z
    .string()
    .min(2, 'Město musí mít alespoň 2 znaky')
    .max(100, 'Název města je příliš dlouhý'),
  preferredDate: z
    .string()
    .min(1, 'Vyberte preferovaný termín'),
  alternativeDate: z.string().optional(),
  audienceCount: z
    .number()
    .int()
    .min(1, 'Počet diváků musí být alespoň 1')
    .max(10000, 'Počet diváků je příliš vysoký')
    .optional()
    .nullable(),

  // Performance
  performanceId: z.string().optional(),
  performanceTitle: z.string().optional(),

  // Message
  message: z
    .string()
    .max(2000, 'Zpráva je příliš dlouhá')
    .optional(),

  // GDPR consent
  gdprConsent: z
    .boolean()
    .refine((val) => val === true, 'Musíte souhlasit se zpracováním údajů'),

  // Honeypot (anti-spam)
  website: z.string().max(0).optional(),
})

export type PublicOrderFormData = z.infer<typeof publicOrderSchema>

/**
 * API response types
 */
export interface PublicOrderResponse {
  success: boolean
  orderNumber?: string
  message?: string
  error?: string
}
