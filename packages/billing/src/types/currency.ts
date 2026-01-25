import { z } from 'zod';

// Supported currencies
export const CURRENCIES = [
  'CZK', 'EUR', 'USD', 'GBP', 'PLN', 'HUF', 'CHF', 'SEK', 'DKK', 'NOK',
  'CAD', 'AUD', 'JPY', 'CNY', 'BTC', 'ETH', 'USDC', 'USDT'
] as const;

export type Currency = typeof CURRENCIES[number];

export const CurrencySchema = z.enum(CURRENCIES);

// Currency metadata
export interface CurrencyMetadata {
  code: Currency;
  name: string;
  symbol: string;
  decimals: number;
  isCrypto: boolean;
  isStablecoin?: boolean;
}

export const CURRENCY_METADATA: Record<Currency, CurrencyMetadata> = {
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, isCrypto: false },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isCrypto: false },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isCrypto: false },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isCrypto: false },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, isCrypto: false },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 0, isCrypto: false },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, isCrypto: false },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, isCrypto: false },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, isCrypto: false },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, isCrypto: false },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, isCrypto: false },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, isCrypto: false },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isCrypto: false },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, isCrypto: false },
  BTC: { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8, isCrypto: true },
  ETH: { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18, isCrypto: true },
  USDC: { code: 'USDC', name: 'USD Coin', symbol: 'USDC', decimals: 6, isCrypto: true, isStablecoin: true },
  USDT: { code: 'USDT', name: 'Tether', symbol: 'USDT', decimals: 6, isCrypto: true, isStablecoin: true },
};

// Exchange rate
export const ExchangeRateSchema = z.object({
  from: CurrencySchema,
  to: CurrencySchema,
  rate: z.number().positive(),
  timestamp: z.date(),
  source: z.enum(['ECB', 'CNB', 'OpenExchange', 'Coinbase', 'Manual']),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

// Money type (using Dinero.js structure)
export const MoneySchema = z.object({
  amount: z.number().int(), // Amount in smallest unit (e.g., cents)
  currency: CurrencySchema,
  scale: z.number().int().default(2), // Number of decimal places
});

export type Money = z.infer<typeof MoneySchema>;

// Conversion request
export const ConvertMoneySchema = z.object({
  from: MoneySchema,
  toCurrency: CurrencySchema,
  rate: z.number().positive().optional(), // If not provided, fetch from exchange rate service
});

export type ConvertMoney = z.infer<typeof ConvertMoneySchema>;
