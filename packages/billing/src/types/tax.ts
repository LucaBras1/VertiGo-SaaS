import { z } from 'zod';
import { CurrencySchema } from './currency';

// Tax types
export const TAX_TYPES = ['VAT', 'GST', 'SALES_TAX', 'NONE'] as const;
export type TaxType = typeof TAX_TYPES[number];

export const TaxTypeSchema = z.enum(TAX_TYPES);

// VAT rates (common EU rates)
export const VAT_RATES = {
  CZ: { standard: 21, reduced: 15, superReduced: 10 },
  SK: { standard: 20, reduced: 10 },
  PL: { standard: 23, reduced: 8, superReduced: 5 },
  HU: { standard: 27, reduced: 18, superReduced: 5 },
  AT: { standard: 20, reduced: 13, superReduced: 10 },
  DE: { standard: 19, reduced: 7 },
  FR: { standard: 20, reduced: 10, superReduced: 5.5 },
  UK: { standard: 20, reduced: 5 },
  US: { standard: 0 }, // No federal VAT, handled per state
} as const;

export type CountryCode = keyof typeof VAT_RATES;

// Tax configuration
export const TaxConfigSchema = z.object({
  type: TaxTypeSchema,
  rate: z.number().min(0).max(100), // Percentage
  label: z.string().optional(), // e.g., "VAT 21%", "Sales Tax"
  countryCode: z.string().length(2).optional(),
  isReversedCharge: z.boolean().default(false), // EU reverse charge mechanism
  isExempt: z.boolean().default(false),
});

export type TaxConfig = z.infer<typeof TaxConfigSchema>;

// Tax calculation result
export const TaxCalculationSchema = z.object({
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  currency: CurrencySchema,
  taxConfig: TaxConfigSchema,
  breakdown: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    taxRate: z.number(),
    taxAmount: z.number(),
  })).optional(),
});

export type TaxCalculation = z.infer<typeof TaxCalculationSchema>;

// Tax exemption reasons
export const TAX_EXEMPTION_REASONS = [
  'REVERSE_CHARGE', // EU B2B
  'EXPORT', // Outside EU/tax jurisdiction
  'SMALL_BUSINESS', // Below VAT threshold
  'NONPROFIT', // Charitable organization
  'EDUCATIONAL', // Educational services
  'MEDICAL', // Medical services
  'OTHER',
] as const;

export type TaxExemptionReason = typeof TAX_EXEMPTION_REASONS[number];

export const TaxExemptionSchema = z.object({
  reason: z.enum(TAX_EXEMPTION_REASONS),
  description: z.string().optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
});

export type TaxExemption = z.infer<typeof TaxExemptionSchema>;

// Helper function to get VAT rate by country
export function getVatRate(countryCode: CountryCode, type: 'standard' | 'reduced' | 'superReduced' = 'standard'): number {
  const rates = VAT_RATES[countryCode];
  return rates[type] ?? rates.standard;
}

// Check if reverse charge applies (EU B2B)
export function shouldApplyReverseCharge(
  sellerCountry: string,
  buyerCountry: string,
  buyerHasVatId: boolean
): boolean {
  const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

  return (
    sellerCountry !== buyerCountry &&
    euCountries.includes(sellerCountry) &&
    euCountries.includes(buyerCountry) &&
    buyerHasVatId
  );
}
