import { z } from 'zod'

/**
 * Venue types for organizer order form
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
 * Item types for order
 */
export const ITEM_TYPES = {
  performance: 'Inscenace',
  game: 'Hra',
  service: 'Služba',
} as const

export type ItemType = keyof typeof ITEM_TYPES

/**
 * Electricity voltage options
 */
export const ELECTRICITY_OPTIONS = {
  none: 'Není potřeba',
  '230V': '230V (běžná zásuvka)',
  '380V': '380V (silnoproud)',
} as const

export type ElectricityOption = keyof typeof ELECTRICITY_OPTIONS

/**
 * Order item schema
 */
const orderItemSchema = z.object({
  type: z.enum(['performance', 'game', 'service'] as const),
  itemId: z.string().min(1, 'Vyberte položku'),
  itemTitle: z.string().optional(),
  note: z.string().max(500, 'Poznámka je příliš dlouhá').optional(),
})

export type OrderItemData = z.infer<typeof orderItemSchema>

/**
 * Organizer order form validation schema
 */
export const organizerOrderSchema = z.object({
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

  // Order items (at least one required)
  items: z
    .array(orderItemSchema)
    .min(1, 'Vyberte alespoň jednu položku'),

  // Venue details
  venueType: z.enum(Object.keys(VENUE_TYPES) as [VenueType, ...VenueType[]], {
    errorMap: () => ({ message: 'Vyberte typ akce' }),
  }),
  venueName: z.string().max(200, 'Název místa je příliš dlouhý').optional(),
  venueStreet: z.string().max(200, 'Ulice je příliš dlouhá').optional(),
  venueCity: z
    .string()
    .min(2, 'Město musí mít alespoň 2 znaky')
    .max(100, 'Název města je příliš dlouhý'),
  venuePostalCode: z
    .string()
    .regex(/^[0-9]{3}\s?[0-9]{2}$/, 'Neplatný formát PSČ (např. 110 00)')
    .optional()
    .or(z.literal('')),

  // Dates
  preferredDate: z
    .string()
    .min(1, 'Vyberte preferovaný termín'),
  alternativeDate1: z.string().optional(),
  alternativeDate2: z.string().optional(),

  // Audience
  audienceCount: z
    .number()
    .int()
    .min(1, 'Počet diváků musí být alespoň 1')
    .max(10000, 'Počet diváků je příliš vysoký')
    .optional()
    .nullable(),

  // Technical requirements
  parking: z.boolean().default(false),
  electricityVoltage: z.enum(['none', '230V', '380V'] as const).default('none'),
  sound: z.boolean().default(false),
  lighting: z.boolean().default(false),
  accommodation: z.boolean().default(false),
  accommodationPersons: z
    .number()
    .int()
    .min(1, 'Počet osob musí být alespoň 1')
    .max(20, 'Příliš mnoho osob')
    .optional()
    .nullable(),
  otherRequirements: z
    .string()
    .max(2000, 'Text je příliš dlouhý')
    .optional(),

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

export type OrganizerOrderFormData = z.infer<typeof organizerOrderSchema>

/**
 * API response types
 */
export interface OrganizerOrderResponse {
  success: boolean
  orderNumber?: string
  message?: string
  error?: string
}
