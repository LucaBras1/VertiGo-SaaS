import type { Currency } from '../types/currency';
import { CURRENCY_METADATA } from '../types/currency';

export class LocaleFormatter {
  /**
   * Format currency amount
   */
  static formatCurrency(
    amount: number,
    currency: Currency,
    locale: string = 'en-US'
  ): string {
    const metadata = CURRENCY_METADATA[currency];

    if (metadata.isCrypto) {
      // Crypto formatting
      return `${amount.toFixed(metadata.decimals)} ${metadata.symbol}`;
    }

    // Fiat currency formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: metadata.decimals,
      maximumFractionDigits: metadata.decimals,
    });

    return formatter.format(amount);
  }

  /**
   * Format date
   */
  static formatDate(date: Date, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Format short date
   */
  static formatShortDate(date: Date, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  /**
   * Format number
   */
  static formatNumber(
    num: number,
    locale: string = 'en-US',
    decimals: number = 2
  ): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format percentage
   */
  static formatPercentage(
    value: number,
    locale: string = 'en-US',
    decimals: number = 0
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Get locale-specific currency symbol
   */
  static getCurrencySymbol(currency: Currency): string {
    return CURRENCY_METADATA[currency].symbol;
  }

  /**
   * Format invoice number for display
   */
  static formatInvoiceNumber(
    invoiceNumber: string,
    _locale: string = 'en-US'
  ): string {
    // For now, just return as-is
    // Could add locale-specific formatting later
    return invoiceNumber;
  }

  /**
   * Format tax rate
   */
  static formatTaxRate(rate: number, locale: string = 'en-US'): string {
    return `${this.formatNumber(rate, locale, 0)}%`;
  }

  /**
   * Format IBAN for display (with spaces every 4 chars)
   */
  static formatIBAN(iban: string): string {
    const cleaned = iban.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }

  /**
   * Format bank account for display
   */
  static formatBankAccount(
    accountNumber: string,
    bankCode?: string,
    locale: string = 'cs-CZ'
  ): string {
    if (locale.startsWith('cs') && bankCode) {
      return `${accountNumber}/${bankCode}`;
    }
    return accountNumber;
  }
}
