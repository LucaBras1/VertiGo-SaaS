import type { TaxConfig, TaxCalculation, TaxExemption } from '../types/tax';
import { getVatRate, shouldApplyReverseCharge, type CountryCode } from '../types/tax';
import type { Currency } from '../types/currency';

export class TaxService {
  /**
   * Calculate tax for an amount
   */
  calculateTax(
    subtotal: number,
    taxConfig: TaxConfig,
    currency: Currency
  ): TaxCalculation {
    let taxAmount = 0;

    if (!taxConfig.isExempt && !taxConfig.isReversedCharge) {
      taxAmount = subtotal * (taxConfig.rate / 100);
    }

    const total = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency,
      taxConfig,
    };
  }

  /**
   * Calculate tax for multiple line items
   */
  calculateTaxForItems(
    items: Array<{ amount: number; taxRate: number }>,
    currency: Currency
  ): TaxCalculation {
    const breakdown = items.map(item => ({
      description: 'Item',
      amount: item.amount,
      taxRate: item.taxRate,
      taxAmount: item.amount * (item.taxRate / 100),
    }));

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = breakdown.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency,
      taxConfig: {
        type: 'VAT',
        rate: items[0]?.taxRate || 0,
        isReversedCharge: false,
        isExempt: false,
      },
      breakdown,
    };
  }

  /**
   * Get appropriate tax config for a transaction
   */
  getTaxConfig(
    sellerCountry: CountryCode,
    buyerCountry: string,
    buyerHasVatId: boolean,
    taxType: 'standard' | 'reduced' | 'superReduced' = 'standard'
  ): TaxConfig {
    // Check if reverse charge applies (EU B2B)
    if (shouldApplyReverseCharge(sellerCountry, buyerCountry, buyerHasVatId)) {
      return {
        type: 'VAT',
        rate: 0,
        label: 'Reverse Charge',
        countryCode: sellerCountry,
        isReversedCharge: true,
        isExempt: false,
      };
    }

    // Check if export (outside EU)
    const euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    if (!euCountries.includes(buyerCountry)) {
      return {
        type: 'VAT',
        rate: 0,
        label: 'Export - VAT Exempt',
        countryCode: sellerCountry,
        isReversedCharge: false,
        isExempt: true,
      };
    }

    // Standard VAT rate
    const rate = getVatRate(sellerCountry, taxType);
    return {
      type: 'VAT',
      rate,
      label: `VAT ${rate}%`,
      countryCode: sellerCountry,
      isReversedCharge: false,
      isExempt: false,
    };
  }

  /**
   * Validate VAT ID format
   */
  validateVatId(vatId: string, countryCode: string): boolean {
    // Remove spaces and convert to uppercase
    const cleaned = vatId.replace(/\s/g, '').toUpperCase();

    // Basic validation patterns (simplified)
    const patterns: Record<string, RegExp> = {
      CZ: /^CZ\d{8,10}$/,
      SK: /^SK\d{10}$/,
      AT: /^ATU\d{8}$/,
      BE: /^BE0?\d{9}$/,
      DE: /^DE\d{9}$/,
      FR: /^FR[A-Z0-9]{2}\d{9}$/,
      GB: /^GB\d{9}(\d{3})?$/,
      PL: /^PL\d{10}$/,
    };

    const pattern = patterns[countryCode];
    if (!pattern) {
      return false; // Unknown country
    }

    return pattern.test(cleaned);
  }

  /**
   * Check if tax exemption is valid
   */
  isExemptionValid(exemption: TaxExemption): boolean {
    const now = new Date();

    if (exemption.validFrom && now < exemption.validFrom) {
      return false;
    }

    if (exemption.validUntil && now > exemption.validUntil) {
      return false;
    }

    return true;
  }

  /**
   * Calculate tax-inclusive amount from tax-exclusive
   */
  addTax(amountExcludingTax: number, taxRate: number): number {
    return Math.round(amountExcludingTax * (1 + taxRate / 100) * 100) / 100;
  }

  /**
   * Calculate tax-exclusive amount from tax-inclusive
   */
  removeTax(amountIncludingTax: number, taxRate: number): number {
    return Math.round((amountIncludingTax / (1 + taxRate / 100)) * 100) / 100;
  }

  /**
   * Extract tax amount from tax-inclusive total
   */
  extractTax(amountIncludingTax: number, taxRate: number): number {
    const amountExcludingTax = this.removeTax(amountIncludingTax, taxRate);
    return Math.round((amountIncludingTax - amountExcludingTax) * 100) / 100;
  }
}
