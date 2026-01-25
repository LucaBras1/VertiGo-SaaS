import { PrismaClient } from '@prisma/client';
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFilter,
  InvoiceNumberFormat,
  InvoiceLineItem,
} from '../types/invoice';
import type { TaxConfig } from '../types/tax';

export class InvoiceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(
    tenantId: string,
    format?: InvoiceNumberFormat
  ): Promise<string> {
    const defaultFormat: InvoiceNumberFormat = {
      prefix: 'INV',
      separator: '-',
      yearFormat: 'YYYY',
      sequenceFormat: '0001',
    };

    const fmt = { ...defaultFormat, ...format };
    const year = new Date().getFullYear();
    const yearStr = fmt.yearFormat === 'YYYY' ? year.toString() :
                    fmt.yearFormat === 'YY' ? year.toString().slice(-2) : '';

    // Get last invoice number for this tenant and year
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        invoiceNumber: {
          startsWith: yearStr ? `${fmt.prefix}${fmt.separator}${yearStr}` : fmt.prefix,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      // Extract sequence number from last invoice
      const parts = lastInvoice.invoiceNumber.split(fmt.separator);
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      sequence = lastSeq + 1;
    }

    // Format sequence with leading zeros
    const seqStr = sequence.toString().padStart(fmt.sequenceFormat.length, '0');

    // Build invoice number
    const parts = [fmt.prefix];
    if (yearStr) parts.push(yearStr);
    parts.push(seqStr);
    if (fmt.suffix) parts.push(fmt.suffix);

    return parts.join(fmt.separator);
  }

  /**
   * Calculate line item totals
   */
  calculateLineItem(
    quantity: number,
    unitPrice: number,
    discount: number = 0,
    taxRate: number = 0
  ): Pick<InvoiceLineItem, 'subtotal' | 'taxAmount' | 'total'> {
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    return {
      subtotal: Math.round(afterDiscount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calculate invoice totals
   */
  calculateInvoiceTotals(items: InvoiceLineItem[]): {
    subtotal: number;
    taxAmount: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = items.reduce((sum, item) => sum + item.total, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Create invoice
   */
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    // Generate invoice number if needed
    const invoiceNumber = input.autoGenerateNumber
      ? await this.generateInvoiceNumber(input.tenantId)
      : `DRAFT-${Date.now()}`;

    // Calculate totals
    const { subtotal, taxAmount, total } = this.calculateInvoiceTotals(input.items);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId: input.tenantId,
        invoiceNumber,
        status: input.status || 'DRAFT',
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        subtotal,
        tax: taxAmount,
        total,
        currency: input.currency,
        billingName: input.buyer.name,
        billingEmail: input.buyer.email,
        billingAddress: `${input.buyer.street}, ${input.buyer.city}, ${input.buyer.postalCode}, ${input.buyer.country}`,
        billingVatId: input.buyer.vatId,
        billingCompanyId: input.buyer.companyId,
        notes: input.notes,
        orderId: input.orderId,
      },
    });

    return invoice as any; // Type conversion for demo
  }

  /**
   * Update invoice
   */
  async updateInvoice(input: UpdateInvoiceInput): Promise<Invoice> {
    const { id, ...data } = input;

    // Recalculate totals if items changed
    let updates: any = { ...data };
    if (data.items) {
      const totals = this.calculateInvoiceTotals(data.items);
      updates = { ...updates, ...totals };
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updates,
    });

    return invoice as any;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    return invoice as any;
  }

  /**
   * List invoices with filters
   */
  async listInvoices(filter: InvoiceFilter): Promise<Invoice[]> {
    const where: any = {
      tenantId: filter.tenantId,
    };

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.issueDate = {};
      if (filter.dateFrom) where.issueDate.gte = filter.dateFrom;
      if (filter.dateTo) where.issueDate.lte = filter.dateTo;
    }

    if (filter.search) {
      where.OR = [
        { invoiceNumber: { contains: filter.search, mode: 'insensitive' } },
        { billingName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.orderId) {
      where.orderId = filter.orderId;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return invoices as any;
  }

  /**
   * Mark invoice as sent
   */
  async markAsSent(invoiceId: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' },
    });

    return invoice as any;
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    invoiceId: string,
    paidAt?: Date,
    paymentMethod?: string,
    paymentReference?: string
  ): Promise<Invoice> {
    const invoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: paidAt || new Date(),
        paymentMethod: paymentMethod as any,
        paymentReference,
      },
    });

    return invoice as any;
  }

  /**
   * Check and update overdue invoices
   */
  async updateOverdueInvoices(tenantId: string): Promise<number> {
    const now = new Date();

    const result = await this.prisma.invoice.updateMany({
      where: {
        tenantId,
        status: 'SENT',
        dueDate: { lt: now },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    return result.count;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(invoiceId: string): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id: invoiceId },
    });
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(tenantId: string, year?: number): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalOverdue: number;
    currency: string;
  }> {
    const whereBase: any = { tenantId };

    if (year) {
      whereBase.issueDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    const [totalInvoiced, totalPaid, totalOverdue] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: whereBase,
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...whereBase, status: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...whereBase, status: 'OVERDUE' },
        _sum: { total: true },
      }),
    ]);

    return {
      totalInvoiced: totalInvoiced._sum.total?.toNumber() || 0,
      totalPaid: totalPaid._sum.total?.toNumber() || 0,
      totalOverdue: totalOverdue._sum.total?.toNumber() || 0,
      currency: 'EUR', // Default, should be fetched from tenant settings
    };
  }
}
