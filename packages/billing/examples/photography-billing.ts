/**
 * Example: Photography Vertical - Package Invoice with Add-ons
 */

import { InvoiceService, TaxService } from '../src/services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);
const taxService = new TaxService();

async function createPhotographyInvoice() {
  // Scenario: Wedding photography package with add-ons

  const taxConfig = taxService.getTaxConfig('CZ', 'CZ', false);

  const invoice = await invoiceService.createInvoice({
    tenantId: 'photo_tenant_123',
    type: 'STANDARD',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    seller: {
      name: 'Capture Moments Photography',
      street: 'Vinohradska 20',
      city: 'Prague',
      postalCode: '120 00',
      country: 'CZ',
      vatId: 'CZ87654321',
    },
    buyer: {
      name: 'John & Jane Smith',
      street: 'Dlouha 5',
      city: 'Prague',
      postalCode: '110 00',
      country: 'CZ',
    },
    items: [
      {
        id: '1',
        description: 'Premium Wedding Package - Full Day Coverage (8 hours)',
        quantity: 1,
        unitPrice: 25000,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: 25000,
        taxAmount: 25000 * (taxConfig.rate / 100),
        total: 25000 * (1 + taxConfig.rate / 100),
      },
      {
        id: '2',
        description: 'Photo Album - 30x30cm, 50 pages',
        quantity: 2,
        unitPrice: 3500,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: 7000,
        taxAmount: 7000 * (taxConfig.rate / 100),
        total: 7000 * (1 + taxConfig.rate / 100),
      },
      {
        id: '3',
        description: 'Printed Photos - 13x18cm',
        quantity: 100,
        unitPrice: 15,
        discount: 10, // 10% discount for bulk
        taxRate: taxConfig.rate,
        subtotal: 1350, // 100 * 15 - 10%
        taxAmount: 1350 * (taxConfig.rate / 100),
        total: 1350 * (1 + taxConfig.rate / 100),
      },
      {
        id: '4',
        description: 'Digital Files - High Resolution (USB)',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: 2000,
        taxAmount: 2000 * (taxConfig.rate / 100),
        total: 2000 * (1 + taxConfig.rate / 100),
      },
      {
        id: '5',
        description: 'Engagement Session - 2 hours',
        quantity: 1,
        unitPrice: 4000,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: 4000,
        taxAmount: 4000 * (taxConfig.rate / 100),
        total: 4000 * (1 + taxConfig.rate / 100),
      },
    ],
    subtotal: 39350,
    taxAmount: 39350 * (taxConfig.rate / 100),
    total: 39350 * (1 + taxConfig.rate / 100),
    currency: 'CZK',
    paymentTerm: 'NET_30',
    notes: `Wedding Photography Services

Date: June 15, 2024
Venue: Prague Castle
Coverage: 8:00 AM - 6:00 PM

Deliverables:
- 500+ edited photos (digital files)
- 2x photo albums
- 100x printed photos
- Engagement session photos

Delivery: 4 weeks after the event`,
  });

  console.log('Photography Invoice Created:', invoice.invoiceNumber);

  return invoice;
}

// Run example
createPhotographyInvoice()
  .then(() => console.log('✅ Photography billing example completed'))
  .catch(console.error);
