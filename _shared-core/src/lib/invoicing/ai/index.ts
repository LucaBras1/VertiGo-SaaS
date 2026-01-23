/**
 * AI Module Exports
 *
 * Centrální export pro všechny AI funkce fakturačního systému.
 */

// Payment Predictor
export {
  predictPayment,
  getCustomerPaymentStats,
  getPredictionsForCustomers,
  identifyRiskyCustomers,
} from './payment-predictor'

export type {
  PaymentPrediction,
  PaymentRecommendation,
  PaymentFactor,
  FactorType,
  CustomerPaymentStats,
} from './payment-predictor'

// Customer Matcher
export {
  matchCustomerFromText,
  matchCustomerFromEmail,
  matchCustomerFromDocument,
  findCustomerByIdentifier,
  suggestCustomers,
  extractDataFromText,
} from './customer-matcher'

export type {
  CustomerMatch,
  CustomerInfo,
  MatchedField,
  ExtractedData,
} from './customer-matcher'

// Text Generator
export {
  generateInvoiceSuggestions,
  generateReminderText,
  generateInvoiceEmail,
  suggestItemDescription,
  generatePersonalizedText,
  analyzeAndSuggest,
} from './text-generator'

export type {
  GeneratedText,
  TextContext,
  InvoiceTextSuggestions,
} from './text-generator'

// Revenue Forecaster
export {
  forecastRevenue,
  forecastCashFlow,
  getSeasonalityAnalysis,
  getGrowthMetrics,
  predictAnnualTurnover,
} from './revenue-forecaster'

export type {
  RevenueForecast,
  ForecastPeriod,
  CashFlowPrediction,
  ExpectedPayment,
  SeasonalityAnalysis,
  GrowthMetrics,
} from './revenue-forecaster'
