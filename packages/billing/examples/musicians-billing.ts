/**
 * Example: Musicians Vertical - Gig Invoice with Deposit
 */

import { InvoiceService, TaxService } from '../src/services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const invoiceService = new InvoiceService(prisma);
const taxService = new TaxService();

async function createGigInvoice() {
  // Scenario: Band performs at a wedding, requires 50% deposit

  // Calculate tax for Czech VAT
  const taxConfig = taxService.getTaxConfig('CZ', 'CZ', false);

  // Gig details
  const gigFee = 15000; // Base fee for 3-hour performance
  const travelFee = 1500; // Travel to venue
  const equipmentRental = 2000; // Sound system rental
  const subtotal = gigFee + travelFee + equipmentRental;

  const taxCalc = taxService.calculateTax(subtotal, taxConfig, 'CZK');

  // Create deposit invoice (50%)
  const depositInvoice = await invoiceService.createInvoice({
    tenantId: 'musician_tenant_123',
    type: 'DEPOSIT',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    seller: {
      name: 'Jazz Quartet CZ',
      street: 'Karlova 15',
      city: 'Prague',
      postalCode: '110 00',
      country: 'CZ',
      vatId: 'CZ12345678',
      companyId: '12345678',
    },
    buyer: {
      name: 'Wedding Planners Ltd',
      street: 'Masarykova 50',
      city: 'Brno',
      postalCode: '602 00',
      country: 'CZ',
    },
    items: [
      {
        id: '1',
        description: 'Wedding Performance - 3 hours (Deposit 50%)',
        quantity: 1,
        unitPrice: gigFee / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: gigFee / 2,
        taxAmount: (gigFee / 2) * (taxConfig.rate / 100),
        total: (gigFee / 2) * (1 + taxConfig.rate / 100),
      },
      {
        id: '2',
        description: 'Travel Fee (Deposit 50%)',
        quantity: 1,
        unitPrice: travelFee / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: travelFee / 2,
        taxAmount: (travelFee / 2) * (taxConfig.rate / 100),
        total: (travelFee / 2) * (1 + taxConfig.rate / 100),
      },
      {
        id: '3',
        description: 'Equipment Rental (Deposit 50%)',
        quantity: 1,
        unitPrice: equipmentRental / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: equipmentRental / 2,
        taxAmount: (equipmentRental / 2) * (taxConfig.rate / 100),
        total: (equipmentRental / 2) * (1 + taxConfig.rate / 100),
      },
    ],
    subtotal: subtotal / 2,
    taxAmount: taxCalc.taxAmount / 2,
    total: taxCalc.total / 2,
    currency: 'CZK',
    paymentTerm: 'NET_7',
    notes: 'Deposit invoice for wedding performance on June 15, 2024. Final invoice will be issued after the event.',
  });

  console.log('Deposit Invoice Created:', depositInvoice.invoiceNumber);

  // After event, create final invoice
  const finalInvoice = await invoiceService.createInvoice({
    tenantId: 'musician_tenant_123',
    type: 'FINAL',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    seller: depositInvoice.seller as any,
    buyer: depositInvoice.buyer as any,
    items: [
      {
        id: '1',
        description: 'Wedding Performance - 3 hours (Remaining 50%)',
        quantity: 1,
        unitPrice: gigFee / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: gigFee / 2,
        taxAmount: (gigFee / 2) * (taxConfig.rate / 100),
        total: (gigFee / 2) * (1 + taxConfig.rate / 100),
      },
      {
        id: '2',
        description: 'Travel Fee (Remaining 50%)',
        quantity: 1,
        unitPrice: travelFee / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: travelFee / 2,
        taxAmount: (travelFee / 2) * (taxConfig.rate / 100),
        total: (travelFee / 2) * (1 + taxConfig.rate / 100),
      },
      {
        id: '3',
        description: 'Equipment Rental (Remaining 50%)',
        quantity: 1,
        unitPrice: equipmentRental / 2,
        discount: 0,
        taxRate: taxConfig.rate,
        subtotal: equipmentRental / 2,
        taxAmount: (equipmentRental / 2) * (taxConfig.rate / 100),
        total: (equipmentRental / 2) * (1 + taxConfig.rate / 100),
      },
    ],
    subtotal: subtotal / 2,
    taxAmount: taxCalc.taxAmount / 2,
    total: taxCalc.total / 2,
    currency: 'CZK',
    paymentTerm: 'NET_14',
    notes: `Final invoice for wedding performance. Deposit invoice ${depositInvoice.invoiceNumber} already paid.`,
    relatedInvoiceId: depositInvoice.id,
  });

  console.log('Final Invoice Created:', finalInvoice.invoiceNumber);

  return { depositInvoice, finalInvoice };
}

// Run example
createGigInvoice()
  .then(() => console.log('✅ Musician billing example completed'))
  .catch(console.error);
