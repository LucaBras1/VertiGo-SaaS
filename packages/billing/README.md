# @vertigo/billing

Global billing platform for VertiGo SaaS - supporting all 7 verticals with comprehensive invoicing, payments, banking, and expense management.

## Features

### Core Billing
- **Invoicing**: Create, manage, and track invoices with multiple statuses
- **Payments**: Process payments via Stripe, PayPal, GoPay, and more
- **Recurring Invoices**: Automated subscription billing
- **Payment Reminders**: Automated reminder system for overdue invoices
- **Multi-Currency**: Support for 18+ currencies including crypto
- **Tax Management**: VAT/GST/Sales tax with EU reverse charge support

### Banking Integration
- **Bank Sync**: Automatic transaction import from Fio, Wise, Revolut, Plaid, Nordigen
- **Payment Matching**: AI-powered automatic invoice-payment matching
- **Multi-Account**: Manage multiple bank accounts per tenant

### Expense Management
- **Expense Tracking**: Track business expenses by category
- **Receipt OCR**: Extract data from receipt images
- **Approval Workflow**: Submit, approve, reject, reimburse expenses
- **Tax Deductions**: Track tax-deductible expenses

### AI Features
- **Payment Matcher**: AI-powered matching of bank transactions to invoices
- **Payment Predictor**: Predict when invoices will be paid
- **Fraud Detection**: Detect suspicious payment patterns

### Payment Gateways
- **Stripe**: Full integration with checkout and webhooks
- **PayPal**: PayPal Checkout SDK integration
- **GoPay**: Czech payment gateway
- **Crypto**: Coinbase Commerce, BTCPay Server, Circle

## Installation

```bash
pnpm add @vertigo/billing
```

## Usage

### Invoice Management

```typescript
import { InvoiceService } from '@vertigo/billing/services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);

// Create invoice
const invoice = await invoiceService.createInvoice({
  tenantId: 'tenant_123',
  type: 'STANDARD',
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
  seller: {
    name: 'My Company',
    street: '123 Main St',
    city: 'Prague',
    postalCode: '110 00',
    country: 'CZ',
    vatId: 'CZ12345678',
  },
  buyer: {
    name: 'Customer Inc',
    street: '456 Oak Ave',
    city: 'Brno',
    postalCode: '602 00',
    country: 'CZ',
  },
  items: [
    {
      id: '1',
      description: 'Web Development Services',
      quantity: 10,
      unitPrice: 1000,
      discount: 0,
      taxRate: 21,
      subtotal: 10000,
      taxAmount: 2100,
      total: 12100,
    },
  ],
  subtotal: 10000,
  taxAmount: 2100,
  total: 12100,
  currency: 'CZK',
  paymentTerm: 'NET_14',
});

// Mark as sent
await invoiceService.markAsSent(invoice.id);

// Mark as paid
await invoiceService.markAsPaid(invoice.id, new Date(), 'BANK_TRANSFER');
```

### Payment Processing

```typescript
import { StripeClient } from '@vertigo/billing/integrations';

const stripe = new StripeClient({
  secretKey: process.env.STRIPE_SECRET_KEY!,
});

// Create payment intent
const result = await stripe.createPaymentIntent({
  amount: 12100,
  currency: 'CZK',
  invoiceId: invoice.id,
  description: 'Invoice payment',
});

// Create checkout session
const session = await stripe.createCheckoutSession({
  amount: 12100,
  currency: 'CZK',
  invoiceId: invoice.id,
  returnUrl: 'https://myapp.com/success',
  cancelUrl: 'https://myapp.com/cancel',
});

// Redirect user to session.gatewayUrl
```

### Bank Transaction Sync

```typescript
import { BankTransactionSyncService } from '@vertigo/billing/integrations';

const syncService = new BankTransactionSyncService(prisma);

// Sync single account
const result = await syncService.syncAccount(bankAccount);

console.log(`Imported ${result.transactionsImported} transactions`);
console.log(`Matched ${result.transactionsMatched} with invoices`);
```

### AI Payment Matching

```typescript
import { AIPaymentMatcher } from '@vertigo/billing/ai';

const matcher = new AIPaymentMatcher(process.env.OPENAI_API_KEY!);

// Find matching invoices for a bank transaction
const matches = await matcher.findMatches(transaction, unpaidInvoices);

for (const match of matches) {
  console.log(`Invoice ${match.invoiceNumber}: ${(match.confidence * 100).toFixed(0)}% confidence`);
  console.log(`Reason: ${match.reason}`);
}

// Auto-match if high confidence
if (matches[0]?.confidence > 0.9) {
  await invoiceService.markAsPaid(
    matches[0].invoiceId,
    transaction.date,
    'BANK_TRANSFER',
    transaction.transactionId
  );
}
```

### Currency Conversion

```typescript
import { CurrencyService } from '@vertigo/billing/services';

const currencyService = new CurrencyService();

// Create money object
const money = currencyService.parseMoney(1000, 'EUR');

// Format for display
const formatted = currencyService.formatMoney(money, 'cs-CZ');
console.log(formatted); // "1 000,00 €"

// Convert to another currency
const converted = await currencyService.convert({
  from: money,
  toCurrency: 'CZK',
});

console.log(currencyService.formatMoney(converted, 'cs-CZ')); // "25 500,00 Kč"
```

### Tax Calculation

```typescript
import { TaxService } from '@vertigo/billing/services';

const taxService = new TaxService();

// Get appropriate tax config
const taxConfig = taxService.getTaxConfig(
  'CZ', // Seller country
  'SK', // Buyer country
  true, // Buyer has VAT ID
);

console.log(taxConfig); // { type: 'VAT', rate: 0, isReversedCharge: true }

// Calculate tax
const calculation = taxService.calculateTax(10000, taxConfig, 'CZK');
console.log(calculation);
// {
//   subtotal: 10000,
//   taxAmount: 0, // Reverse charge
//   total: 10000,
//   currency: 'CZK',
//   taxConfig: { ... }
// }
```

### QR Code Generation

```typescript
import { QRCodeGenerator } from '@vertigo/billing/utils';

const qrGenerator = new QRCodeGenerator();

// Czech payment QR code
const qrCode = await qrGenerator.generateCzechPaymentQR({
  accountNumber: '1234567890',
  bankCode: '0800',
  amount: 12100,
  currency: 'CZK',
  variableSymbol: '2024001',
  message: 'Invoice payment',
});

// qrCode is a data URL - can be used in <img src={qrCode} />

// SEPA payment QR code
const sepaQR = await qrGenerator.generateSepaPaymentQR({
  beneficiaryName: 'My Company',
  iban: 'CZ1234567890123456789012',
  amount: 121,
  currency: 'EUR',
  remittanceInfo: 'Invoice INV-2024-0001',
});
```

### Expense Management

```typescript
import { ExpenseService } from '@vertigo/billing/services';

const expenseService = new ExpenseService(prisma);

// Create expense
const expense = await expenseService.createExpense({
  tenantId: 'tenant_123',
  description: 'Office Supplies',
  category: 'OFFICE_SUPPLIES',
  amount: 500,
  currency: 'CZK',
  date: new Date(),
  vendor: 'Office Depot',
  receiptUrl: 'https://storage.com/receipt.jpg',
  isTaxDeductible: true,
});

// Process receipt OCR
const ocrResult = await expenseService.processReceiptOcr(expense.receiptUrl!);
console.log(ocrResult);
// {
//   vendor: 'Office Depot',
//   totalAmount: 500,
//   confidence: 0.95,
//   ...
// }

// Approve expense
await expenseService.approveExpense(expense.id, 'user_123');

// Mark as reimbursed
await expenseService.markAsReimbursed(expense.id, 500);
```

## Database Schema Extension

Add these models to your Prisma schema:

```prisma
// See packages/database/prisma/schema-extension.prisma for full schema
```

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Bank integrations
FIO_API_TOKEN=...
PLAID_CLIENT_ID=...
PLAID_SECRET=...

# Payment gateways
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
GOPAY_GO_ID=...
GOPAY_CLIENT_ID=...
GOPAY_CLIENT_SECRET=...
```

## Supported Currencies

**Fiat:** CZK, EUR, USD, GBP, PLN, HUF, CHF, SEK, DKK, NOK, CAD, AUD, JPY, CNY

**Crypto:** BTC, ETH, USDC, USDT

## Supported Bank Providers

- **Fio** - Fio banka (Czech Republic)
- **Wise** - International transfers
- **Revolut** - Business accounts
- **Plaid** - US/EU bank connections
- **Nordigen** - Open Banking EU

## Supported Payment Gateways

- **Stripe** - Global card payments
- **PayPal** - PayPal checkout
- **GoPay** - Czech payment gateway
- **Adyen** - Enterprise payments
- **Coinbase Commerce** - Crypto payments
- **BTCPay Server** - Self-hosted crypto
- **Circle** - USDC payments

## License

MIT
