# PDF Invoice Generation

This module provides professional PDF invoice generation for the GigBook musicians app.

## Features

- **Professional Design**: Clean, modern invoice layout with proper Czech formatting
- **Czech Localization**: All labels in Czech (Faktura, Odběratel, etc.)
- **Currency Formatting**: Proper CZK formatting (e.g., "12 500,00 Kč")
- **Date Formatting**: Czech date format (DD.MM.YYYY)
- **Tax Calculation**: Automatic DPH (VAT) calculation
- **Bank Details**: Payment information with variable symbol
- **Company Info**: Full tenant/company details including IČO, DIČ
- **Customer Info**: Complete customer information
- **Notes Support**: Optional notes section
- **Responsive Layout**: Professional A4 layout

## Files

- `invoice-styles.ts` - PDF styling using @react-pdf/renderer
- `invoice-pdf.tsx` - PDF document component
- `index.ts` - Exports for easy imports

## API Endpoint

### GET /api/invoices/[id]/pdf

Downloads an invoice as a PDF file.

**Authentication**: Required (session)

**Parameters**:
- `id` - Invoice ID

**Response**:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="faktura-INV-2024-0001.pdf"`

**Example**:
```typescript
// From a React component
const downloadPDF = async (invoiceId: string) => {
  const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${invoiceId}.pdf`
  a.click()
}
```

## Usage

### Direct Usage (Server-side)

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf'
import React from 'react'

const pdfData = {
  invoiceNumber: 'INV-2024-0001',
  issueDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  customer: {
    name: 'Jan Novák',
    email: 'jan@example.com',
  },
  items: [
    {
      description: 'Hudební vystoupení - svatba',
      quantity: 1,
      unitPrice: 1500000, // in cents (15,000 CZK)
      total: 1500000,
    },
  ],
  subtotal: 1500000,
  taxRate: 21,
  taxAmount: 315000,
  total: 1815000,
  tenant: {
    name: 'Můj Band',
    email: 'info@mojband.cz',
  },
}

const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { data: pdfData }))
```

## Data Structure

### InvoiceData Interface

```typescript
interface InvoiceData {
  // Invoice details
  invoiceNumber: string
  issueDate: string        // ISO date string
  dueDate: string          // ISO date string
  variableSymbol?: string  // Payment variable symbol

  // Customer information
  customer: {
    name: string
    address?: string
    email?: string
    phone?: string
    ico?: string           // Company ID
    dic?: string           // VAT ID
  }

  // Line items
  items: Array<{
    description: string
    quantity: number
    unitPrice: number      // in cents
    total: number          // in cents
  }>

  // Totals (all in cents)
  subtotal: number
  taxRate: number          // percentage (e.g., 21 for 21%)
  taxAmount: number
  total: number

  // Additional info
  notes?: string
  bankAccount?: string

  // Tenant/Company information
  tenant: {
    name: string
    address?: string
    ico?: string
    dic?: string
    email?: string
    phone?: string
    website?: string
    bankAccount?: string
    iban?: string
    swift?: string
  }
}
```

## Tenant Settings

The PDF generator reads company information from the tenant's settings JSON field:

```json
{
  "companyAddress": {
    "street": "Hlavní 123",
    "city": "Praha",
    "zip": "11000",
    "country": "Česká republika"
  },
  "bankAccount": "123456789/0100",
  "iban": "CZ65 0800 0000 1920 0014 5399",
  "swift": "GIBACZPX",
  "ico": "12345678",
  "dic": "CZ12345678"
}
```

## Styling

The PDF uses a professional color scheme:

- **Primary Text**: Gray-900 (#111827)
- **Secondary Text**: Gray-600 (#4b5563)
- **Borders**: Gray-200 (#e5e7eb)
- **Headers**: Gray-100 (#f3f4f6)
- **Success (Total)**: Green-600 (#059669)
- **Bank Info**: Green background (#f0fdf4)
- **Notes**: Amber background (#fef3c7)

## Currency & Date Formatting

- **Currency**: Amounts are stored in cents and formatted as "12 500,00 Kč"
- **Dates**: Formatted as "DD.MM.YYYY" (Czech format)
- **Variable Symbol**: Auto-generated from invoice number

## Error Handling

The API route includes comprehensive error handling:

- **401 Unauthorized**: Missing or invalid session
- **404 Not Found**: Invoice or tenant not found
- **500 Server Error**: PDF generation failure

## Testing

To test the PDF generation:

1. Create an invoice via the API or UI
2. Navigate to `/api/invoices/[invoice-id]/pdf`
3. PDF should download automatically

## Future Enhancements

- [ ] Logo support
- [ ] Multiple language support
- [ ] Custom templates
- [ ] Email integration
- [ ] Signature support
- [ ] QR code for payment
- [ ] PDF storage in database
