# Quick Start - @vertigo/billing

Get up and running with the billing package in 10 minutes.

## 1. Install (2 minutes)

```bash
# Install dependencies
cd packages/billing
pnpm install

# Build package
pnpm build
```

## 2. Database Setup (3 minutes)

```bash
# Add schema extension to main schema
cat packages/billing/prisma-schema-extension.prisma >> packages/database/prisma/schema.prisma

# Generate Prisma client
cd packages/database
pnpm db:generate

# Create migration
pnpm db:migrate
```

## 3. Environment Variables (1 minute)

Create/update `.env`:

```env
# Minimum required
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...

# Optional for bank sync
FIO_API_TOKEN=...
```

## 4. Your First Invoice (2 minutes)

```typescript
// lib/billing.ts
import { PrismaClient } from '@prisma/client';
import { InvoiceService, TaxService } from '@vertigo/billing/services';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);
const taxService = new TaxService();

export async function createQuickInvoice() {
  const taxConfig = taxService.getTaxConfig('CZ', 'CZ', false);

  const invoice = await invoiceService.createInvoice({
    tenantId: 'your-tenant-id',
    type: 'STANDARD',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    seller: {
      name: 'Your Company',
      street: 'Your Street',
      city: 'Prague',
      postalCode: '110 00',
      country: 'CZ',
    },
    buyer: {
      name: 'Customer Name',
      street: 'Customer Street',
      city: 'Brno',
      postalCode: '602 00',
      country: 'CZ',
    },
    items: [
      {
        id: '1',
        description: 'Service',
        quantity: 1,
        unitPrice: 1000,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: 1000,
        taxAmount: 1000 * (taxConfig.rate / 100),
        total: 1000 * (1 + taxConfig.rate / 100),
      },
    ],
    subtotal: 1000,
    taxAmount: 1000 * (taxConfig.rate / 100),
    total: 1000 * (1 + taxConfig.rate / 100),
    currency: 'CZK',
    paymentTerm: 'NET_14',
  });

  console.log('Invoice created:', invoice.invoiceNumber);
  return invoice;
}
```

## 5. Payment Integration (2 minutes)

```typescript
// app/api/payments/route.ts
import { StripeClient } from '@vertigo/billing/integrations';

const stripe = new StripeClient({
  secretKey: process.env.STRIPE_SECRET_KEY!,
});

export async function POST(req: Request) {
  const { invoiceId, amount, currency } = await req.json();

  const result = await stripe.createCheckoutSession({
    amount,
    currency,
    invoiceId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
  });

  return Response.json(result);
}
```

## Done!

You now have:
- ✅ Invoice creation with tax calculation
- ✅ Payment processing via Stripe
- ✅ Multi-currency support
- ✅ Type-safe API

## Next Steps

### Add Bank Sync
```typescript
import { BankTransactionSyncService } from '@vertigo/billing/integrations';

const syncService = new BankTransactionSyncService(prisma);
await syncService.syncAllAccounts(tenantId);
```

### Add AI Matching
```typescript
import { AIPaymentMatcher } from '@vertigo/billing/ai';

const matcher = new AIPaymentMatcher(process.env.OPENAI_API_KEY!);
const matches = await matcher.findMatches(transaction, unpaidInvoices);
```

### Add Recurring Invoices
```typescript
import { RecurringInvoiceService } from '@vertigo/billing/services';

const recurringService = new RecurringInvoiceService(prisma);
await recurringService.createTemplate({...});
```

## Common Use Cases

### Musicians (Gigs)
See: `examples/musicians-billing.ts`

### Photography (Packages)
See: `examples/photography-billing.ts`

### Fitness (Subscriptions)
See: `examples/fitness-subscription.ts`

## Need Help?

- 📖 Full docs: `README.md`
- 🔧 Integration guide: `INTEGRATION_GUIDE.md`
- 💡 Examples: `examples/`
- 🐛 Issues: GitHub Issues

## Tips

1. **Start simple** - Create basic invoices first, add features later
2. **Use types** - Full TypeScript support helps catch errors
3. **Test in sandbox** - Use Stripe test mode initially
4. **Check examples** - Real-world examples for each vertical
5. **Read docs** - Comprehensive documentation available

Happy billing! 💰
