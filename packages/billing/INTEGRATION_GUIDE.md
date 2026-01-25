# Integration Guide - @vertigo/billing

Complete guide for integrating the billing package into your VertiGo SaaS apps.

## Step 1: Install Dependencies

```bash
cd packages/billing
pnpm install
pnpm build
```

## Step 2: Update Database Schema

Add the billing models to your Prisma schema:

```bash
# Copy the schema extension
cat packages/billing/prisma-schema-extension.prisma >> packages/database/prisma/schema.prisma

# Generate Prisma client
cd packages/database
pnpm db:generate

# Create migration
pnpm db:migrate
```

## Step 3: Environment Variables

Add to your `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Fio Bank (Czech)
FIO_API_TOKEN=...

# Plaid (US/EU)
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENVIRONMENT=sandbox # or development, production
```

## Step 4: Add to App Dependencies

In your app's `package.json`:

```json
{
  "dependencies": {
    "@vertigo/billing": "workspace:*",
    "@vertigo/database": "workspace:*"
  }
}
```

## Step 5: Basic Setup

Create a billing service instance:

```typescript
// lib/billing/index.ts
import { PrismaClient } from '@prisma/client';
import {
  InvoiceService,
  PaymentService,
  CurrencyService,
  TaxService,
} from '@vertigo/billing/services';

const prisma = new PrismaClient();

export const billingServices = {
  invoice: new InvoiceService(prisma),
  payment: new PaymentService(prisma),
  currency: new CurrencyService(),
  tax: new TaxService(),
};
```

## Step 6: API Routes

### Create Invoice API

```typescript
// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { billingServices } from '@/lib/billing';
import { CreateInvoiceInputSchema } from '@vertigo/billing/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const input = CreateInvoiceInputSchema.parse(body);

    // Create invoice
    const invoice = await billingServices.invoice.createInvoice(input);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId required' },
        { status: 400 }
      );
    }

    const invoices = await billingServices.invoice.listInvoices({
      tenantId,
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('List invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to list invoices' },
      { status: 500 }
    );
  }
}
```

### Payment Intent API

```typescript
// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StripeClient } from '@vertigo/billing/integrations';

const stripe = new StripeClient({
  secretKey: process.env.STRIPE_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, invoiceId } = body;

    const result = await stripe.createCheckoutSession({
      amount,
      currency,
      invoiceId,
      description: `Payment for invoice ${invoiceId}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

### Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { StripeClient } from '@vertigo/billing/integrations';
import { billingServices } from '@/lib/billing';

const stripe = new StripeClient({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    const event = stripe.verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const invoiceId = paymentIntent.metadata.invoiceId;

        if (invoiceId) {
          await billingServices.invoice.markAsPaid(
            invoiceId,
            new Date(),
            'STRIPE',
            paymentIntent.id
          );
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        const sessionInvoiceId = session.metadata?.invoiceId;

        if (sessionInvoiceId) {
          await billingServices.invoice.markAsPaid(
            sessionInvoiceId,
            new Date(),
            'STRIPE',
            session.id
          );
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

### Bank Sync API

```typescript
// app/api/bank/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BankTransactionSyncService } from '@vertigo/billing/integrations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const syncService = new BankTransactionSyncService(prisma);

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json();

    const results = await syncService.syncAllAccounts(tenantId);

    const summary = {
      totalAccounts: results.length,
      successfulSyncs: results.filter(r => r.success).length,
      totalTransactionsImported: results.reduce((sum, r) => sum + r.transactionsImported, 0),
      totalTransactionsMatched: results.reduce((sum, r) => sum + r.transactionsMatched, 0),
    };

    return NextResponse.json({ results, summary });
  } catch (error) {
    console.error('Bank sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync bank accounts' },
      { status: 500 }
    );
  }
}
```

## Step 7: Frontend Components

### Invoice List

```typescript
// components/invoices/InvoiceList.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Invoice } from '@vertigo/billing/types';

export function InvoiceList({ tenantId }: { tenantId: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      const res = await fetch(`/api/invoices?tenantId=${tenantId}`);
      const data = await res.json();
      setInvoices(data);
      setLoading(false);
    }

    fetchInvoices();
  }, [tenantId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {invoices.map(invoice => (
        <div key={invoice.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-gray-600">{invoice.billingName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{invoice.total} {invoice.currency}</p>
              <span className={`text-xs px-2 py-1 rounded ${
                invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Payment Button

```typescript
// components/invoices/PaymentButton.tsx
'use client';

import { useState } from 'react';
import type { Invoice } from '@vertigo/billing/types';

export function PaymentButton({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: invoice.total,
          currency: invoice.currency,
          invoiceId: invoice.id,
        }),
      });

      const result = await res.json();

      if (result.success && result.gatewayUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.gatewayUrl;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || invoice.status === 'PAID'}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

## Step 8: Scheduled Tasks

### Daily Invoice Reminders

```typescript
// scripts/send-invoice-reminders.ts
import { PrismaClient } from '@prisma/client';
import { InvoiceReminderService } from '@vertigo/billing/services';

const prisma = new PrismaClient();
const reminderService = new InvoiceReminderService(prisma);

async function sendReminders() {
  // Get all active tenants
  const tenants = await prisma.tenant.findMany({
    where: { subscriptionTier: { not: 'FREE' } },
  });

  for (const tenant of tenants) {
    console.log(`Sending reminders for tenant ${tenant.name}...`);

    const result = await reminderService.sendDueReminders(tenant.id);

    console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
  }
}

sendReminders()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

Schedule with cron:
```bash
# Run daily at 9 AM
0 9 * * * node scripts/send-invoice-reminders.js
```

### Bank Transaction Sync

```typescript
// scripts/sync-bank-transactions.ts
import { PrismaClient } from '@prisma/client';
import { BankTransactionSyncService } from '@vertigo/billing/integrations';

const prisma = new PrismaClient();
const syncService = new BankTransactionSyncService(prisma);

async function syncAllTenants() {
  const tenants = await prisma.tenant.findMany({
    where: { subscriptionTier: { not: 'FREE' } },
  });

  for (const tenant of tenants) {
    console.log(`Syncing bank accounts for ${tenant.name}...`);

    const results = await syncService.syncAllAccounts(tenant.id);

    const total = results.reduce((sum, r) => sum + r.transactionsImported, 0);
    console.log(`Imported ${total} transactions`);
  }
}

syncAllTenants()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

## Step 9: Testing

```typescript
// __tests__/billing/invoice.test.ts
import { InvoiceService } from '@vertigo/billing/services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);

describe('Invoice Service', () => {
  it('should generate sequential invoice numbers', async () => {
    const num1 = await invoiceService.generateInvoiceNumber('tenant_123');
    const num2 = await invoiceService.generateInvoiceNumber('tenant_123');

    expect(num2).toBe(`INV-${new Date().getFullYear()}-0002`);
  });

  it('should calculate line item totals correctly', () => {
    const result = invoiceService.calculateLineItem(10, 100, 10, 21);

    expect(result.subtotal).toBe(900); // 10 * 100 - 10%
    expect(result.taxAmount).toBe(189); // 900 * 21%
    expect(result.total).toBe(1089);
  });
});
```

## Complete Integration Checklist

- [ ] Install dependencies
- [ ] Update Prisma schema
- [ ] Run migrations
- [ ] Add environment variables
- [ ] Create API routes for invoices
- [ ] Create API routes for payments
- [ ] Set up Stripe webhook
- [ ] Create frontend components
- [ ] Set up scheduled tasks
- [ ] Test invoice creation
- [ ] Test payment flow
- [ ] Test bank sync
- [ ] Test AI payment matching
- [ ] Deploy

## Support

For issues or questions:
- GitHub Issues: `vertigo-saas/issues`
- Documentation: `packages/billing/README.md`
- Examples: `packages/billing/examples/`
