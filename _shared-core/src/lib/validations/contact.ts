/**
 * Contact Form Validation Schema
 * Using Zod for type-safe validation
 */

import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Jméno je povinné')
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(100, 'Jméno může mít maximálně 100 znaků'),

  email: z
    .string()
    .min(1, 'E-mail je povinný')
    .email('Zadejte platnou e-mailovou adresu'),

  phone: z
    .string()
    .max(20, 'Telefon může mít maximálně 20 znaků')
    .optional()
    .or(z.literal('')),

  subject: z
    .string()
    .min(1, 'Vyberte předmět dotazu'),

  message: z
    .string()
    .min(1, 'Zpráva je povinná')
    .min(10, 'Zpráva musí mít alespoň 10 znaků')
    .max(5000, 'Zpráva může mít maximálně 5000 znaků'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

/**
 * Subject options for the contact form
 * Note: Orders are now handled via OrderModal, not contact form
 */
export const subjectOptions = [
  { value: '', label: 'O čem chcete napsat?' },
  { value: 'info', label: 'Dotaz na představení' },
  { value: 'technical', label: 'Technické požadavky' },
  { value: 'collaboration', label: 'Spolupráce' },
  { value: 'other', label: 'Něco jiného' },
] as const
