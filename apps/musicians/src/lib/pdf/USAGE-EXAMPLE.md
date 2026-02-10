# PDF Invoice Usage Examples

## Frontend Integration

### React Component - Download Button

```tsx
'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DownloadInvoiceButtonProps {
  invoiceId: string
  invoiceNumber: string
}

export function DownloadInvoiceButton({
  invoiceId,
  invoiceNumber
}: DownloadInvoiceButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `faktura-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF staženo')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Chyba při stahování PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="outline"
      size="sm"
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generuji PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Stáhnout PDF
        </>
      )}
    </Button>
  )
}
```

### Invoice List with Download

```tsx
'use client'

import { DownloadInvoiceButton } from './download-invoice-button'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  total: number
  customer: {
    firstName: string
    lastName: string
  }
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Číslo faktury
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zákazník
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Částka
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Akce
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invoice.invoiceNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.customer.firstName} {invoice.customer.lastName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(invoice.total / 100).toLocaleString('cs-CZ')} Kč
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DownloadInvoiceButton
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.invoiceNumber}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Open in New Tab (Preview)

```tsx
const handlePreview = async (invoiceId: string) => {
  const url = `/api/invoices/${invoiceId}/pdf`
  window.open(url, '_blank')
}
```

### Email Integration (Future)

```tsx
// Example of email integration
const handleEmailInvoice = async (invoiceId: string, email: string) => {
  try {
    const response = await fetch('/api/invoices/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, email })
    })

    if (response.ok) {
      toast.success('Faktura odeslána e-mailem')
    }
  } catch (error) {
    toast.error('Chyba při odesílání e-mailu')
  }
}
```

## Server-Side Usage

### API Route Example

```typescript
// app/api/invoices/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf'
import { sendEmail } from '@/lib/email'
import React from 'react'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId, email } = await request.json()

  // Get invoice and transform to PDF data
  // ... (similar to pdf/route.ts)

  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoicePDF, { data: pdfData })
  )

  // Send email with attachment
  await sendEmail({
    to: email,
    subject: `Faktura ${pdfData.invoiceNumber}`,
    html: '<p>V příloze zasíláme fakturu.</p>',
    attachments: [
      {
        filename: `faktura-${pdfData.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  return NextResponse.json({ success: true })
}
```

## Testing

### Manual Testing

1. Create a test invoice via the API or UI
2. Navigate to: `http://localhost:3007/api/invoices/[invoice-id]/pdf`
3. PDF should download automatically

### Automated Testing (Jest)

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf'
import React from 'react'
import { Button } from '@vertigo/ui'

describe('InvoicePDF', () => {
  it('should generate a PDF buffer', async () => {
    const testData = {
      invoiceNumber: 'TEST-001',
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
      },
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          unitPrice: 100000,
          total: 100000,
        },
      ],
      subtotal: 100000,
      taxRate: 21,
      taxAmount: 21000,
      total: 121000,
      tenant: {
        name: 'Test Company',
        email: 'info@test.com',
      },
    }

    const buffer = await renderToBuffer(
      React.createElement(InvoicePDF, { data: testData })
    )

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })
})
```

## Common Issues

### PDF Not Downloading

- Check browser console for errors
- Verify invoice ID is valid
- Check authentication (must be logged in)
- Verify tenant access

### Styling Issues

- Ensure all amounts are in cents (multiply by 100)
- Dates must be ISO strings
- Check tenant settings are properly configured

### Performance

- PDF generation takes ~500ms-2s depending on complexity
- Consider caching generated PDFs in production
- Use background jobs for bulk PDF generation

## Configuration

### Tenant Settings Required

For best results, configure these settings in the tenant's settings JSON:

```json
{
  "companyAddress": {
    "street": "Your Street 123",
    "city": "Prague",
    "zip": "11000",
    "country": "Czech Republic"
  },
  "bankAccount": "123456789/0100",
  "iban": "CZ65 0800 0000 1920 0014 5399",
  "swift": "GIBACZPX",
  "ico": "12345678",
  "dic": "CZ12345678"
}
```

### Environment Variables

No additional environment variables are required. Uses existing:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
