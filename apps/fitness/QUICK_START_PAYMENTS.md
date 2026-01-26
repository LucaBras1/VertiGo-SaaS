# Quick Start - Stripe Payments

Rychlý návod jak zprovoznit Stripe platby za 5 minut.

## 1. Install Dependencies (1 min)

```bash
cd apps/fitness
pnpm install
```

Tím nainstalujete:
- `stripe@^17.5.0` - Backend SDK
- `@stripe/stripe-js@^5.0.1` - Frontend SDK
- `resend@^4.0.1` - Email notifikace

## 2. Setup Stripe Account (2 min)

1. Jděte na [stripe.com](https://stripe.com) a vytvořte účet
2. V dashboardu přejděte na **Developers → API Keys**
3. Zkopírujte:
   - **Publishable key** (začíná `pk_test_`)
   - **Secret key** (začíná `sk_test_`)

## 3. Setup Environment Variables (1 min)

Vytvořte `.env.local` v `apps/fitness/`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Webhook Secret (získáme v kroku 4)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Email (volitelné pro test)
RESEND_API_KEY=re_YOUR_KEY_HERE
EMAIL_FROM="FitAdmin <noreply@fitadmin.app>"
```

## 4. Setup Webhook (1 min)

### Lokální testing s Stripe CLI

```bash
# Install Stripe CLI (Windows - Scoop)
scoop install stripe

# Přihlásit se
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3006/api/payments/webhook
```

Zkopírujte webhook secret z výstupu:
```
> Ready! Your webhook signing secret is whsec_...
```

A přidejte do `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. Start Application (30 sec)

```bash
# Terminal 1: App
pnpm dev

# Terminal 2: Webhook forwarding
stripe listen --forward-to localhost:3006/api/payments/webhook
```

## 6. Test Payment (30 sec)

1. Otevřete [localhost:3006](http://localhost:3006)
2. Přihlaste se
3. Jděte na **Dashboard → Packages** (nebo vytvořte package)
4. Klikněte na **"Buy Package"**
5. Použijte testovací kartu:
   - **Number:** `4242 4242 4242 4242`
   - **MM/YY:** `12/34` (budoucí datum)
   - **CVC:** `123`
   - **ZIP:** `12345`
6. Klikněte "Pay"

## ✅ Hotovo!

Měli byste vidět:
- ✅ Redirect na success page
- ✅ Kredity přidány klientovi
- ✅ Order vytvořen v databázi
- ✅ Webhook event v terminálu 2
- ✅ (Pokud je Resend) Email odeslán

---

## Troubleshooting

### Webhook není doručen

**Problém:** Platba proběhla, ale kredity nepřidány.

**Řešení:**
1. Zkontrolujte že běží `stripe listen`
2. Zkontrolujte že webhook secret je v `.env.local`
3. Zkontrolujte terminal 2 pro webhook logs

### "Invalid API Key"

**Problém:** Chyba při vytváření platby.

**Řešení:**
1. Zkontrolujte že `STRIPE_SECRET_KEY` začíná `sk_test_`
2. Zkontrolujte že není trailing whitespace
3. Restart dev serveru po změně `.env.local`

### Email se neodeslal

**Problém:** Platba proběhla, ale žádný email.

**Řešení:**
1. Email je volitelný - platba funguje i bez něj
2. Pro testování použijte [Resend](https://resend.com) free tier
3. Zkontrolujte `RESEND_API_KEY` v `.env.local`

---

## Next Steps

- 📖 Přečtěte si [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md) pro detailní dokumentaci
- 🚀 Pro production setup následujte [STRIPE_SETUP_CHECKLIST.md](./STRIPE_SETUP_CHECKLIST.md)
- 💡 Customizujte payment komponenty v `src/components/payments/`

---

## Test Cards Reference

| Použití | Číslo karty | Výsledek |
|---------|-------------|----------|
| Úspěšná platba | `4242 4242 4242 4242` | ✅ Success |
| Odmítnutá | `4000 0000 0000 0002` | ❌ Card declined |
| 3D Secure | `4000 0025 0000 3155` | 🔐 Requires auth |
| Nedostatek prostředků | `4000 0000 0000 9995` | ❌ Insufficient funds |

**Pro všechny karty:**
- CVC: Jakékoliv 3 číslice
- Datum: Budoucí datum
- ZIP: Jakýkoliv

---

**Ready to accept payments!** 💳
