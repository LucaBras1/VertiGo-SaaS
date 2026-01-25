# Changelog

All notable changes to @vertigo/billing will be documented in this file.

## [0.1.0] - 2025-01-25

### Added

#### Core Features
- Invoice management with multiple types (STANDARD, PROFORMA, CREDIT_NOTE, DEPOSIT, FINAL, RECURRING)
- Payment processing with multiple gateways
- Multi-currency support (18+ currencies including crypto)
- Tax management with VAT/GST/Sales tax support
- EU reverse charge mechanism
- Recurring invoice system
- Payment reminder system

#### Banking Integration
- Fio Bank client (Czech Republic)
- Plaid client (US/EU)
- Bank transaction sync service
- Automatic transaction import
- Multi-account support

#### Payment Gateways
- Stripe integration (payment intents, checkout, webhooks)
- Payment gateway factory for extensibility
- Support for crypto payments (Coinbase Commerce, BTCPay Server, Circle)

#### AI Features
- AI-powered payment matching (bank transactions to invoices)
- Payment prediction (predict when invoices will be paid)
- Rule-based and AI-based matching algorithms

#### Expense Management
- Expense tracking by category
- Receipt OCR integration
- Approval workflow
- Tax deduction tracking
- CSV export

#### Utilities
- QR code generation (Czech SPD format, SEPA EPC format)
- Invoice number generation with configurable formats
- Variable symbol generation
- Locale-specific formatting
- Currency conversion service

### Database Schema
- BankAccount, BankTransaction models
- InvoicePayment model
- PaymentGatewayConfig model
- CryptoWallet, CryptoPayment models
- ExpenseCategory, Expense models
- RecurringInvoiceTemplate model
- Currency, ExchangeRate models

### Technical
- Full TypeScript support
- Zod schema validation
- Prisma integration
- ESM and CommonJS builds
- Comprehensive type exports
