import { PrismaClient } from '@prisma/client';
import type { Invoice, CreateInvoiceInput } from '../types/invoice';
import { InvoiceService } from './invoice-service';

export type RecurrenceFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface RecurringInvoiceTemplate {
  id: string;
  tenantId: string;
  frequency: RecurrenceFrequency;
  nextInvoiceDate: Date;
  isActive: boolean;
  invoiceTemplate: Omit<CreateInvoiceInput, 'issueDate' | 'dueDate'>;
}

export class RecurringInvoiceService {
  private prisma: PrismaClient;
  private invoiceService: InvoiceService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.invoiceService = new InvoiceService(prisma);
  }

  /**
   * Calculate next invoice date based on frequency
   */
  calculateNextInvoiceDate(
    currentDate: Date,
    frequency: RecurrenceFrequency
  ): Date {
    const next = new Date(currentDate);

    switch (frequency) {
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  /**
   * Calculate due date based on payment terms
   */
  calculateDueDate(issueDate: Date, paymentTermDays: number): Date {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTermDays);
    return dueDate;
  }

  /**
   * Create recurring invoice template
   */
  async createTemplate(
    template: Omit<RecurringInvoiceTemplate, 'id'>
  ): Promise<RecurringInvoiceTemplate> {
    // In production, store in database
    // For now, return mock
    return {
      id: `rec_${Date.now()}`,
      ...template,
    };
  }

  /**
   * Generate invoices for all due recurring templates
   */
  async generateDueInvoices(): Promise<Invoice[]> {
    // In production:
    // 1. Query all active recurring templates where nextInvoiceDate <= today
    // 2. For each template, generate an invoice
    // 3. Update template's nextInvoiceDate
    // 4. Return generated invoices

    const generatedInvoices: Invoice[] = [];

    // Mock implementation
    return generatedInvoices;
  }

  /**
   * Generate single invoice from template
   */
  async generateFromTemplate(
    templateId: string
  ): Promise<Invoice> {
    // In production:
    // 1. Load template
    // 2. Create invoice from template
    // 3. Update template's nextInvoiceDate

    const now = new Date();
    const dueDate = this.calculateDueDate(now, 14); // Default 14 days

    // Mock invoice creation
    const mockInput: CreateInvoiceInput = {
      tenantId: 'mock',
      type: 'RECURRING',
      issueDate: now,
      dueDate,
      seller: {
        name: 'Mock Seller',
        street: 'Street',
        city: 'City',
        postalCode: '12345',
        country: 'CZ',
      },
      buyer: {
        name: 'Mock Buyer',
        street: 'Street',
        city: 'City',
        postalCode: '12345',
        country: 'CZ',
      },
      items: [],
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      currency: 'EUR',
      paymentTerm: 'NET_14',
    };

    return this.invoiceService.createInvoice(mockInput);
  }

  /**
   * Pause recurring template
   */
  async pauseTemplate(templateId: string): Promise<void> {
    // Update isActive to false
  }

  /**
   * Resume recurring template
   */
  async resumeTemplate(templateId: string): Promise<void> {
    // Update isActive to true
  }

  /**
   * Delete recurring template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    // Delete template
  }

  /**
   * Get all active templates for tenant
   */
  async getActiveTemplates(tenantId: string): Promise<RecurringInvoiceTemplate[]> {
    // Query active templates
    return [];
  }

  /**
   * Preview next invoice from template
   */
  async previewNextInvoice(templateId: string): Promise<Partial<Invoice>> {
    // Generate preview without saving
    const now = new Date();
    const dueDate = this.calculateDueDate(now, 14);

    return {
      issueDate: now,
      dueDate,
      status: 'DRAFT',
    };
  }
}
