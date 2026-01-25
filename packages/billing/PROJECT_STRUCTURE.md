# @vertigo/billing - Project Structure

## Complete File Structure

```
packages/billing/
│
├── 📦 Configuration Files
│   ├── package.json                    - Dependencies & scripts
│   ├── tsconfig.json                   - TypeScript configuration
│   ├── tsup.config.ts                  - Build configuration
│   ├── .eslintrc.js                    - ESLint rules
│   └── .gitignore                      - Git ignore patterns
│
├── 📖 Documentation
│   ├── README.md                       - Main documentation
│   ├── QUICK_START.md                  - 10-minute quick start
│   ├── INTEGRATION_GUIDE.md            - Complete integration guide
│   ├── IMPLEMENTATION_SUMMARY.md       - Implementation details
│   ├── CHANGELOG.md                    - Version history
│   └── PROJECT_STRUCTURE.md            - This file
│
├── 🗄️ Database
│   └── prisma-schema-extension.prisma  - Database models to add
│
├── 💡 Examples (Usage for each vertical)
│   ├── musicians-billing.ts            - Gig invoices with deposits
│   ├── photography-billing.ts          - Package invoices
│   ├── fitness-subscription.ts         - Recurring subscriptions
│   └── bank-sync-matching.ts           - AI payment matching
│
└── 📁 src/
    │
    ├── 🏷️ types/ (Type Definitions)
    │   ├── currency.ts                 - Currency & money types
    │   ├── tax.ts                      - Tax configuration types
    │   ├── invoice.ts                  - Invoice types
    │   ├── payment.ts                  - Payment types
    │   ├── bank.ts                     - Bank & transaction types
    │   ├── expense.ts                  - Expense types
    │   └── index.ts                    - Type exports
    │
    ├── ⚙️ services/ (Core Business Logic)
    │   ├── invoice-service.ts          - Invoice management
    │   ├── payment-service.ts          - Payment processing
    │   ├── currency-service.ts         - Currency conversion
    │   ├── tax-service.ts              - Tax calculation
    │   ├── recurring-service.ts        - Recurring invoices
    │   ├── reminder-service.ts         - Payment reminders
    │   ├── expense-service.ts          - Expense tracking
    │   └── index.ts                    - Service exports
    │
    ├── 🔌 integrations/
    │   │
    │   ├── bank/
    │   │   ├── providers/
    │   │   │   ├── fio-client.ts       - Fio Bank (CZ) integration
    │   │   │   └── plaid-client.ts     - Plaid (US/EU) integration
    │   │   ├── bank-factory.ts         - Bank client factory
    │   │   └── transaction-sync.ts     - Transaction sync service
    │   │
    │   ├── payment-gateway/
    │   │   ├── providers/
    │   │   │   └── stripe-client.ts    - Stripe integration
    │   │   └── gateway-factory.ts      - Gateway factory
    │   │
    │   └── index.ts                    - Integration exports
    │
    ├── 🤖 ai/ (AI-Powered Features)
    │   ├── payment-matcher.ts          - AI payment matching
    │   ├── payment-predictor.ts        - Payment prediction
    │   └── index.ts                    - AI exports
    │
    ├── 🛠️ utils/ (Utility Functions)
    │   ├── qr-generator.ts             - QR code generation
    │   ├── number-generator.ts         - Invoice numbering
    │   ├── locale-formatter.ts         - Locale formatting
    │   └── index.ts                    - Util exports
    │
    └── index.ts                        - Main package export
```

## File Statistics

### Core Files
- **Configuration**: 5 files
- **Documentation**: 6 files
- **Types**: 7 files
- **Services**: 8 files
- **Integrations**: 7 files
- **AI**: 3 files
- **Utils**: 4 files
- **Examples**: 4 files

**Total: 44 files**

### Lines of Code (Estimated)
- **Types**: ~1,200 lines
- **Services**: ~2,500 lines
- **Integrations**: ~1,500 lines
- **AI**: ~800 lines
- **Utils**: ~500 lines
- **Documentation**: ~1,500 lines

**Total: ~8,000 lines**

## Module Exports

### Main Export (`@vertigo/billing`)
```typescript
import * from '@vertigo/billing'
// All types, services, integrations, AI, and utils
```

### Specific Exports
```typescript
// Types only
import { Invoice, Payment, BankTransaction } from '@vertigo/billing/types'

// Services only
import { InvoiceService, PaymentService } from '@vertigo/billing/services'

// Integrations only
import { StripeClient, FioClient } from '@vertigo/billing/integrations'

// AI only
import { AIPaymentMatcher, AIPaymentPredictor } from '@vertigo/billing/ai'

// Utils only
import { QRCodeGenerator, LocaleFormatter } from '@vertigo/billing/utils'
```

## Dependencies

### Production Dependencies
```json
{
  "@prisma/client": "^5.10.0",         // Database ORM
  "stripe": "^14.0.0",                  // Payment gateway
  "@paypal/checkout-server-sdk": "^1.0.3", // PayPal
  "plaid": "^20.0.0",                   // Bank integration
  "coinbase-commerce-node": "^1.0.4",   // Crypto payments
  "qrcode": "^1.5.3",                   // QR code generation
  "dinero.js": "^2.0.0-alpha.14",       // Money handling
  "date-fns": "^3.0.0",                 // Date utilities
  "ioredis": "^5.3.0",                  // Cache (optional)
  "zod": "^3.22.0",                     // Schema validation
  "axios": "^1.6.0",                    // HTTP client
  "openai": "^4.28.0"                   // AI features
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.10.0",
  "@types/qrcode": "^1.5.5",
  "tsup": "^8.0.0",                     // Build tool
  "typescript": "^5.3.0",
  "vitest": "^1.2.0",                   // Testing
  "eslint": "^8.56.0"
}
```

## Build Output

After running `pnpm build`:

```
packages/billing/dist/
├── index.js                  - CommonJS main export
├── index.mjs                 - ESM main export
├── index.d.ts                - TypeScript declarations
├── types/
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
├── services/
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
├── integrations/
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
└── ai/
    ├── index.js
    ├── index.mjs
    └── index.d.ts
```

## Database Models (11 New Tables)

When integrated, adds to Prisma schema:

1. **Currency** - Currency definitions
2. **ExchangeRate** - Exchange rates cache
3. **BankAccount** - Bank account configs
4. **BankTransaction** - Imported transactions
5. **InvoicePayment** - Payment records
6. **PaymentGatewayConfig** - Gateway configurations
7. **CryptoWallet** - Crypto wallet addresses
8. **CryptoPayment** - Crypto payment tracking
9. **ExpenseCategory** - Expense categories
10. **Expense** - Expense records
11. **RecurringInvoiceTemplate** - Recurring templates

## API Surface

### Services (7 Classes)
- InvoiceService
- PaymentService
- CurrencyService
- TaxService
- RecurringInvoiceService
- InvoiceReminderService
- ExpenseService

### Integrations (4 Clients)
- FioClient
- PlaidClient
- StripeClient
- PaymentGatewayFactory / BankFactory

### AI (2 Classes)
- AIPaymentMatcher
- AIPaymentPredictor

### Utils (4 Classes)
- QRCodeGenerator
- InvoiceNumberGenerator
- VariableSymbolGenerator
- LocaleFormatter

**Total: 17 exported classes**

## Type Definitions

### Core Types (50+)
- Invoice, InvoiceLineItem, InvoiceStatus, InvoiceType
- Payment, PaymentMethod, PaymentStatus, PaymentIntent
- BankAccount, BankTransaction, BankProvider
- Expense, ExpenseCategory, ExpenseStatus
- Currency, ExchangeRate, Money
- TaxConfig, TaxCalculation
- And many more...

## Testing Coverage (Recommended)

```
├── __tests__/
│   ├── types/
│   │   └── validation.test.ts          - Zod schema tests
│   ├── services/
│   │   ├── invoice.test.ts             - Invoice service tests
│   │   ├── payment.test.ts             - Payment service tests
│   │   ├── currency.test.ts            - Currency conversion tests
│   │   └── tax.test.ts                 - Tax calculation tests
│   ├── integrations/
│   │   ├── fio.test.ts                 - Fio client tests
│   │   ├── stripe.test.ts              - Stripe client tests
│   │   └── sync.test.ts                - Transaction sync tests
│   └── ai/
│       ├── matcher.test.ts             - AI matching tests
│       └── predictor.test.ts           - AI prediction tests
```

Target: >80% code coverage

## Deployment Checklist

### Pre-deployment
- [ ] Run `pnpm build`
- [ ] Run `pnpm test` (when tests are added)
- [ ] Run `pnpm lint`
- [ ] Check TypeScript compilation (`pnpm typecheck`)

### Integration
- [ ] Update Prisma schema in main database package
- [ ] Run database migrations
- [ ] Add environment variables
- [ ] Configure Stripe webhook endpoint

### Post-deployment
- [ ] Test invoice creation
- [ ] Test payment flow
- [ ] Test webhook handling
- [ ] Monitor error logs

## Maintenance Schedule

### Daily
- Check Stripe webhook logs
- Monitor payment failures

### Weekly
- Review bank sync success rates
- Check AI matching accuracy

### Monthly
- Update exchange rates source (if manual)
- Review and update VAT rates
- Dependency updates

### Quarterly
- Security audit
- Performance review
- Feature backlog review

---

**Package Version**: 0.1.0
**TypeScript**: 5.3.0
**Build Tool**: tsup 8.0.0
**License**: MIT
