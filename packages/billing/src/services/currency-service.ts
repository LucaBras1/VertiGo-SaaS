import type { Currency, ExchangeRate, Money, ConvertMoney } from '../types/currency';
import { CURRENCY_METADATA } from '../types/currency';

export class CurrencyService {
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private cacheExpiryMs = 3600000; // 1 hour

  /**
   * Format money amount for display
   */
  formatMoney(money: Money, locale: string = 'en-US'): string {
    const metadata = CURRENCY_METADATA[money.currency];
    const amount = money.amount / Math.pow(10, money.scale);

    if (metadata.isCrypto) {
      // Crypto formatting
      return `${amount.toFixed(metadata.decimals)} ${metadata.symbol}`;
    }

    // Fiat currency formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: metadata.decimals,
      maximumFractionDigits: metadata.decimals,
    });

    return formatter.format(amount);
  }

  /**
   * Parse money from string or number
   */
  parseMoney(amount: number | string, currency: Currency, scale: number = 2): Money {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const smallestUnit = Math.round(numAmount * Math.pow(10, scale));

    return {
      amount: smallestUnit,
      currency,
      scale,
    };
  }

  /**
   * Add two money amounts (must be same currency)
   */
  add(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot add money with different currencies');
    }

    return {
      amount: a.amount + b.amount,
      currency: a.currency,
      scale: a.scale,
    };
  }

  /**
   * Subtract money amounts (must be same currency)
   */
  subtract(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }

    return {
      amount: a.amount - b.amount,
      currency: a.currency,
      scale: a.scale,
    };
  }

  /**
   * Multiply money by a factor
   */
  multiply(money: Money, factor: number): Money {
    return {
      amount: Math.round(money.amount * factor),
      currency: money.currency,
      scale: money.scale,
    };
  }

  /**
   * Divide money by a factor
   */
  divide(money: Money, divisor: number): Money {
    return {
      amount: Math.round(money.amount / divisor),
      currency: money.currency,
      scale: money.scale,
    };
  }

  /**
   * Convert money to another currency
   */
  async convert(request: ConvertMoney): Promise<Money> {
    const { from, toCurrency, rate } = request;

    // If converting to same currency, return as-is
    if (from.currency === toCurrency) {
      return from;
    }

    // Get exchange rate
    const exchangeRate = rate || await this.getExchangeRate(from.currency, toCurrency);

    // Convert amount
    const convertedAmount = Math.round(from.amount * exchangeRate);

    return {
      amount: convertedAmount,
      currency: toCurrency,
      scale: from.scale,
    };
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = this.exchangeRates.get(cacheKey);

    // Check if cached and not expired
    if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiryMs) {
      return cached.rate;
    }

    // Fetch fresh rate (would call external API in production)
    const rate = await this.fetchExchangeRate(from, to);

    // Cache the rate
    this.exchangeRates.set(cacheKey, {
      from,
      to,
      rate,
      timestamp: new Date(),
      source: 'ECB', // Mock source
    });

    return rate;
  }

  /**
   * Fetch exchange rate from external API
   * In production, this would call ECB, CNB, OpenExchange, or Coinbase API
   */
  private async fetchExchangeRate(from: Currency, to: Currency): Promise<number> {
    // Mock exchange rates
    const mockRates: Record<string, number> = {
      'EUR_USD': 1.08,
      'EUR_CZK': 25.5,
      'EUR_GBP': 0.86,
      'USD_CZK': 23.6,
      'USD_GBP': 0.80,
      'CZK_EUR': 0.039,
      'CZK_USD': 0.042,
      'BTC_USD': 45000,
      'ETH_USD': 2500,
      'USDC_USD': 1.0,
      'USDT_USD': 1.0,
    };

    const key = `${from}_${to}`;
    const inverseKey = `${to}_${from}`;

    if (mockRates[key]) {
      return mockRates[key];
    } else if (mockRates[inverseKey]) {
      return 1 / mockRates[inverseKey];
    }

    // If no direct rate, try to convert through EUR or USD
    if (from !== 'EUR' && to !== 'EUR') {
      const fromToEur = await this.getExchangeRate(from, 'EUR');
      const eurToTo = await this.getExchangeRate('EUR', to);
      return fromToEur * eurToTo;
    }

    throw new Error(`Exchange rate not found for ${from} to ${to}`);
  }

  /**
   * Get all exchange rates for a base currency
   */
  async getAllRates(baseCurrency: Currency): Promise<Record<Currency, number>> {
    const rates: Record<string, number> = {};

    for (const currency of Object.keys(CURRENCY_METADATA) as Currency[]) {
      if (currency !== baseCurrency) {
        rates[currency] = await this.getExchangeRate(baseCurrency, currency);
      }
    }

    return rates as Record<Currency, number>;
  }

  /**
   * Clear exchange rate cache
   */
  clearCache(): void {
    this.exchangeRates.clear();
  }

  /**
   * Check if currency is crypto
   */
  isCrypto(currency: Currency): boolean {
    return CURRENCY_METADATA[currency].isCrypto;
  }

  /**
   * Get currency symbol
   */
  getSymbol(currency: Currency): string {
    return CURRENCY_METADATA[currency].symbol;
  }

  /**
   * Get currency decimals
   */
  getDecimals(currency: Currency): number {
    return CURRENCY_METADATA[currency].decimals;
  }
}
