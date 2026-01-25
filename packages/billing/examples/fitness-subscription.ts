/**
 * Example: Fitness Vertical - Recurring Subscription Invoice
 */

import { RecurringInvoiceService, InvoiceService, TaxService } from '../src/services';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const recurringService = new RecurringInvoiceService(prisma);
const invoiceService = new InvoiceService(prisma);
const taxService = new TaxService();

async function createFitnessSubscription() {
  // Scenario: Monthly gym membership with personal training

  const taxConfig = taxService.getTaxConfig('CZ', 'CZ', false);

  // Create recurring invoice template
  const template = await recurringService.createTemplate({
    tenantId: 'fitness_tenant_123',
    frequency: 'MONTHLY',
    nextInvoiceDate: new Date(),
    isActive: true,
    invoiceTemplate: {
      tenantId: 'fitness_tenant_123',
      type: 'RECURRING',
      seller: {
        name: 'FitZone Gym',
        street: 'Sportovni 10',
        city: 'Prague',
        postalCode: '130 00',
        country: 'CZ',
        vatId: 'CZ11223344',
      },
      buyer: {
        name: 'Martin Novak',
        email: 'martin.novak@example.com',
        street: 'Narodni 15',
        city: 'Prague',
        postalCode: '110 00',
        country: 'CZ',
      },
      items: [
        {
          id: '1',
          description: 'Premium Gym Membership - Monthly',
          quantity: 1,
          unitPrice: 1500,
          discount: 0,
          taxRate: taxConfig.rate,
          subtotal: 1500,
          taxAmount: 1500 * (taxConfig.rate / 100),
          total: 1500 * (1 + taxConfig.rate / 100),
        },
        {
          id: '2',
          description: 'Personal Training Sessions (4x per month)',
          quantity: 4,
          unitPrice: 500,
          discount: 0,
          taxRate: taxConfig.rate,
          subtotal: 2000,
          taxAmount: 2000 * (taxConfig.rate / 100),
          total: 2000 * (1 + taxConfig.rate / 100),
        },
        {
          id: '3',
          description: 'Nutrition Consultation',
          quantity: 1,
          unitPrice: 800,
          discount: 0,
          taxRate: taxConfig.rate,
          subtotal: 800,
          taxAmount: 800 * (taxConfig.rate / 100),
          total: 800 * (1 + taxConfig.rate / 100),
        },
      ],
      subtotal: 4300,
      taxAmount: 4300 * (taxConfig.rate / 100),
      total: 4300 * (1 + taxConfig.rate / 100),
      currency: 'CZK',
      paymentTerm: 'NET_7',
      notes: 'Monthly subscription - auto-renews until cancelled',
    },
  });

  console.log('Recurring Template Created:', template.id);

  // Generate first invoice
  const invoice = await recurringService.generateFromTemplate(template.id);

  console.log('First Invoice Generated:', invoice.invoiceNumber);

  // Simulate automated monthly generation
  console.log('\n📅 Scheduled: Generate invoice on', template.nextInvoiceDate);
  console.log('Frequency:', template.frequency);

  return { template, invoice };
}

// Run example
createFitnessSubscription()
  .then(() => console.log('✅ Fitness subscription example completed'))
  .catch(console.error);
