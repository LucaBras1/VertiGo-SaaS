import { PrismaClient, Decimal } from '@prisma/client';

// Type assertion for Prisma client with banking models (not yet in schema)
type PrismaWithBanking = PrismaClient & {
  bankAccount: any;
  bankTransaction: any;
  invoicePayment: any;
};
import type { BankAccount, BankTransaction, BankSyncResult } from '../../types/bank';
import { BankFactory } from './bank-factory';
import { AIPaymentMatcher, PaymentMatchSuggestion } from '../../ai/payment-matcher';

export class BankTransactionSyncService {
  private prisma: PrismaWithBanking;
  private factory: BankFactory;
  private matcher?: AIPaymentMatcher;

  constructor(prisma: PrismaClient, openaiKey?: string) {
    this.prisma = prisma as PrismaWithBanking;
    this.factory = new BankFactory();
    if (openaiKey) {
      this.matcher = new AIPaymentMatcher(openaiKey);
    }
  }

  /**
   * Sync transactions for a specific bank account
   */
  async syncAccount(
    bankAccount: BankAccount,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<BankSyncResult> {
    const startTime = Date.now();

    try {
      // Create bank client
      const client = this.factory.createClient(
        bankAccount.provider,
        bankAccount.credentials
      );

      // Default date range: last 30 days
      const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = dateTo || new Date();

      // Fetch transactions from bank
      const transactions = await client.fetchTransactions(from, to);

      // Import transactions to database
      let imported = 0;
      let matched = 0;

      for (const transaction of transactions) {
        // Check if transaction already exists
        const exists = await this.transactionExists(
          bankAccount.id,
          transaction.transactionId
        );

        if (!exists) {
          // Add tenantId to transaction
          transaction.tenantId = bankAccount.tenantId;
          transaction.bankAccountId = bankAccount.id;

          // Save to database
          const savedTransaction = await this.saveTransaction(transaction);

          imported++;

          // Try to match with existing invoices (only for credit transactions)
          if (transaction.type === 'CREDIT') {
            const matchResult = await this.attemptAutoMatch(savedTransaction);
            if (matchResult) {
              matched++;
            }
          }
        }
      }

      // Update bank account last sync time
      await this.updateLastSync(bankAccount.id);

      return {
        bankAccountId: bankAccount.id,
        success: true,
        transactionsImported: imported,
        transactionsMatched: matched,
        dateFrom: from,
        dateTo: to,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Bank sync error:', error);

      return {
        bankAccountId: bankAccount.id,
        success: false,
        transactionsImported: 0,
        transactionsMatched: 0,
        dateFrom: dateFrom || new Date(),
        dateTo: dateTo || new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Sync all active accounts for a tenant
   */
  async syncAllAccounts(tenantId: string): Promise<BankSyncResult[]> {
    const results: BankSyncResult[] = [];

    // Fetch all active bank accounts for tenant with autoSync enabled
    const accounts = await this.prisma.bankAccount.findMany({
      where: { tenantId, isActive: true, autoSync: true },
    });

    for (const account of accounts) {
      const result = await this.syncAccount(account as unknown as BankAccount);
      results.push(result);
    }

    return results;
  }

  /**
   * Get unmatched transactions for a tenant
   */
  async getUnmatchedTransactions(
    tenantId: string,
    options?: {
      bankAccountId?: string;
      limit?: number;
      offset?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ transactions: any[]; total: number }> {
    const where: any = {
      tenantId,
      isMatched: false,
      type: 'CREDIT', // Only show incoming payments
    };

    if (options?.bankAccountId) {
      where.bankAccountId = options.bankAccountId;
    }

    if (options?.dateFrom || options?.dateTo) {
      where.date = {};
      if (options?.dateFrom) where.date.gte = options.dateFrom;
      if (options?.dateTo) where.date.lte = options.dateTo;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
        include: {
          bankAccount: {
            select: {
              accountName: true,
              accountNumber: true,
            },
          },
        },
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);

    return { transactions, total };
  }

  /**
   * Get match suggestions for a transaction
   */
  async getMatchSuggestions(
    transactionId: string,
    tenantId: string
  ): Promise<PaymentMatchSuggestion[]> {
    const transaction = await this.prisma.bankTransaction.findFirst({
      where: { id: transactionId, tenantId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Find candidate invoices
    const candidateInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      include: {
        customer: true,
      },
    });

    // Use AI matcher if available, otherwise use rule-based matching
    if (this.matcher) {
      return this.matcher.findMatches(
        this.convertPrismaTransaction(transaction),
        candidateInvoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          total: Number(inv.totalAmount) / 100, // Convert from cents
          currency: 'CZK',
          dueDate: inv.dueDate,
          status: inv.status,
          billingName: inv.customer?.firstName
            ? `${inv.customer.firstName} ${inv.customer.lastName}`
            : 'Unknown',
        }))
      );
    }

    // Fallback: simple rule-based matching
    return this.simpleRuleBasedMatching(transaction, candidateInvoices);
  }

  /**
   * Manually match a transaction with an invoice
   */
  async matchTransaction(
    transactionId: string,
    invoiceId: string,
    tenantId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await this.prisma.bankTransaction.findFirst({
        where: { id: transactionId, tenantId },
      });

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      if (transaction.isMatched) {
        return { success: false, error: 'Transaction already matched' };
      }

      const invoice = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, tenantId },
      });

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      // Create payment record and update invoice in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Create InvoicePayment record
        await (tx as any).invoicePayment.create({
          data: {
            invoiceId,
            amount: Number(transaction.amount) * 100, // Convert to cents
            currency: transaction.currency,
            method: 'BANK_TRANSFER',
            status: 'COMPLETED',
            bankTransactionId: transactionId,
            completedAt: transaction.date,
          },
        });

        // Update transaction as matched
        await (tx as any).bankTransaction.update({
          where: { id: transactionId },
          data: {
            isMatched: true,
            matchedInvoiceId: invoiceId,
            matchedAt: new Date(),
            matchConfidence: 1.0, // Manual match = 100% confidence
            matchMethod: 'MANUAL',
          },
        });

        // Update invoice paid amount
        const transactionAmountCents = Number(transaction.amount) * 100;
        const newPaidAmount = ((invoice as any).paidAmount || 0) + transactionAmountCents;

        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newPaidAmount >= (invoice as any).total ? 'PAID' : 'SENT',
            paidDate: newPaidAmount >= (invoice as any).total ? new Date() : null,
          } as any,
        });
      });

      return { success: true };
    } catch (error) {
      console.error('Match transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unmatch a transaction from an invoice
   */
  async unmatchTransaction(
    transactionId: string,
    tenantId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await this.prisma.bankTransaction.findFirst({
        where: { id: transactionId, tenantId },
      });

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      if (!transaction.isMatched || !transaction.matchedInvoiceId) {
        return { success: false, error: 'Transaction not matched' };
      }

      const invoiceId = transaction.matchedInvoiceId;

      await this.prisma.$transaction(async (tx) => {
        // Delete the payment record
        await (tx as any).invoicePayment.deleteMany({
          where: { bankTransactionId: transactionId },
        });

        // Update transaction as unmatched
        await (tx as any).bankTransaction.update({
          where: { id: transactionId },
          data: {
            isMatched: false,
            matchedInvoiceId: null,
            matchedAt: null,
            matchConfidence: null,
            matchMethod: null,
          },
        });

        // Recalculate invoice paid amount
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
        }) as any;

        if (invoice) {
          const payments = (invoice as any).payments || [];
          const newPaidAmount = payments.reduce(
            (sum: number, p: any) => sum + p.amount,
            0
          );

          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              paidAmount: newPaidAmount,
              status: newPaidAmount >= (invoice as any).total ? 'PAID' : 'SENT',
              paidDate: newPaidAmount >= (invoice as any).total ? new Date() : null,
            } as any,
          });
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Unmatch transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if transaction already exists
   */
  private async transactionExists(
    bankAccountId: string,
    transactionId: string
  ): Promise<boolean> {
    const existing = await this.prisma.bankTransaction.findFirst({
      where: { bankAccountId, transactionId },
    });
    return !!existing;
  }

  /**
   * Save transaction to database
   */
  private async saveTransaction(transaction: BankTransaction): Promise<any> {
    return this.prisma.bankTransaction.create({
      data: {
        bankAccountId: transaction.bankAccountId,
        tenantId: transaction.tenantId,
        transactionId: transaction.transactionId,
        date: transaction.date,
        amount: new Decimal(transaction.amount),
        currency: transaction.currency,
        type: transaction.type,
        counterpartyName: transaction.counterpartyName,
        counterpartyAccount: transaction.counterpartyAccount,
        counterpartyBankCode: transaction.counterpartyBankCode,
        description: transaction.description,
        variableSymbol: transaction.variableSymbol,
        constantSymbol: transaction.constantSymbol,
        specificSymbol: transaction.specificSymbol,
        isMatched: false,
      },
    });
  }

  /**
   * Attempt to automatically match transaction with invoice
   */
  private async attemptAutoMatch(
    transaction: any
  ): Promise<boolean> {
    if (!transaction.variableSymbol) {
      return false;
    }

    // Find invoice by variable symbol (extracted from invoice number)
    const candidateInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: transaction.tenantId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
    });

    // Try to match by variable symbol
    for (const invoice of candidateInvoices) {
      const invoiceVS = invoice.invoiceNumber.replace(/\D/g, '');
      const txVS = transaction.variableSymbol?.replace(/\D/g, '');

      if (invoiceVS && txVS && invoiceVS === txVS) {
        // Check if amount matches
        const transactionAmountCents = Number(transaction.amount) * 100;
        const remainingAmount = (invoice as any).total - ((invoice as any).paidAmount || 0);

        if (Math.abs(transactionAmountCents - remainingAmount) <= 100) {
          // Within 1 CZK tolerance
          // Auto-match
          const result = await this.matchTransaction(
            transaction.id,
            invoice.id,
            transaction.tenantId
          );

          if (result.success) {
            // Update match method to AUTO
            await this.prisma.bankTransaction.update({
              where: { id: transaction.id },
              data: { matchMethod: 'AUTO_VS' },
            });
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Update last sync timestamp
   */
  private async updateLastSync(bankAccountId: string): Promise<void> {
    await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { lastSyncAt: new Date() },
    });
  }

  /**
   * Convert Prisma transaction to BankTransaction type
   */
  private convertPrismaTransaction(tx: any): BankTransaction {
    return {
      id: tx.id,
      bankAccountId: tx.bankAccountId,
      tenantId: tx.tenantId,
      transactionId: tx.transactionId,
      date: tx.date,
      amount: Number(tx.amount),
      currency: tx.currency,
      type: tx.type,
      counterpartyName: tx.counterpartyName,
      counterpartyAccount: tx.counterpartyAccount,
      counterpartyBankCode: tx.counterpartyBankCode,
      description: tx.description,
      variableSymbol: tx.variableSymbol,
      constantSymbol: tx.constantSymbol,
      specificSymbol: tx.specificSymbol,
      isMatched: tx.isMatched,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }

  /**
   * Simple rule-based matching without AI
   */
  private simpleRuleBasedMatching(
    transaction: any,
    invoices: any[]
  ): PaymentMatchSuggestion[] {
    const suggestions: PaymentMatchSuggestion[] = [];
    const txAmount = Number(transaction.amount) * 100; // Convert to cents

    for (const invoice of invoices) {
      const remainingAmount = (invoice as any).total - ((invoice as any).paidAmount || 0);
      let confidence = 0;
      const factors = {
        amountMatch: false,
        dateProximity: 999,
        vsMatch: false,
        nameMatch: false,
        textSimilarity: 0,
      };

      // Check amount match
      if (Math.abs(txAmount - remainingAmount) <= 100) {
        confidence += 0.4;
        factors.amountMatch = true;
      }

      // Check variable symbol
      if (transaction.variableSymbol && invoice.invoiceNumber) {
        const invoiceVS = invoice.invoiceNumber.replace(/\D/g, '');
        const txVS = transaction.variableSymbol.replace(/\D/g, '');
        if (invoiceVS === txVS) {
          confidence += 0.3;
          factors.vsMatch = true;
        }
      }

      // Check name match
      const customerName = invoice.customer
        ? `${invoice.customer.firstName} ${invoice.customer.lastName}`.toLowerCase()
        : '';
      const counterpartyName = (transaction.counterpartyName || '').toLowerCase();
      if (customerName && counterpartyName.includes(customerName.split(' ')[0])) {
        confidence += 0.2;
        factors.nameMatch = true;
      }

      // Check date proximity
      const daysDiff = Math.abs(
        (transaction.date.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      factors.dateProximity = Math.round(daysDiff);
      if (daysDiff <= 7) {
        confidence += 0.1;
      }

      if (confidence >= 0.5) {
        suggestions.push({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          confidence,
          reason: this.generateReason(factors),
          matchFactors: factors,
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate human-readable reason
   */
  private generateReason(factors: PaymentMatchSuggestion['matchFactors']): string {
    const reasons: string[] = [];

    if (factors.amountMatch) reasons.push('exact amount match');
    if (factors.vsMatch) reasons.push('variable symbol match');
    if (factors.nameMatch) reasons.push('customer name match');
    if (factors.dateProximity <= 3) reasons.push('date within 3 days');

    return reasons.join(', ') || 'no strong indicators';
  }

  /**
   * Schedule automatic syncs
   */
  async scheduleAutoSync(tenantId: string): Promise<void> {
    // This would typically use a job queue like BullMQ
    // For now, this is a placeholder for future implementation
    console.log(`Scheduling auto sync for tenant ${tenantId}`);
  }
}
