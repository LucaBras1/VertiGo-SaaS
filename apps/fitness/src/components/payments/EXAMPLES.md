# Payment Components - Usage Examples

Praktické příklady použití všech payment komponent.

## Import

```tsx
// Import jednotlivých komponent
import { BuyPackageButton } from '@/components/payments/BuyPackageButton'
import { PayInvoiceButton } from '@/components/payments/PayInvoiceButton'
import { PaySessionButton } from '@/components/payments/PaySessionButton'
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge'

// Nebo všechny najednou
import {
  BuyPackageButton,
  PayInvoiceButton,
  PaySessionButton,
  PaymentStatusBadge,
  PaymentMethodsCard,
  RecentPaymentsTable,
} from '@/components/payments'
```

---

## BuyPackageButton

### Basic Usage
```tsx
<BuyPackageButton
  packageId={pkg.id}
  clientId={client.id}
/>
```

### Custom Text
```tsx
<BuyPackageButton
  packageId={pkg.id}
  clientId={client.id}
>
  Koupit balíček
</BuyPackageButton>
```

### Custom Styling
```tsx
<BuyPackageButton
  packageId={pkg.id}
  clientId={client.id}
  className="w-full bg-blue-600 hover:bg-blue-700"
>
  Zakoupit za {pkg.price} Kč
</BuyPackageButton>
```

### In Card Layout
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
  <p className="text-gray-600 mb-4">{pkg.description}</p>

  <div className="flex items-center justify-between">
    <span className="text-2xl font-bold">{pkg.price} Kč</span>
    <BuyPackageButton
      packageId={pkg.id}
      clientId={client.id}
    />
  </div>
</div>
```

### With Confirmation Modal
```tsx
const [showConfirm, setShowConfirm] = useState(false)

<>
  <button onClick={() => setShowConfirm(true)}>
    Koupit balíček
  </button>

  {showConfirm && (
    <div className="modal">
      <h3>Potvrďte nákup</h3>
      <p>Opravdu chcete zakoupit balíček za {pkg.price} Kč?</p>

      <BuyPackageButton
        packageId={pkg.id}
        clientId={client.id}
      >
        Ano, zaplatit
      </BuyPackageButton>

      <button onClick={() => setShowConfirm(false)}>
        Zrušit
      </button>
    </div>
  )}
</>
```

---

## PayInvoiceButton

### Basic Usage
```tsx
<PayInvoiceButton invoiceId={invoice.id} />
```

### In Invoice Table
```tsx
<table>
  <tbody>
    {invoices.map((invoice) => (
      <tr key={invoice.id}>
        <td>{invoice.invoiceNumber}</td>
        <td>{invoice.total} Kč</td>
        <td>
          {invoice.status === 'paid' ? (
            <PaymentStatusBadge status="paid" />
          ) : (
            <PayInvoiceButton invoiceId={invoice.id} />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Custom Styling
```tsx
<PayInvoiceButton
  invoiceId={invoice.id}
  className="bg-green-600 hover:bg-green-700"
>
  Zaplatit {invoice.total} Kč
</PayInvoiceButton>
```

### With Invoice Details
```tsx
<div className="invoice-card">
  <div className="header">
    <h3>Faktura {invoice.invoiceNumber}</h3>
    <PaymentStatusBadge status={invoice.status} />
  </div>

  <div className="details">
    <p>Částka: {invoice.total} Kč</p>
    <p>Splatnost: {formatDate(invoice.dueDate)}</p>
  </div>

  {invoice.status !== 'paid' && (
    <PayInvoiceButton invoiceId={invoice.id} />
  )}
</div>
```

---

## PaySessionButton

### Basic Usage
```tsx
<PaySessionButton sessionId={session.id} />
```

### In Sessions Table
```tsx
<table>
  <tbody>
    {sessions.map((session) => (
      <tr key={session.id}>
        <td>{formatDate(session.scheduledAt)}</td>
        <td>{session.client.name}</td>
        <td>{session.price} Kč</td>
        <td>
          {session.paid ? (
            <PaymentStatusBadge status="paid" />
          ) : (
            <PaySessionButton sessionId={session.id} />
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Small Variant
```tsx
<PaySessionButton
  sessionId={session.id}
  className="text-xs px-2 py-1"
>
  Pay
</PaySessionButton>
```

---

## PaymentStatusBadge

### All Statuses
```tsx
<div className="flex gap-2">
  <PaymentStatusBadge status="unpaid" />
  <PaymentStatusBadge status="partial" />
  <PaymentStatusBadge status="paid" />
</div>
```

### Dynamic Status
```tsx
<PaymentStatusBadge
  status={order.paymentStatus as 'unpaid' | 'partial' | 'paid'}
/>
```

### With Tooltip
```tsx
<div className="relative group">
  <PaymentStatusBadge status={invoice.status} />

  <div className="tooltip">
    {invoice.status === 'paid'
      ? `Zaplaceno ${formatDate(invoice.paidDate)}`
      : `Splatnost ${formatDate(invoice.dueDate)}`
    }
  </div>
</div>
```

---

## PaymentMethodsCard

### Basic Usage
```tsx
<PaymentMethodsCard />
```

### In Dashboard Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <RecentPaymentsTable payments={payments} />
  </div>

  <div className="lg:col-span-1">
    <PaymentMethodsCard />
  </div>
</div>
```

---

## RecentPaymentsTable

### Basic Usage
```tsx
const [payments, setPayments] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/payments/history')
    .then(res => res.json())
    .then(data => {
      setPayments(data.payments)
      setLoading(false)
    })
}, [])

<RecentPaymentsTable
  payments={payments}
  loading={loading}
/>
```

### With Pagination
```tsx
const [page, setPage] = useState(1)
const limit = 10

useEffect(() => {
  fetch(`/api/payments/history?limit=${limit}&offset=${(page - 1) * limit}`)
    .then(res => res.json())
    .then(data => setPayments(data.payments))
}, [page])

<>
  <RecentPaymentsTable payments={payments} />

  <Pagination
    currentPage={page}
    onPageChange={setPage}
  />
</>
```

### Custom Empty State
```tsx
{payments.length === 0 && !loading ? (
  <div className="text-center py-8">
    <p>Žádné platby zatím nebyly provedeny.</p>
    <Link href="/dashboard/packages">
      Prohlédnout balíčky
    </Link>
  </div>
) : (
  <RecentPaymentsTable payments={payments} loading={loading} />
)}
```

---

## Complete Example - Package Purchase Flow

```tsx
'use client'

import { useState } from 'react'
import { BuyPackageButton, PaymentStatusBadge } from '@/components/payments'

interface Package {
  id: string
  name: string
  description: string
  price: number
  credits: number
  features: string[]
}

export default function PackagesPage({
  packages,
  clientId,
}: {
  packages: Package[]
  clientId: string
}) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Vyberte balíček</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-lg shadow-lg p-6 border-2 hover:border-blue-500 transition-colors"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold">{pkg.name}</h3>
              <p className="text-gray-600 mt-2">{pkg.description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600">
                {pkg.price} Kč
              </div>
              <div className="text-sm text-gray-500">
                {pkg.credits} kreditů
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <BuyPackageButton
              packageId={pkg.id}
              clientId={clientId}
              className="w-full"
            >
              Koupit balíček
            </BuyPackageButton>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Complete Example - Invoice List

```tsx
'use client'

import { PayInvoiceButton, PaymentStatusBadge } from '@/components/payments'
import { formatDate } from '@/lib/utils'

export default function InvoicesPage({ invoices }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Faktury</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Číslo</th>
              <th className="px-6 py-3 text-left">Klient</th>
              <th className="px-6 py-3 text-left">Částka</th>
              <th className="px-6 py-3 text-left">Splatnost</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4">
                  {invoice.client.name}
                </td>
                <td className="px-6 py-4 font-semibold">
                  {invoice.total} Kč
                </td>
                <td className="px-6 py-4">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-4">
                  <PaymentStatusBadge
                    status={invoice.status === 'paid' ? 'paid' : 'unpaid'}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  {invoice.status !== 'paid' && (
                    <PayInvoiceButton invoiceId={invoice.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Error Handling Example

```tsx
'use client'

import { useState } from 'react'
import { BuyPackageButton } from '@/components/payments'
import toast from 'react-hot-toast'

export default function PackageCard({ pkg, clientId }) {
  const [error, setError] = useState<string | null>(null)

  const handlePaymentError = () => {
    setError('Platba se nezdařila. Zkuste to prosím znovu.')
    toast.error('Platba se nezdařila')
  }

  return (
    <div className="package-card">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <BuyPackageButton
        packageId={pkg.id}
        clientId={clientId}
        onError={handlePaymentError}
      />
    </div>
  )
}
```

---

## Tip: React Query Integration

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'

export function usePaymentHistory() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await fetch('/api/payments/history')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })
}

// Usage
const { data, isLoading } = usePaymentHistory()

<RecentPaymentsTable
  payments={data?.payments || []}
  loading={isLoading}
/>
```

---

**Pro více informací viz [STRIPE_INTEGRATION.md](../STRIPE_INTEGRATION.md)**
