# Stripe Payments Integration - FitAdmin

## Přehled

Kompletní integrace Stripe platební brány pro fitness vertikálu. Podporuje platby za:
- **Balíčky kreditů** (Package purchases)
- **Faktury** (Invoice payments)
- **Jednotlivé tréninky** (Individual session payments)

## Komponenty

### Backend (API Routes)

#### 1. `/api/payments/create-checkout` (POST)
Vytvoří Stripe Checkout Session pro nákup balíčku kreditů.

**Request:**
```json
{
  "packageId": "clx...",
  "clientId": "clx..."
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

#### 2. `/api/payments/create-invoice-checkout` (POST)
Vytvoří Stripe Checkout Session pro platbu faktury.

**Request:**
```json
{
  "invoiceId": "clx..."
}
```

#### 3. `/api/payments/create-session-checkout` (POST)
Vytvoří Stripe Checkout Session pro platbu jednotlivého tréninku.

**Request:**
```json
{
  "sessionId": "clx..."
}
```

#### 4. `/api/payments/webhook` (POST)
Zpracovává Stripe webhook události:
- `checkout.session.completed` - Úspěšná platba
- `payment_intent.payment_failed` - Neúspěšná platba

**Webhook signature verification:** ✅ Implementováno

#### 5. `/api/payments/history` (GET)
Vrací historii plateb pro tenanta.

**Query params:**
- `limit` (default: 50)
- `offset` (default: 0)

#### 6. `/api/payments/verify` (POST)
Ověří status platby ze Stripe.

### Frontend (React komponenty)

#### `BuyPackageButton`
Tlačítko pro nákup balíčku kreditů.

```tsx
import { BuyPackageButton } from '@/components/payments/BuyPackageButton'

<BuyPackageButton
  packageId="clx..."
  clientId="clx..."
/>
```

#### `PayInvoiceButton`
Tlačítko pro platbu faktury.

```tsx
import { PayInvoiceButton } from '@/components/payments/PayInvoiceButton'

<PayInvoiceButton invoiceId="clx..." />
```

#### `PaySessionButton`
Tlačítko pro platbu jednotlivého tréninku.

```tsx
import { PaySessionButton } from '@/components/payments/PaySessionButton'

<PaySessionButton sessionId="clx..." />
```

#### `PaymentStatusBadge`
Badge zobrazující status platby.

```tsx
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge'

<PaymentStatusBadge status="paid" />
```

#### `PaymentMethodsCard`
Karta s přehledem dostupných platebních metod.

#### `RecentPaymentsTable`
Tabulka s nedávnými platbami.

### Utility funkce

#### Backend (`src/lib/stripe.ts`)
- `createPackageCheckoutSession()` - Vytvoří checkout pro balíček
- `createInvoiceCheckoutSession()` - Vytvoří checkout pro fakturu
- `createSessionCheckoutSession()` - Vytvoří checkout pro trénink
- `verifyWebhookSignature()` - Ověří Stripe webhook signature
- `getPaymentStatus()` - Získá status platby
- `refundPayment()` - Vrátí platbu
- `formatAmountForStripe()` - Konvertuje částku na Stripe formát (cents)
- `formatStripeAmount()` - Konvertuje ze Stripe formátu zpět

#### Frontend (`src/lib/stripe-client.ts`)
- `getStripe()` - Singleton Stripe instance
- `formatCurrency()` - Formátování měny pro zobrazení
- `redirectToCheckout()` - Přesměrování na Stripe Checkout

## Nastavení

### 1. Stripe API klíče

Přidejte do `.env`:

```env
# Stripe Secret Key (backend)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (z Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Stripe Webhook

1. Přejděte do [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Klikněte "Add endpoint"
3. URL: `https://your-domain.com/api/payments/webhook`
4. Vyberte události:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Zkopírujte **webhook signing secret** a přidejte do `.env` jako `STRIPE_WEBHOOK_SECRET`

### 3. Instalace dependencies

```bash
pnpm install stripe @stripe/stripe-js resend
```

Už je přidáno v `package.json`:
- `stripe@^17.5.0` - Stripe Node.js SDK
- `@stripe/stripe-js@^5.0.1` - Stripe JavaScript SDK
- `resend@^4.0.1` - Email služba pro potvrzovací emaily

## Workflow

### Package Purchase (Nákup balíčku)

1. Uživatel klikne na `BuyPackageButton`
2. Frontend volá `/api/payments/create-checkout`
3. Backend vytvoří Stripe Checkout Session s metadata:
   ```json
   {
     "packageId": "...",
     "clientId": "...",
     "tenantId": "...",
     "credits": "10",
     "type": "package"
   }
   ```
4. Uživatel je přesměrován na Stripe Checkout
5. Po úspěšné platbě Stripe volá webhook
6. Webhook handler:
   - Přidá kredity klientovi
   - Vytvoří Order záznam
   - Odešle potvrzovací email
7. Uživatel je přesměrován na `/dashboard/payments/success`

### Invoice Payment (Platba faktury)

1. Uživatel klikne na `PayInvoiceButton`
2. Frontend volá `/api/payments/create-invoice-checkout`
3. Backend vytvoří Stripe Checkout Session
4. Po platbě webhook:
   - Změní status faktury na `paid`
   - Vytvoří InvoicePayment záznam
   - Odešle potvrzovací email

### Session Payment (Platba tréninku)

1. Uživatel klikne na `PaySessionButton`
2. Frontend volá `/api/payments/create-session-checkout`
3. Po platbě webhook:
   - Označí session jako zaplacený
   - Odešle potvrzovací email

## Databázové změny

Webhook handler vytváří/upravuje tyto záznamy:

### Package Purchase
- `Client.creditsRemaining` - Inkrementuje kredity
- `Order` - Vytvoří nový záznam s platebními detaily

### Invoice Payment
- `Invoice.status` - Změní na `paid`
- `Invoice.paidDate` - Nastaví datum platby
- `InvoicePayment` - Vytvoří nový záznam

### Session Payment
- `Session.paid` - Nastaví na `true`
- `Session.price` - Uloží cenu

## Testování

### Test Mode
Stripe funguje v test režimu s klíči `sk_test_...` a `pk_test_...`.

### Testovací karty
- **Úspěšná platba:** `4242 4242 4242 4242`
- **Neúspěšná platba:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

CVC: Jakékoliv 3 číslice
Datum: Budoucí datum
ZIP: Jakýkoliv

### Testování webhooku lokálně

Použijte Stripe CLI:

```bash
stripe listen --forward-to localhost:3006/api/payments/webhook
```

Trigger testovací události:

```bash
stripe trigger checkout.session.completed
```

## Bezpečnost

### ✅ Implementováno

1. **Webhook Signature Verification** - Ověření, že webhook přišel skutečně ze Stripe
2. **Server-side validation** - Všechny platby jsou ověřeny na backendu
3. **Tenant isolation** - Každý tenant vidí pouze své platby
4. **No sensitive data in frontend** - Secret keys pouze na backendu
5. **Error handling** - Robustní error handling a logování

### Best Practices

- ❌ NIKDY neexponujte `STRIPE_SECRET_KEY` na frontendu
- ✅ Vždy ověřujte webhook signature
- ✅ Idempotentní zpracování webhooků (stejný event může přijít vícekrát)
- ✅ Logujte všechny payment events
- ✅ Posílejte potvrzovací emaily zákazníkům

## Email notifikace

Po každé úspěšné platbě je odeslán potvrzovací email přes Resend:

- **Package purchase:** Email s počtem přidaných kreditů
- **Invoice payment:** Email s číslem faktury a částkou
- **Session payment:** Email s datem tréninku

## Chybové stavy

### Payment Failed
- Webhook zachytí `payment_intent.payment_failed`
- Loguje chybu
- (Volitelně) Pošle email zákazníkovi

### Webhook Errors
- Neplatná signature → 400 Bad Request
- Chybějící metadata → Logování + skip
- Database error → Logování (platba proběhla, ale záznam nebyl vytvořen)

## Monitorování

### Stripe Dashboard
- Všechny platby jsou viditelné v Stripe Dashboard
- Refundy lze provést přímo z dashboardu
- Webhooks jsou logovány v sekci Developers → Webhooks

### Application Logs
Všechny payment události jsou logovány:
```
console.log(`Package payment processed: client ${clientId}, credits ${credits}`)
console.error('Error processing checkout.session.completed:', err)
```

## Produkční nasazení

### Checklist

- [ ] Změnit Stripe klíče z test na live (sk_live_..., pk_live_...)
- [ ] Nastavit webhook URL v live režimu
- [ ] Aktualizovat `STRIPE_WEBHOOK_SECRET` pro live webhook
- [ ] Otestovat celý flow v live režimu s malou částkou
- [ ] Nastavit email notifikace (RESEND_API_KEY)
- [ ] Zkontrolovat tax compliance (pokud relevantní)

## Další rozšíření

### Plánované funkce
- [ ] Apple Pay / Google Pay
- [ ] Bankovní převody (SEPA)
- [ ] Předplatné (subscriptions)
- [ ] Automatické faktury
- [ ] Payment links (pro platby mimo aplikaci)
- [ ] Refund management UI
- [ ] Payment analytics dashboard

## Podpora

Dokumentace Stripe:
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)
- [Security](https://stripe.com/docs/security)

---

**Status:** ✅ Production Ready
**Verze:** 1.0.0
**Poslední aktualizace:** 2025-01-26
