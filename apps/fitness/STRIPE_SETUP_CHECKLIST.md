# Stripe Setup Checklist - FitAdmin

Rychlý průvodce pro spuštění Stripe plateb v produkci.

## 1. Stripe Account Setup

- [ ] Vytvořte Stripe účet na [stripe.com](https://stripe.com)
- [ ] Dokončete KYC (Know Your Customer) proces
- [ ] Nastavte business details
- [ ] Přidejte bankovní účet pro výplaty

## 2. API Klíče

### Test Režim (Development)

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Live Režim (Production)

- [ ] Přepněte v Stripe Dashboard na "Live mode"
- [ ] Zkopírujte live API klíče
- [ ] Aktualizujte `.env.production`:

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

## 3. Webhook Nastavení

### Development (Local Testing)

1. Nainstalujte Stripe CLI:
```bash
# Windows (Scoop)
scoop install stripe

# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
```

2. Přihlaste se:
```bash
stripe login
```

3. Forward webhooks lokálně:
```bash
stripe listen --forward-to localhost:3006/api/payments/webhook
```

4. Zkopírujte webhook secret z výstupu:
```
> Ready! Your webhook signing secret is whsec_...
```

### Production

1. Přejděte do [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Klikněte "Add endpoint"
3. Nastavte:
   - **URL:** `https://your-domain.com/api/payments/webhook`
   - **Description:** "FitAdmin Payment Webhook"
   - **Events to send:**
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
     - `customer.created`
     - `customer.updated`
4. Zkopírujte **Signing secret** do `.env.production`

## 4. Email Notifikace (Resend)

- [ ] Vytvořte účet na [resend.com](https://resend.com)
- [ ] Přidejte a ověřte doménu
- [ ] Vytvořte API klíč
- [ ] Přidejte do `.env`:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="FitAdmin <noreply@yourdomain.com>"
```

## 5. Instalace Dependencies

```bash
cd apps/fitness
pnpm install
```

Zkontrolujte že máte:
- ✅ `stripe@^17.5.0`
- ✅ `@stripe/stripe-js@^5.0.1`
- ✅ `resend@^4.0.1`

## 6. Databáze

Ujistěte se že máte správné billing modely:

```bash
cd apps/fitness
pnpm prisma:generate
pnpm prisma:migrate
```

## 7. Testování

### Test platby

1. Spusťte aplikaci:
```bash
pnpm dev
```

2. Přihlaste se do aplikace
3. Přejděte na balíčky nebo faktury
4. Klikněte na "Koupit" / "Zaplatit"
5. Použijte testovací kartu: `4242 4242 4242 4242`
6. Zkontrolujte webhook log:
```bash
stripe listen --forward-to localhost:3006/api/payments/webhook
```

### Test Karty

- **Úspěšná platba:** `4242 4242 4242 4242`
- **Odmítnutá platba:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- **Nedostatek prostředků:** `4000 0000 0000 9995`

**CVC:** Jakékoliv 3 číslice
**Datum:** Budoucí datum
**ZIP:** Jakýkoliv

## 8. Monitoring

### Stripe Dashboard

- [ ] Nastavte email notifikace pro failed payments
- [ ] Nastavte daily/weekly reports
- [ ] Zkontrolujte webhook logs pravidelně

### Application Logs

Monitorujte tyto logy:
```
Successfully processed payment for client ...
Error processing checkout.session.completed: ...
Failed to send payment confirmation email: ...
```

## 9. Security Checklist

- [ ] ❌ NIKDY neexponujte `STRIPE_SECRET_KEY` na frontendu
- [ ] ✅ Webhook signature verification je zapnutá
- [ ] ✅ HTTPS v produkci
- [ ] ✅ Environment variables jsou v `.env.local` (ne v git)
- [ ] ✅ Rate limiting na API endpoints
- [ ] ✅ CORS nastavení

## 10. Production Deployment

- [ ] Nastavte live Stripe klíče
- [ ] Nastavte production webhook URL
- [ ] Otestujte platbu s malou částkou (10 Kč)
- [ ] Zkontrolujte že webhook funguje
- [ ] Zkontrolujte že email notifikace fungují
- [ ] Proveďte testovací refund
- [ ] Nastavte monitoring a alerty

## 11. Legal & Compliance

- [ ] Přidejte Terms of Service
- [ ] Přidejte Privacy Policy
- [ ] Přidejte Refund Policy
- [ ] Ujistěte se o GDPR compliance
- [ ] Nastavte správné tax handling (pokud relevantní)

## 12. Go Live Checklist

### Pre-Launch
- [ ] Všechny testy prošly
- [ ] Webhook funguje v produkci
- [ ] Email notifikace fungují
- [ ] Refundy testovány
- [ ] Error handling otestován
- [ ] Dokumentace aktuální

### Launch Day
- [ ] Monitoring aktivní
- [ ] Support team připraven
- [ ] Fallback plan (co když Stripe vypadne)
- [ ] Komunikace s klienty připravena

### Post-Launch (První týden)
- [ ] Denní kontrola webhook logs
- [ ] Kontrola failed payments
- [ ] Kontrola customer support tickets
- [ ] Performance monitoring

## Troubleshooting

### Webhook není doručen

1. Zkontrolujte webhook URL v Stripe Dashboard
2. Zkontrolujte že endpoint odpovídá 200 OK
3. Zkontrolujte firewall pravidla
4. Zkontrolujte application logs

### Platba proběhla ale kredity nepřidány

1. Zkontrolujte webhook logs
2. Zkontrolujte application logs
3. Manuálně přidejte kredity
4. Investigate proč webhook selhal

### Email se neodeslal

1. Zkontrolujte RESEND_API_KEY
2. Zkontrolujte že doména je ověřená
3. Zkontrolujte email logs
4. Zkuste poslat test email přes Resend Dashboard

## Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Resend Docs:** https://resend.com/docs
- **Our Docs:** `STRIPE_INTEGRATION.md`

## Emergency Contacts

- **Stripe Support:** support@stripe.com
- **Tech Lead:** [your-email]
- **On-call:** [phone]

---

Po dokončení tohoto checklistu je váš Stripe payments systém production-ready! 🚀
