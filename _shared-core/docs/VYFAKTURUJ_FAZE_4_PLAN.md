# Vyfakturuj Fáze 4: Rozšířené Funkce

Detailní implementační plán pro pokročilé funkce Vyfakturuj integrace.

**Odhadovaná náročnost**: 3-5 dní
**Priorita**: Střední (nice-to-have, zvyšuje automatizaci)

---

## Obsah

1. [Webhooks pro Platby](#1-webhooks-pro-platby)
2. [Automatická Synchronizace](#2-automatická-synchronizace)
3. [QR Kódy pro Platby](#3-qr-kódy-pro-platby)
4. [Upomínky po Splatnosti](#4-upomínky-po-splatnosti)
5. [Hromadné Operace](#5-hromadné-operace)
6. [Dashboard a Reporty](#6-dashboard-a-reporty)

---

## 1. Webhooks pro Platby

### Popis
Automatický příjem notifikací z Vyfakturuj při úhradě faktury.

### Implementace

#### 1.1 Webhook Endpoint

**Soubor**: `src/app/api/webhooks/vyfakturuj/route.ts`

```typescript
/**
 * Vyfakturuj Webhook Handler
 *
 * POST /api/webhooks/vyfakturuj
 *
 * Přijímá notifikace o:
 * - Úhradě faktury
 * - Změně stavu faktury
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const signature = headersList.get('X-Vyfakturuj-Signature')
    const payload = await request.text()

    // Get webhook secret from settings
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' }
    })

    if (!settings?.webhookSecret) {
      console.error('Webhook secret not configured')
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    // Verify signature
    if (signature && !verifySignature(payload, signature, settings.webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(payload)

    // Handle different event types
    switch (data.event) {
      case 'invoice.paid':
        await handleInvoicePaid(data.invoice)
        break
      case 'invoice.updated':
        await handleInvoiceUpdated(data.invoice)
        break
      default:
        console.log('Unknown webhook event:', data.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleInvoicePaid(invoiceData: any) {
  // Find local invoice by vyfakturujId
  const invoice = await prisma.invoice.findFirst({
    where: { vyfakturujId: invoiceData.id }
  })

  if (!invoice) {
    console.log('Invoice not found for Vyfakturuj ID:', invoiceData.id)
    return
  }

  // Update local invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'paid',
      paidDate: new Date(invoiceData.date_paid),
      paidAmount: Math.round(parseFloat(invoiceData.total) * 100),
      vyfakturujFlags: invoiceData.flags,
      vyfakturujSyncedAt: new Date()
    }
  })

  // Optional: Send notification, update order status, etc.
  console.log('Invoice marked as paid:', invoice.invoiceNumber)
}

async function handleInvoiceUpdated(invoiceData: any) {
  // Sync invoice status
  const invoice = await prisma.invoice.findFirst({
    where: { vyfakturujId: invoiceData.id }
  })

  if (invoice) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        vyfakturujFlags: invoiceData.flags,
        vyfakturujSyncedAt: new Date()
      }
    })
  }
}
```

#### 1.2 Schema Rozšíření

**Soubor**: `prisma/schema.prisma`

```prisma
model VyfakturujSettings {
  // ... existing fields
  webhookSecret    String?   // Secret pro ověření webhook podpisu
  webhookUrl       String?   // URL pro nastavení ve Vyfakturuj
}

model WebhookLog {
  id          String   @id @default(cuid())
  event       String
  payload     Json
  status      String   // 'success' | 'error'
  error       String?
  processedAt DateTime @default(now())

  @@index([event])
  @@index([processedAt])
}
```

#### 1.3 Settings UI

Přidat do settings stránky:
- Generování webhook URL
- Zobrazení webhook secret
- Návod na nastavení ve Vyfakturuj
- Log posledních webhook eventů

### Úkoly

- [ ] Vytvořit webhook endpoint
- [ ] Přidat webhookSecret do schema
- [ ] Vytvořit WebhookLog model
- [ ] Migrace databáze
- [ ] Přidat UI pro webhook konfiguraci
- [ ] Dokumentace pro nastavení ve Vyfakturuj

---

## 2. Automatická Synchronizace

### Popis
Automatické akce při změnách v systému.

### Implementace

#### 2.1 Event System

**Soubor**: `src/lib/events/invoice-events.ts`

```typescript
/**
 * Invoice Event Handlers
 * Automatické akce při změnách faktur a objednávek
 */

import { prisma } from '@/lib/prisma'
import { syncInvoiceStatus } from '@/lib/vyfakturuj/invoice-sync'

// Typy eventů
export type InvoiceEvent =
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.sent'
  | 'order.confirmed'
  | 'order.completed'

interface EventHandler {
  (data: any): Promise<void>
}

const handlers: Record<InvoiceEvent, EventHandler[]> = {
  'invoice.created': [],
  'invoice.paid': [
    // Aktualizovat stav objednávky na 'completed'
    async (data) => {
      if (data.orderId) {
        await prisma.order.update({
          where: { id: data.orderId },
          data: { status: 'completed' }
        })
      }
    }
  ],
  'invoice.sent': [],
  'order.confirmed': [
    // Automaticky vytvořit proforma fakturu
    async (data) => {
      const settings = await prisma.vyfakturujSettings.findFirst({
        where: { id: 'singleton' }
      })

      if (settings?.autoCreateProforma) {
        // createInvoiceFromOrder(data.orderId, { type: 'proforma' })
      }
    }
  ],
  'order.completed': []
}

export async function emitEvent(event: InvoiceEvent, data: any) {
  const eventHandlers = handlers[event] || []

  for (const handler of eventHandlers) {
    try {
      await handler(data)
    } catch (error) {
      console.error(`Event handler error for ${event}:`, error)
    }
  }
}

export function registerHandler(event: InvoiceEvent, handler: EventHandler) {
  if (!handlers[event]) {
    handlers[event] = []
  }
  handlers[event].push(handler)
}
```

#### 2.2 Cron Job pro Sync

**Soubor**: `src/app/api/cron/sync-invoices/route.ts`

```typescript
/**
 * Cron Job: Sync Invoice Statuses
 *
 * Volat periodicky (např. každou hodinu) přes Vercel Cron nebo externí službu
 */

import { NextResponse } from 'next/server'
import { syncAllInvoicesStatus } from '@/lib/vyfakturuj/invoice-sync'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncAllInvoicesStatus()

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

#### 2.3 Vercel Cron Config

**Soubor**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-invoices",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Úkoly

- [ ] Vytvořit event system
- [ ] Implementovat handlery pro eventy
- [ ] Vytvořit cron endpoint
- [ ] Nastavit Vercel Cron
- [ ] Přidat autoCreateProforma do settings
- [ ] UI pro konfiguraci automatizace

---

## 3. QR Kódy pro Platby

### Popis
Generování QR kódů ve formátu SPAYD pro rychlé platby.

### Implementace

#### 3.1 QR Code Generator

**Soubor**: `src/lib/qr-payment.ts`

```typescript
/**
 * QR Payment Code Generator
 * Generuje SPAYD QR kódy pro platby
 */

import QRCode from 'qrcode'

interface PaymentData {
  accountNumber: string  // IBAN nebo číslo účtu
  amount: number         // Částka v CZK
  variableSymbol?: string
  constantSymbol?: string
  specificSymbol?: string
  message?: string
  currency?: string
}

/**
 * Generuje SPAYD string pro QR kód
 */
export function generateSpaydString(data: PaymentData): string {
  const parts = ['SPD*1.0']

  // Account - preferovat IBAN
  if (data.accountNumber.startsWith('CZ')) {
    parts.push(`ACC:${data.accountNumber}`)
  } else {
    // Převést české číslo účtu na IBAN formát
    parts.push(`ACC:${data.accountNumber}`)
  }

  // Amount
  parts.push(`AM:${data.amount.toFixed(2)}`)

  // Currency
  parts.push(`CC:${data.currency || 'CZK'}`)

  // Symbols
  if (data.variableSymbol) {
    parts.push(`X-VS:${data.variableSymbol}`)
  }
  if (data.constantSymbol) {
    parts.push(`X-KS:${data.constantSymbol}`)
  }
  if (data.specificSymbol) {
    parts.push(`X-SS:${data.specificSymbol}`)
  }

  // Message
  if (data.message) {
    parts.push(`MSG:${data.message.substring(0, 60)}`)
  }

  return parts.join('*')
}

/**
 * Generuje QR kód jako Data URL (base64)
 */
export async function generateQRCodeDataUrl(data: PaymentData): Promise<string> {
  const spaydString = generateSpaydString(data)

  return QRCode.toDataURL(spaydString, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 200,
    margin: 2
  })
}

/**
 * Generuje QR kód jako SVG string
 */
export async function generateQRCodeSvg(data: PaymentData): Promise<string> {
  const spaydString = generateSpaydString(data)

  return QRCode.toString(spaydString, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    width: 200,
    margin: 2
  })
}
```

#### 3.2 API Endpoint

**Soubor**: `src/app/api/admin/invoices/[id]/qr/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQRCodeDataUrl, generateQRCodeSvg } from '@/lib/qr-payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const format = request.nextUrl.searchParams.get('format') || 'dataurl'

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Get payment settings
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' }
    })

    if (!settings?.supplierIban && !settings?.supplierBankAccount) {
      return NextResponse.json({ error: 'Bank account not configured' }, { status: 400 })
    }

    const paymentData = {
      accountNumber: settings.supplierIban || settings.supplierBankAccount!,
      amount: (invoice.totalAmount || 0) / 100,
      variableSymbol: invoice.vyfakturujVS?.toString() || invoice.variableSymbol,
      message: `Faktura ${invoice.invoiceNumber}`
    }

    if (format === 'svg') {
      const svg = await generateQRCodeSvg(paymentData)
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
      })
    } else {
      const dataUrl = await generateQRCodeDataUrl(paymentData)
      return NextResponse.json({ qrCode: dataUrl })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
  }
}
```

#### 3.3 UI Komponenta

**Soubor**: `src/components/admin/invoices/PaymentQRCode.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { QrCode } from 'lucide-react'

interface PaymentQRCodeProps {
  invoiceId: string
  amount: number
  variableSymbol?: string
}

export function PaymentQRCode({ invoiceId, amount, variableSymbol }: PaymentQRCodeProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadQRCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/qr`)
      const data = await response.json()
      if (data.qrCode) {
        setQrCode(data.qrCode)
      }
    } catch (error) {
      console.error('Failed to load QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="h-5 w-5 text-gray-400" />
        <h3 className="font-medium text-gray-900">QR Platba</h3>
      </div>

      {qrCode ? (
        <div className="text-center">
          <img src={qrCode} alt="QR kód pro platbu" className="mx-auto" />
          <p className="text-xs text-gray-500 mt-2">
            Naskenujte v bankovní aplikaci
          </p>
        </div>
      ) : (
        <button
          onClick={loadQRCode}
          disabled={loading}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Generuji...' : 'Zobrazit QR kód'}
        </button>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>Částka: <strong>{(amount / 100).toLocaleString('cs-CZ')} Kč</strong></p>
        {variableSymbol && <p>VS: <strong>{variableSymbol}</strong></p>}
      </div>
    </div>
  )
}
```

### Úkoly

- [ ] Nainstalovat `qrcode` package
- [ ] Vytvořit QR generator utility
- [ ] Vytvořit API endpoint
- [ ] Vytvořit UI komponentu
- [ ] Přidat do detailu faktury
- [ ] Přidat QR do PDF (volitelné)

---

## 4. Upomínky po Splatnosti

### Popis
Automatické odesílání upomínek pro nezaplacené faktury po splatnosti.

### Implementace

#### 4.1 Schema Rozšíření

```prisma
model VyfakturujSettings {
  // ... existing fields

  // Reminder settings
  enableReminders       Boolean  @default(false)
  reminder1Days         Int      @default(7)   // Dní po splatnosti
  reminder2Days         Int      @default(14)
  reminder3Days         Int      @default(30)
  reminderEmailSubject  String?
  reminderEmailTemplate String?  // HTML template
}

model Invoice {
  // ... existing fields

  reminder1SentAt  DateTime?
  reminder2SentAt  DateTime?
  reminder3SentAt  DateTime?
}
```

#### 4.2 Reminder Service

**Soubor**: `src/lib/vyfakturuj/reminder-service.ts`

```typescript
/**
 * Invoice Reminder Service
 * Automatické odesílání upomínek
 */

import { prisma } from '@/lib/prisma'
import { getVyfakturujClient } from './index'

interface ReminderResult {
  sent: number
  errors: number
  details: Array<{
    invoiceId: string
    invoiceNumber: string
    reminderLevel: 1 | 2 | 3
    success: boolean
    error?: string
  }>
}

export async function processReminders(): Promise<ReminderResult> {
  const result: ReminderResult = { sent: 0, errors: 0, details: [] }

  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' }
  })

  if (!settings?.enableReminders) {
    return result
  }

  const now = new Date()

  // Find overdue unpaid invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['sent', 'overdue'] },
      dueDate: { lt: now },
      vyfakturujId: { not: null }
    },
    include: { customer: true }
  })

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor(
      (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    let reminderLevel: 1 | 2 | 3 | null = null

    // Determine which reminder to send
    if (daysOverdue >= settings.reminder3Days && !invoice.reminder3SentAt) {
      reminderLevel = 3
    } else if (daysOverdue >= settings.reminder2Days && !invoice.reminder2SentAt) {
      reminderLevel = 2
    } else if (daysOverdue >= settings.reminder1Days && !invoice.reminder1SentAt) {
      reminderLevel = 1
    }

    if (reminderLevel && invoice.customer?.email) {
      try {
        // Send reminder via Vyfakturuj
        const client = await getVyfakturujClient()
        await client.sendReminder(invoice.vyfakturujId!, reminderLevel)

        // Update invoice
        const updateData: any = {}
        updateData[`reminder${reminderLevel}SentAt`] = now

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: updateData
        })

        result.sent++
        result.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reminderLevel,
          success: true
        })
      } catch (error) {
        result.errors++
        result.details.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          reminderLevel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  return result
}
```

#### 4.3 Cron Endpoint

**Soubor**: `src/app/api/cron/send-reminders/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { processReminders } from '@/lib/vyfakturuj/reminder-service'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processReminders()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
```

### Úkoly

- [ ] Rozšířit schema o reminder fields
- [ ] Migrace databáze
- [ ] Implementovat reminder service
- [ ] Přidat sendReminder do VyfakturujClient
- [ ] Vytvořit cron endpoint
- [ ] UI pro konfiguraci upomínek
- [ ] Přidat do Vercel Cron

---

## 5. Hromadné Operace

### Popis
Bulk operace pro efektivnější správu faktur.

### Implementace

#### 5.1 Bulk Create Invoices

**Soubor**: `src/app/api/admin/invoices/bulk-create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createInvoiceFromOrder } from '@/lib/vyfakturuj/invoice-sync'

export async function POST(request: NextRequest) {
  try {
    const { orderIds, options } = await request.json()

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'No orders specified' }, { status: 400 })
    }

    const results = {
      success: 0,
      errors: 0,
      details: [] as Array<{
        orderId: string
        success: boolean
        invoiceNumber?: string
        error?: string
      }>
    }

    for (const orderId of orderIds) {
      try {
        const result = await createInvoiceFromOrder(orderId, options)

        if (result.success) {
          results.success++
          results.details.push({
            orderId,
            success: true,
            invoiceNumber: result.vyfakturujNumber
          })
        } else {
          results.errors++
          results.details.push({
            orderId,
            success: false,
            error: result.message
          })
        }
      } catch (error) {
        results.errors++
        results.details.push({
          orderId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Bulk create failed' }, { status: 500 })
  }
}
```

#### 5.2 UI pro Bulk Operace

Rozšířit stránku objednávek o:
- Checkbox pro výběr více objednávek
- Bulk action "Vystavit faktury"
- Progress dialog při generování

### Úkoly

- [ ] Vytvořit bulk-create endpoint
- [ ] Přidat bulk selection do orders page
- [ ] Vytvořit BulkInvoiceDialog komponentu
- [ ] Progress tracking s WebSocket/polling

---

## 6. Dashboard a Reporty

### Popis
Přehledový dashboard s grafy a statistikami.

### Implementace

#### 6.1 Dashboard Data API

**Soubor**: `src/app/api/admin/invoices/stats/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Get invoice stats
    const [
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      monthlyRevenue,
      yearlyRevenue,
      recentInvoices
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'paid' } }),
      prisma.invoice.count({ where: { status: { in: ['sent', 'draft'] } } }),
      prisma.invoice.count({
        where: {
          status: { in: ['sent', 'overdue'] },
          dueDate: { lt: now }
        }
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'paid',
          paidDate: { gte: startOfMonth }
        },
        _sum: { paidAmount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'paid',
          paidDate: { gte: startOfYear }
        },
        _sum: { paidAmount: true }
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      })
    ])

    // Get monthly revenue for chart
    const monthlyData = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', paidDate) as month,
        SUM(paidAmount) as revenue
      FROM Invoice
      WHERE status = 'paid' AND paidDate >= ${startOfYear.toISOString()}
      GROUP BY strftime('%Y-%m', paidDate)
      ORDER BY month
    `

    return NextResponse.json({
      summary: {
        total: totalInvoices,
        paid: paidInvoices,
        unpaid: unpaidInvoices,
        overdue: overdueInvoices
      },
      revenue: {
        monthly: (monthlyRevenue._sum.paidAmount || 0) / 100,
        yearly: (yearlyRevenue._sum.paidAmount || 0) / 100
      },
      recentInvoices,
      chartData: monthlyData
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
```

#### 6.2 Dashboard Page

**Soubor**: `src/app/admin/invoices/dashboard/page.tsx`

Dashboard s:
- Kartičky s celkovými statistikami
- Graf měsíčních příjmů (pomocí Recharts)
- Seznam nedávných faktur
- Seznam faktur po splatnosti

### Úkoly

- [ ] Vytvořit stats API endpoint
- [ ] Nainstalovat Recharts
- [ ] Vytvořit dashboard page
- [ ] Přidat grafy příjmů
- [ ] Přidat seznam po splatnosti
- [ ] Přidat do navigace

---

## Harmonogram Implementace

### Týden 1: Webhooks + Auto Sync

| Den | Úkol |
|-----|------|
| 1 | Webhook endpoint + schema |
| 2 | Event system + handlery |
| 3 | Cron jobs + Vercel config |
| 4 | UI pro webhook config |
| 5 | Testování + debug |

### Týden 2: QR + Upomínky

| Den | Úkol |
|-----|------|
| 1 | QR generator + API |
| 2 | QR komponenta + integrace |
| 3 | Reminder schema + service |
| 4 | Reminder cron + UI |
| 5 | Testování |

### Týden 3: Bulk + Dashboard

| Den | Úkol |
|-----|------|
| 1 | Bulk create API |
| 2 | Bulk UI komponenty |
| 3 | Dashboard stats API |
| 4 | Dashboard page + grafy |
| 5 | Finální testování + dokumentace |

---

## Závislosti (npm packages)

```bash
npm install qrcode @types/qrcode recharts
```

---

## Environment Variables

```env
# Cron job authentication
CRON_SECRET=your-cron-secret-key

# Webhook (optional, can be generated)
VYFAKTURUJ_WEBHOOK_SECRET=generated-at-runtime
```

---

**Autor**: Claude
**Vytvořeno**: 2025-01-04
**Verze**: 1.0
