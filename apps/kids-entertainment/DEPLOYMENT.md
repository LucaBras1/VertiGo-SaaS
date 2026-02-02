# PartyPal - Deployment Guide

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15+ database
- Stripe account with API keys
- Resend account for email
- (Optional) OpenAI API key for AI features

## Environment Variables

Create a `.env` file with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/partypal?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="https://your-domain.com"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Email (Resend)
RESEND_API_KEY="re_..."
```

### Optional Variables

```env
# AI Features (fallback mode if not set)
OPENAI_API_KEY="sk-..."
```

## Database Setup

### 1. Create Database

```bash
createdb partypal
```

### 2. Run Migrations

```bash
cd apps/kids-entertainment
npx prisma migrate deploy
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. (Optional) Seed Initial Data

```bash
npx prisma db seed
```

## Build & Deploy

### Local Build Test

```bash
# Install dependencies
pnpm install

# Build
pnpm --filter @vertigo/partypal build
```

### Production Build

```bash
# Set memory limit for large builds
export NODE_OPTIONS="--max-old-space-size=4096"

# Build
pnpm --filter @vertigo/partypal build
```

## VPS Deployment (PM2)

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'partypal',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/path/to/vertigo-saas/apps/kids-entertainment',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

### 3. Start Application

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Stripe Webhook Setup

### 1. Create Webhook Endpoint

In Stripe Dashboard, create a webhook endpoint:
- URL: `https://your-domain.com/api/payments/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `invoice.paid`

### 2. Get Webhook Secret

Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET`.

### 3. Test Webhook

```bash
stripe listen --forward-to localhost:3002/api/payments/webhook
```

## Cron Jobs

### Party Reminders (24h before)

Set up a cron job to call the party reminders endpoint:

```bash
# Run every hour
0 * * * * curl -X POST https://your-domain.com/api/cron/party-reminders -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use a service like:
- Vercel Cron
- Railway Cron
- GitHub Actions scheduled workflow

## Apache Reverse Proxy

### Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName partypal.your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3002/
    ProxyPassReverse / http://localhost:3002/

    ErrorLog ${APACHE_LOG_DIR}/partypal-error.log
    CustomLog ${APACHE_LOG_DIR}/partypal-access.log combined
</VirtualHost>
```

### SSL with Certbot

```bash
certbot --apache -d partypal.your-domain.com
```

## Health Check

The application exposes a health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": true,
    "stripe": true,
    "email": true
  }
}
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs partypal
```

### Log Files

- Application logs: `~/.pm2/logs/partypal-out.log`
- Error logs: `~/.pm2/logs/partypal-error.log`

## Troubleshooting

### Build Failures

**JavaScript heap out of memory**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Prisma Client not generated**
```bash
cd apps/kids-entertainment
npx prisma generate
```

### Runtime Issues

**Database connection failed**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check network/firewall rules

**Stripe webhook signature verification failed**
- Verify STRIPE_WEBHOOK_SECRET matches dashboard
- Check webhook URL is correct
- Ensure request body is raw (not parsed)

**Emails not sending**
- Verify RESEND_API_KEY is valid
- Check Resend dashboard for errors
- Verify sender domain is verified

### AI Features Not Working

AI features have a fallback mode. If OPENAI_API_KEY is not set or invalid:
- Safety checker uses rule-based recommendations
- Theme suggester uses predefined suggestions
- Age optimizer uses static rules

## Backup & Recovery

### Database Backup

```bash
pg_dump -Fc partypal > partypal_backup_$(date +%Y%m%d).dump
```

### Database Restore

```bash
pg_restore -d partypal partypal_backup_YYYYMMDD.dump
```

## Updates

### Zero-Downtime Deployment

```bash
git pull
pnpm install
pnpm --filter @vertigo/partypal build
pm2 reload partypal
```

### Database Migrations

```bash
npx prisma migrate deploy
pm2 reload partypal
```
