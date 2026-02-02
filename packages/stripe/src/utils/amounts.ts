/**
 * @vertigo/stripe - Amount Utilities
 * Currency conversion helpers for Stripe
 */

import type { Currency } from '../types'

/**
 * Currencies that don't use decimal places (smallest unit = 1)
 */
const ZERO_DECIMAL_CURRENCIES: Currency[] = ['jpy', 'krw']

/**
 * Convert display amount to Stripe smallest unit (e.g., CZK to haléře)
 *
 * @example
 * toStripeAmount(100, 'czk') // 10000 (haléře)
 * toStripeAmount(100, 'usd') // 10000 (cents)
 * toStripeAmount(100, 'jpy') // 100 (yen - zero decimal)
 */
export function toStripeAmount(amount: number, currency: Currency = 'czk'): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase() as Currency)) {
    return Math.round(amount)
  }
  return Math.round(amount * 100)
}

/**
 * Convert Stripe smallest unit to display amount (e.g., haléře to CZK)
 *
 * @example
 * fromStripeAmount(10000, 'czk') // 100 (CZK)
 * fromStripeAmount(10000, 'usd') // 100 (USD)
 * fromStripeAmount(100, 'jpy')   // 100 (JPY - zero decimal)
 */
export function fromStripeAmount(amount: number, currency: Currency = 'czk'): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase() as Currency)) {
    return amount
  }
  return amount / 100
}

/**
 * Format amount for display with currency symbol
 *
 * @example
 * formatAmountForDisplay(100, 'czk') // "100,00 CZK"
 * formatAmountForDisplay(100, 'usd') // "$100.00"
 * formatAmountForDisplay(100, 'eur') // "€100.00"
 */
export function formatAmountForDisplay(
  amount: number,
  currency: Currency = 'czk',
  locale: string = 'cs-CZ'
): string {
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.includes(currency) ? 0 : 2,
  }

  return new Intl.NumberFormat(locale, formatOptions).format(amount)
}

/**
 * Parse string amount to number (handles locale-specific formatting)
 *
 * @example
 * parseAmount('100,50') // 100.5
 * parseAmount('1 000,00') // 1000
 */
export function parseAmount(value: string): number {
  // Replace comma with dot and remove spaces/currency symbols
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.')
  return parseFloat(cleaned) || 0
}
