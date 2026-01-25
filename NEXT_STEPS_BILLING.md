# Billing Integration - Další kroky

## 🚀 Okamžité akce (Povinné)

### 1. Instalace dependencies
```bash
# Z root složky projektu
pnpm install
```

### 2. Build billing package
```bash
cd packages/billing
pnpm build
cd ../..
```

### 3. Generate Prisma clients
```bash
# Musicians app
cd apps/musicians
pnpm prisma generate

# Fitness app
cd ../fitness
pnpm prisma generate

cd ../..
```

### 4. Migrace databáze
```bash
# Musicians app
cd apps/musicians
pnpm prisma migrate dev --name add_billing_integration

# Fitness app
cd ../fitness
pnpm prisma migrate dev --name add_billing_integration

cd ../..
```

---

## 📋 Verifikace integrace

### Test 1: Spuštění dev serveru
```bash
# Musicians
cd apps/musicians
pnpm dev
# Otevři http://localhost:3007/dashboard/billing

# Fitness
cd apps/fitness
pnpm dev
# Otevři http://localhost:3006/dashboard/billing
```

### Test 2: API endpoints
```bash
# Test invoice API
curl http://localhost:3007/api/billing/invoices

# Test payments API
curl http://localhost:3007/api/billing/payments

# Test bank accounts API
curl http://localhost:3007/api/billing/bank-accounts
```

---

## 🎨 Rozšíření UI (Volitelné)

### Vytvořit detail stránky faktur
```
apps/musicians/src/app/(dashboard)/dashboard/billing/invoices/
├── page.tsx         - List všech faktur
├── [id]/page.tsx    - Detail faktury
└── new/page.tsx     - Vytvoření nové faktury
```

### Vytvořit správu plateb
```
apps/musicians/src/app/(dashboard)/dashboard/billing/payments/
└── page.tsx         - List všech plateb + filtrování
```

### Vytvořit správu bankovních účtů
```
apps/musicians/src/app/(dashboard)/dashboard/billing/bank-accounts/
└── page.tsx         - Správa účtů + sync transakcí
```

### Vytvořit nastavení platebních bran
```
apps/musicians/src/app/(dashboard)/dashboard/billing/settings/
└── page.tsx         - Konfigurace Stripe, PayPal, etc.
```

---

## 🔧 Konfigurace (Důležité)

### Environment Variables

**Přidat do `.env`:**
```env
# Stripe (pokud chceš přijímat platby kartou)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# FIO Bank (pokud chceš sync bank transakcí z FIO)
FIO_API_TOKEN=...

# Plaid (pokud chceš sync z jiných bank)
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox

# PayPal (volitelné)
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
```

### Stripe Webhook Setup

1. Registruj webhook endpoint v Stripe Dashboard:
   ```
   https://your-domain.com/api/billing/webhooks/stripe
   ```

2. Subscribe to events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

3. Zkopíruj webhook secret do `.env`

---

## 💡 Využití billing services

### Příklad: Vytvoření faktury s AI matching

```typescript
import { InvoiceService } from '@vertigo/billing/services';
import { PaymentMatcher } from '@vertigo/billing/ai';
import { prisma } from '@/lib/prisma';

// Create invoice
const invoiceService = new InvoiceService(prisma);
const invoice = await invoiceService.createInvoice({
  customerId: 'customer-id',
  items: [
    { description: 'Service', quantity: 1, unitPrice: 1000 }
  ],
  dueDate: new Date('2025-02-28'),
  currency: 'CZK',
});

// Later, match bank transaction to invoice
const matcher = new PaymentMatcher();
const matches = await matcher.matchTransaction({
  amount: 1000,
  description: 'Payment for invoice INV-2025-0001',
  date: new Date(),
}, [invoice]);

console.log('Match confidence:', matches[0].confidence);
```

### Příklad: Bank sync s FIO

```typescript
import { BankTransactionSync } from '@vertigo/billing/integrations';
import { prisma } from '@/lib/prisma';

const sync = new BankTransactionSync(prisma);

// Sync transactions from FIO Bank
await sync.syncBankAccount({
  accountId: 'bank-account-id',
  provider: 'FIO',
  credentials: {
    token: process.env.FIO_API_TOKEN,
  },
});

// Auto-match transactions to invoices
await sync.matchTransactions('tenant-id');
```

---

## 📊 Reporting & Analytics (Další fáze)

### Revenue Dashboard
- Měsíční přehled příjmů
- Graf vývoje plateb
- Top 10 klientů podle revenue
- Průměrná doba splatnosti

### Cash Flow Prediction
- AI-powered predikce budoucích příjmů
- Identifikace rizikových faktur
- Doporučení na zlepšení cash flow

### Expense Tracking
- Kategorizace výdajů
- Tax-deductible expenses reporting
- Profit & Loss statements

---

## 🔐 Security Checklist

- [ ] Webhook signature verification (Stripe)
- [ ] Bank credentials encryption
- [ ] Payment gateway API keys v .env (ne v kódu)
- [ ] Rate limiting na API routes
- [ ] CSRF protection na webhooks
- [ ] Input validation na všech endpoints
- [ ] Audit log pro všechny transakce

---

## 🧪 Testing

### Unit testy pro services
```bash
cd packages/billing
pnpm test
```

### Integration testy
```typescript
// Test invoice creation
test('creates invoice with correct total', async () => {
  const invoice = await invoiceService.createInvoice({
    customerId: 'test',
    items: [{ description: 'Test', quantity: 1, unitPrice: 1000 }],
    taxRate: 0.21,
  });

  expect(invoice.totalAmount).toBe(1210);
});

// Test payment matching
test('matches payment to invoice', async () => {
  const matches = await paymentMatcher.matchTransaction(
    { amount: 1210, description: 'INV-001' },
    [invoice]
  );

  expect(matches[0].confidence).toBeGreaterThan(0.8);
});
```

---

## 📚 Dokumentace

### Pro vývojáře
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Billing service usage examples
- [ ] Webhook integration guide
- [ ] Database schema diagram

### Pro uživatele
- [ ] How to create invoices
- [ ] How to record payments
- [ ] How to set up bank sync
- [ ] How to configure payment gateways

---

## 🎯 Roadmap

### Phase 1: Core Billing ✅
- [x] Invoice management
- [x] Payment tracking
- [x] Bank accounts
- [x] Basic dashboard

### Phase 2: Integrations (Příští)
- [ ] Stripe payment processing
- [ ] FIO Bank transaction sync
- [ ] PayPal integration
- [ ] Crypto wallet setup

### Phase 3: Advanced Features
- [ ] Recurring invoices automation
- [ ] AI payment prediction
- [ ] Multi-currency invoicing
- [ ] Expense management UI

### Phase 4: Reporting
- [ ] Revenue analytics
- [ ] Cash flow prediction
- [ ] Tax reporting
- [ ] Profit & Loss statements

---

## 💬 Support

**Dokumentace:**
- Billing Package README: `packages/billing/README.md`
- Integration Guide: `packages/billing/INTEGRATION_GUIDE.md`
- Quick Start: `packages/billing/QUICK_START.md`

**Examples:**
- Musicians billing: `packages/billing/examples/musicians-billing.ts`
- Fitness subscription: `packages/billing/examples/fitness-subscription.ts`
- Bank sync: `packages/billing/examples/bank-sync-matching.ts`

---

**Status:** ✅ Ready for development
**Next:** Run `pnpm install` a pokračuj podle kroků výše
