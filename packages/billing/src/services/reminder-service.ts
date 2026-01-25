import { PrismaClient } from '@prisma/client';
import type { Invoice } from '../types/invoice';

export interface ReminderConfig {
  enabled: boolean;
  daysBeforeDue: number[]; // e.g., [7, 3, 1] - send reminders 7, 3, and 1 day before due
  daysAfterDue: number[]; // e.g., [1, 7, 14] - send reminders 1, 7, and 14 days after due
  emailTemplate?: string;
}

export interface ReminderLog {
  id: string;
  invoiceId: string;
  sentAt: Date;
  type: 'BEFORE_DUE' | 'AFTER_DUE';
  daysOffset: number;
  success: boolean;
  error?: string;
}

export class InvoiceReminderService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get default reminder configuration
   */
  getDefaultConfig(): ReminderConfig {
    return {
      enabled: true,
      daysBeforeDue: [7, 3, 1],
      daysAfterDue: [1, 7, 14, 30],
    };
  }

  /**
   * Check which invoices need reminders sent
   */
  async getInvoicesNeedingReminders(
    tenantId: string,
    config: ReminderConfig = this.getDefaultConfig()
  ): Promise<Invoice[]> {
    if (!config.enabled) {
      return [];
    }

    const now = new Date();
    const invoicesNeedingReminders: Invoice[] = [];

    // Get all unpaid invoices
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: {
          in: ['SENT', 'OVERDUE'],
        },
      },
    });

    for (const invoice of unpaidInvoices) {
      const dueDate = new Date(invoice.dueDate);
      const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if reminder should be sent before due date
      if (daysDiff > 0 && config.daysBeforeDue.includes(daysDiff)) {
        const alreadySent = await this.wasReminderSent(invoice.id, 'BEFORE_DUE', daysDiff);
        if (!alreadySent) {
          invoicesNeedingReminders.push(invoice as any);
        }
      }

      // Check if reminder should be sent after due date
      if (daysDiff < 0 && config.daysAfterDue.includes(Math.abs(daysDiff))) {
        const alreadySent = await this.wasReminderSent(invoice.id, 'AFTER_DUE', Math.abs(daysDiff));
        if (!alreadySent) {
          invoicesNeedingReminders.push(invoice as any);
        }
      }
    }

    return invoicesNeedingReminders;
  }

  /**
   * Check if reminder was already sent
   */
  private async wasReminderSent(
    invoiceId: string,
    type: 'BEFORE_DUE' | 'AFTER_DUE',
    daysOffset: number
  ): Promise<boolean> {
    // In production, check reminder_logs table
    // For now, return false (always send)
    return false;
  }

  /**
   * Send reminder for invoice
   */
  async sendReminder(
    invoice: Invoice,
    type: 'BEFORE_DUE' | 'AFTER_DUE',
    daysOffset: number
  ): Promise<ReminderLog> {
    try {
      // In production:
      // 1. Generate email from template
      // 2. Send email via email service
      // 3. Log the reminder

      const log: ReminderLog = {
        id: `rem_${Date.now()}`,
        invoiceId: invoice.id,
        sentAt: new Date(),
        type,
        daysOffset,
        success: true,
      };

      // Would save to database here
      return log;
    } catch (error) {
      return {
        id: `rem_${Date.now()}`,
        invoiceId: invoice.id,
        sentAt: new Date(),
        type,
        daysOffset,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send all due reminders for a tenant
   */
  async sendDueReminders(
    tenantId: string,
    config?: ReminderConfig
  ): Promise<{ sent: number; failed: number; logs: ReminderLog[] }> {
    const invoices = await this.getInvoicesNeedingReminders(tenantId, config);
    const logs: ReminderLog[] = [];
    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const type = daysDiff > 0 ? 'BEFORE_DUE' : 'AFTER_DUE';
      const daysOffset = Math.abs(daysDiff);

      const log = await this.sendReminder(invoice, type, daysOffset);
      logs.push(log);

      if (log.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed, logs };
  }

  /**
   * Generate reminder email content
   */
  generateReminderEmail(
    invoice: Invoice,
    type: 'BEFORE_DUE' | 'AFTER_DUE',
    daysOffset: number
  ): { subject: string; body: string } {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString();

    if (type === 'BEFORE_DUE') {
      return {
        subject: `Reminder: Invoice ${invoice.invoiceNumber} due in ${daysOffset} days`,
        body: `
Dear ${invoice.billingName},

This is a friendly reminder that invoice ${invoice.invoiceNumber} for ${invoice.total} ${invoice.currency} is due on ${dueDate} (in ${daysOffset} days).

Please ensure payment is made by the due date to avoid any late fees.

Thank you for your business!
        `.trim(),
      };
    } else {
      return {
        subject: `Overdue: Invoice ${invoice.invoiceNumber} - ${daysOffset} days past due`,
        body: `
Dear ${invoice.billingName},

Invoice ${invoice.invoiceNumber} for ${invoice.total} ${invoice.currency} was due on ${dueDate} and is now ${daysOffset} days overdue.

Please arrange payment as soon as possible.

If you have already paid, please disregard this reminder.

Thank you.
        `.trim(),
      };
    }
  }

  /**
   * Get reminder history for invoice
   */
  async getReminderHistory(invoiceId: string): Promise<ReminderLog[]> {
    // In production, query reminder_logs table
    return [];
  }
}
